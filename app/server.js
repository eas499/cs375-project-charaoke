let axios = require("axios");
let request = require("request");
let express = require("express");
let levenshtein = require("js-levenshtein");
let env = require("../env.json");
let { Pool } = require("pg");

// make this script's dir the cwd
// b/c npm run start doesn't cd into src/ to run this
// and if we aren't in its cwd, all relative paths will break
process.chdir(__dirname);

let port = 3000;
let host;
let redirect_uri;
let databaseConfig;
// fly.io sets NODE_ENV to production automatically, otherwise it's unset when running locally
if (process.env.NODE_ENV == "production") {
	host = "0.0.0.0";
    redirect_uri = "https://charaoke.fly.dev/auth/callback";
	databaseConfig = { connectionString: process.env.DATABASE_URL };
} else {
	host = "localhost";
    redirect_uri = "http://127.0.0.1:3000/auth/callback";
	let { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT } = process.env;
	databaseConfig = { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT };
}

let app = express();
app.use(express.static("public"));
app.use(express.json());

var spotify_token, spotify_search_token;

// uncomment these to debug
// console.log(JSON.stringify(process.env, null, 2));
// console.log(JSON.stringify(databaseConfig, null, 2));

let pool = new Pool(databaseConfig);
pool.connect().then(() => {
	console.log("Connected to db");
});

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get('/auth/login', (req, res) => {
    var scope = "streaming user-read-email user-read-private";
    var state = generateRandomString(16);

    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: env["spotify"]["client_id"],
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
    })

    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
});

app.get('/auth/callback', (req, res) => {
    var code = req.query.code;

    var authOptions = {
        url: env["spotify"]["token_url"],
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(env["spotify"]["client_id"] + ':' + env["spotify"]["client_secret"]).toString('base64')),
            'Content-Type' : 'application/x-www-form-urlencoded'
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            spotify_token = body.access_token;
            res.redirect('/')
        }
    });
});

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
    spotify_search_token = body.access_token;
});

function getLrcLibResults(url) {
    return axios.get(url).then(response => response.data);
}

function getSpotifyResults(url) {
    return axios.get(url, {
        headers: {
            'Authorization': 'Bearer ' + spotify_search_token
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
                        uri: song.uri
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

let currentSong = null;
app.post("/select_song", (req, res) => {
    currentSong = req.body.song;
    res.status(200).send();
});
app.get("/get_token_and_song", (req, res) => {
    res.json({ song: currentSong, token: spotify_token });
});

app.listen(port, host, () => {
    console.log(`http://${host}:${port}`);
});
