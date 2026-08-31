function goToMain() {
    window.location.href = "/index.html";
}

const MAX_TO_DISPLAY = 10;
function displayTopSongs() {
    fetch("/get_top_songs").then((response) => {
        return response.json();
    }).then((body) => {
        const topSongs = body.data;
        const song_list = document.getElementById("song_results");
        song_list.textContent = "";
        for (let i = 0; i < Math.min(topSongs.length, MAX_TO_DISPLAY); i++) {
            topSongs[i].demo = false;
            console.log(topSongs[i]);
            song_list.append(createSongEntry(topSongs[i]));
        }
    });
}
displayTopSongs();

function playSong(song) {
    song["mode"] = "lyric";
    fetch("/select_song", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song: song })
    }).then(() => {
        window.location.href = "/game.html";
    });
}

function createP(text) {
    let p = document.createElement("p");
    p.textContent = text;
    return p;
}

function timeFormat(t) {
    let m = Math.floor(t / 60);
    let s = t % 60;
    if (s < 10) {
        s = "0" + s;
    }
    return m + "'" + s + "\"";
}

function createSongEntry(song) {
    let song_div = document.createElement("div");
    song_div.class = "song";
    let song_button = document.createElement("button");
    song_button.classList.add("song_button");
    song_button.append(createP(`${song.spotify_name} (${song.artist})`));
    if (song.hasOwnProperty("num_plays")) {
        song_button.append(createP(`Duration: ${timeFormat(song.duration)} | Plays: ${song.num_plays}`));
    } else {
        song_button.append(createP(`Duration: ${timeFormat(song.duration)}`));
    }
    song_button.onclick = function(){playSong(song)};
    song_div.append(song_button);
    //song_div.append(createLeaderboardButton()); //TODO: implement later
    return song_div;
}

let input = document.getElementById("song_search");
input.addEventListener("keypress", function(event) {
    if (event.key == "Enter") {
        event.preventDefault();
        updateResults(input);
    }
});

function searchButtonPressed() {
    updateResults(input);
}

function updateResults(el) {
    const search_input = el.value;
    let songs = []
    if (search_input == "") {
        let msg = document.getElementById("message");
        msg.innerText = "No results found, displaying most played songs instead";
        displayTopSongs();
    } else if (search_input == "DEMO") {
        // get the crazy alphabet song
        const song_list = document.getElementById("song_results");
        song_list.append(createSongEntry(demo_song));
    } else {
        fetch(`/get_songs?search=${search_input}`).then((response) => {
            return response.json();
        }).then((body) => {
            songs = body.songs;
            let msg = document.getElementById("message");
            if (songs.length == 0) {
                msg.innerText = "No results found, displaying most played songs instead";
                displayTopSongs();
                return null;
            } else {
                msg.innerText = "";
            }
            const song_list = document.getElementById("song_results");
            song_list.textContent = "";
            for (let i = 0; i < songs.length; i++) {
                songs[i].demo = false;
                console.log(songs[i]);
                song_list.append(createSongEntry(songs[i]));
            }
        }).catch((error) => {
            console.log(error.message);
        });
    }
}

