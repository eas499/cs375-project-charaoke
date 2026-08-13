function displayTopSongs() {
    //TODO: implement
    //get top songs from SQL database
}

function createSongEntry(song) {
    let song_div = document.createElement("div");
    song_div.class = "song";
    let button1 = document.createElement("button");
    button1.class = "song_button";
    button1.textContent = song.spotify_name;
    song_div.append(button1);
    //song_div.append(createLeaderboardButton()); //TODO: implement later
    return song_div;
}

function updateResults(el) {
    const search_input = el.value;
    if (search_input == "") {
        displayTopSongs();
    } else {
        fetch(`/get_songs?search=${search_input}`).then((response) => {
            console.log(search_input);
            return response.json();
        }).then((body) => {
            const songs = body.songs;
            if (songs.length == 0) {
                displayTopSongs();
                return null;
            }
            const song_list = document.getElementById("song_results");
            song_list.textContent = "";
            for (let song of body.songs) {
                song_list.append(createSongEntry(song));
            }
        });
    }
}
