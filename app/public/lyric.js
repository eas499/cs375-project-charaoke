function displayTopSongs() {
    //TODO: implement
    //get top songs from SQL database
}

function playSong(song) {
    song["mode"] = "lyric";
    console.log(song);
    fetch("/select_song", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song: song })
    }).then(() => {
        window.location.href = "/game.html";
    });
}

function createSongEntry(song) {
    console.log(song);
    let song_div = document.createElement("div");
    song_div.class = "song";
    let button1 = document.createElement("button");
    button1.classList.add("song_button");
    button1.textContent = song.spotify_name;
    button1.onclick = function(){playSong(song)};
    console.log(button1);
    song_div.append(button1);
    //song_div.append(createLeaderboardButton()); //TODO: implement later
    return song_div;
}

function updateResults(el) {
    const search_input = el.value;
    let songs = []
    if (search_input == "") {
        displayTopSongs();
    } else {
        fetch(`/get_songs?search=${search_input}`).then((response) => {
            return response.json();
        }).then((body) => {
            songs = body.songs;
            if (songs.length == 0) {
                displayTopSongs();
                return null;
            }
            const song_list = document.getElementById("song_results");
            song_list.textContent = "";
            for (let i = 0; i < songs.length; i++) {
                console.log(songs[i]);
                song_list.append(createSongEntry(songs[i]));
            }
        });
    }
}
