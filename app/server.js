let axios = require("axios");
let express = require("express");
let env = require("../env.json");

let hostname = "localhost";
let port = 3000;
let app = express();

var spotify_token;

app.use(express.static("public"));

fetch(env["spotify"]["token_url"], {
    method: 'POST',
    body: new URLSearchParams({
        'grant_type': 'client_credentials',
    }),
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(env["spotify"]["client_id"] + ':' + env["spotify"]["client_secret"]).toString('base64'))
    }
}).then(response => {
    return response.json();
}).then(body => {
    spotify_token = body.access_token;
    console.log(spotify_token);
});

function getLrcLibResults(url) {
    return axios.get(url).then(response => response.data);
}

function getSpotifyResults(url) {
    return axios.get(url, {
        headers: {
            'Authorization': 'Bearer ' + spotify_token
        }
    }).then(response => response.data);
}

const MS_DURATION_BUFFER = 1000;
app.get("/get_songs", async (req, res) => {
    try {
        const search_query = req.query["search"];
        const lrclib_url = `${env["lrclib"]["url"]}/search?q=${search_query}`;
        const spotify_url = `${env["spotify"]["search_url"]}?q=${search_query}&type=track`;

        const [lrclib_results, spotify_results] = await Promise.all([
            getLrcLibResults(lrclib_url),
            getSpotifyResults(spotify_url)
        ]);

        console.log("lrclib", lrclib_results);
        console.log("spotify", spotify_results.tracks.items);

        songs = [];
        for (let lrc of lrclib_results) {
            if (lrc.syncedLyrics == null) { continue; }
            lrc_duration_ms = lrc.duration * 1000;
            for (let song of spotify_results.tracks.items) {
                if (Math.abs(song.duration_ms - lrc_duration_ms) < MS_DURATION_BUFFER) {
                    songs.push({
                        lrclib_name: lrc.name,
                        spotify_name: song.name,
                        duration: lrc.duration,
                        lyrics: lrc.syncedLyrics,
                        href: song.href
                    });
                }
            }
        }

        res.json({"songs": songs});
    } catch (error) {
        if (error.hasOwnProperty("request") && error.request.hasOwnProperty("host")) {
            console.log(error.request.host);
        }
        console.log(error.message);
        res.status(400).send();
    }
});

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
