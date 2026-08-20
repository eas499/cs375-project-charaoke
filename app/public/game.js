let timeList = ["00:02.84", "00:05.57","00:08.17","00:10.88","00:13.43","00:15.93","00:18.78","00:21.46","00:24.52","00:27.37","00:29.92",
"00:32.66","00:35.80","00:38.27","00:41.13","00:43.66","00:45.46","00:48.21","00:50.99","00:53.53","00:56.22","00:58.97","01:01.42", 
"01:04.04","01:06.94","01:09.13","01:12.19","01:14.39","01:17.69","01:04.04","01:06.94","01:09.13","01:12.19","01:14.39","01:17.69",
"01:20.06","01:23.46","01:25.13","01:28.44","01:31.14","01:33.72","01:36.47","01:39.18","01:41.60","01:44.74","01:47.10","01:50.17"];

let lyrList = [
    "A, B, C, D, E, F, G","Watch out for F, he's kinda scary","H, I, J, K, L, M, N, O, P","Let's transform, we'll save you from the beast",
    "Q, R, S, T, U, V","Don't let him get the gems, he's gonna go crazy","W, X, Y, and Z","We can stop him, you and me","The Alphabet Lore, from A to Z",
    "We gotta stop F from going crazy","The Alphabet Lore, L, M, N, O, P","We'll use their powers to save you and me","We gotta help everyone",
    "Don't let F destroy everyone","It's the Alphabet Lore","Yeah, it's the Alphabet Lore","A, B, C, D, E, F, G","Watch out for F, he's kinda scary",
    "H, I, J, K, L, M, N, O, P","Let's transform, we'll save you from the beast","Q, R, S, T, U, V","Don't let him get the gems, he's gonna go crazy",
    "W, X, Y, and Z","We can stop him, you and me","Don't forget when we were best friends","Can we go back, yeah, you don't have to attack us",
    "We'll all give you some plushies","You can get Foxy or you can get Boxy","Can we just be friends?","We'll be kind to each other, watch out for each other, yeah",
    "Can we just be friends?","And we can dance with our plushies every day","A, B, C, D, E, F, G","Watch out for F, he's kinda scary",
    "H, I, J, K, L, M, N, O, P","Let's transform, we'll save you from the beast","Q, R, S, T, U, V","Don't let him get the gems, he's gonna go crazy",
    "W, X, Y, and Z","We can stop him, you and me","THIS IS THE END","THIS IS THE END PT2","THIS IS THE END PT3","THIS IS THE END PT4",
    "THIS IS THE END PT5","THIS IS THE END PT6","THIS IS THE END PT7","THIS IS THE END PT8"
]

// TODO: get lyric file from ??somewhere??

console.log("game.js loaded");
let ps = 6;
let waterfalls = [];

for (i=0; i<ps; i++) {
    waterfalls.push(document.getElementById("waterfall" + i));
}

for (i=0; i<ps; i++) {
    waterfalls[i].textContent = lyrList[i];
}

let buffer = document.getElementById("buffer");
let timerID;
// let extraTime = 0;
// let add = false;

fetch("/current_song").then(r => r.json()).then(song => {
    console.log(song);
    if (song["mode"] == "lyric") {
        fetch(`/play_song?href=${song["href"]}`).then((response) => {
            console.log(href);
            return response.json();
        }).then((body) => {
            let player = body.player;
            playSong(player);
        });
    } else {
        //play audio from audio file
    }
}).catch((error) => {
    console.log(error);
});

function playSong(player) {
    // the gameplay loop (lyric updating, audio playing, etc) goes here
    player.seek(0);
    player.resume();
}


let timestamps = parseTimeList(timeList);
let n = timestamps.length;

function displayLyric(i) {
    // does nothing about the 16ms resolution for settimeout
    if (i >= n) return;
    for (let j=ps-1; j>=0; j--) {
        if (j==0) {
            waterfalls[j].textContent = lyrList[i];
        } else {
            waterfalls[j].textContent = waterfalls[j-1].textContent;
        }
    }
    // console.log(i, lyrList[i], (timestamps[i + 1] - timestamps[i])*1000);
    timerID = setTimeout(() => {
        displayLyric(i + 1);
    }, timestamps[i + 1] - timestamps[i]);
}

// console.log(timestamps);
displayLyric(ps);

function stop() {
    clearTimeout(timerID);
}

function parseTimestamp(timestamp) {
    // timestamp is a string in the format "MM:SS.MS"
    let parts = timestamp.split(":");
    let minutes = parseInt(parts[0]);
    parts = parts[1].split(".");
    let seconds = parseInt(parts[0]);
    let milliseconds = parseInt(parts[1]);
    //console.log(minutes, seconds, milliseconds);
    return (minutes * 60 + seconds) * 1000 + milliseconds;
}

function parseTimeList(timeList) {
    // timeList is a string in the format "HH:MM:SS,HH:MM:SS,HH:MM:SS"
    return timeList.map(parseTimestamp);
}

function parseLyricFile(lrc) {
    // assumes lrc file is coming in as a string
    // TODO: what happens when a lyric has quotes in it?
    let linesArr = lrc.split('\n');
    let timestamps = [];
    let lyrics = [];
    let parsedObj = {};
    for (line in linesArr) {
        let lineSplit = linesArr[line].split("]");
        let timestamp = lineSplit[0].split("[");
        timestamps.push(timestamp[1]);
        lyrics.push(lineSplit[1]);
    }

    parsedObj["lyrics"] = lyrics;
    parsedObj["timestamps"] = parseTimeList(timestamps);
    return parsedObj;
}
