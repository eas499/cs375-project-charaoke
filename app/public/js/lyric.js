function goToMain() {
    window.location.href = "/index.html";
}

function displayTopSongs() {
    //TODO: implement
    //get top songs from SQL database
}

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

function createSongEntry(song) {
    let song_div = document.createElement("div");
    song_div.class = "song";
    let song_button = document.createElement("button");
    song_button.classList.add("song_button");
    song_button.append(createP(song.spotify_name));
    song_button.append(createP(song.artist));
    song_button.onclick = function(){playSong(song)};
    song_div.append(song_button);
    //song_div.append(createLeaderboardButton()); //TODO: implement later
    return song_div;
}

function updateResults(el) {
    const search_input = el.value;
    let songs = []
    if (search_input == "") {
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
            if (songs.length == 0) {
                displayTopSongs();
                return null;
            }
            const song_list = document.getElementById("song_results");
            song_list.textContent = "";
            for (let i = 0; i < songs.length; i++) {
                songs[i].demo = false;
                console.log(songs[i]);
                song_list.append(createSongEntry(songs[i]));
            }
        });
    }
}

let demo_song = {
    demo: true,
    spotify_name: "Alphabet Lore",
    lyrics: "[00:02.84] A, B, C, D, E, F, G" +
"[00:05.57] Watch out for F, he's kinda scary" +
"[00:08.17] H, I, J, K, L, M, N, O, P" + 
"[00:10.88] Let's transform, we'll save you from the beast" +
"[00:13.43] Q, R, S, T, U, V" +
"[00:15.93] Don't let him get the gems, he's gonna go crazy" +
"[00:18.78] W, X, Y, and Z" +
"[00:21.46] We can stop him, you and me" +
"[00:24.52] The Alphabet Lore, from A to Z" +
"[00:27.37] We gotta stop F from going crazy" +
"[00:29.92] The Alphabet Lore, L, M, N, O, P" +
"[00:32.66] We'll use their powers to save you and me" +
"[00:35.80] We gotta help everyone" +
"[00:38.27] Don't let F destroy everyone" +
"[00:41.13] It's the Alphabet Lore" +
"[00:43.66] Yeah, it's the Alphabet Lore" +
"[00:45.46] A, B, C, D, E, F, G" +
"[00:48.21] Watch out for F, he's kinda scary" +
"[00:50.99] H, I, J, K, L, M, N, O, P" +
"[00:53.53] Let's transform, we'll save you from the beast" +
"[00:56.22] Q, R, S, T, U, V" +
"[00:58.97] Don't let him get the gems, he's gonna go crazy" +
"[01:01.42] W, X, Y, and Z" +
"[01:04.04] We can stop him, you and me" +
"[01:06.94] Don't forget when we were best friends" +
"[01:09.13] Can we go back, yeah, you don't have to attack us" +
"[01:12.19] We'll all give you some plushies" +
"[01:14.39] You can get Foxy or you can get Boxy" +
"[01:17.69] Can we just be friends?" +
"[01:20.06] We'll be kind to each other, watch out for each other, yeah" +
"[01:23.46] Can we just be friends?" +
"[01:25.13] And we can dance with our plushies every day" +
"[01:28.44] A, B, C, D, E, F, G" +
"[01:31.14] Watch out for F, he's kinda scary" +
"[01:33.72] H, I, J, K, L, M, N, O, P" +
"[01:36.47] Let's transform, we'll save you from the beast" +
"[01:39.18] Q, R, S, T, U, V" +
"[01:41.60] Don't let him get the gems, he's gonna go crazy" +
"[01:44.74] W, X, Y, and Z" +
"[01:47.10] We can stop him, you and me" +
"[01:50.17] "
}
