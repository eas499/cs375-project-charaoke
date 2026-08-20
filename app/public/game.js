let ps = 6;
let waterfalls = [];
let timeList = [];
let lyrList = [];

for (i=0; i<ps; i++) {
    waterfalls.push(document.getElementById("waterfall" + i));
}

for (i=0; i<ps; i++) {
    waterfalls[i].textContent = lyrList[i];
}

let buffer = document.getElementById("buffer");
let timerID;
let extraTime = 0;
let add = false;

fetch("/current_song").then(r => r.json()).then(song => {
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
});

function playSong(player) {
    // the gameplay loop (lyric updating, audio playing, etc) goes here
    player.seek(0);
    player.resume();
}


let timestamps = parseTimeList(timeList);
let n = timestamps.length;

function displayLyric(i) {
    if (i >= n) return;
    for (let j=ps-1; j>=0; j--) {
        if (j==0) {
            waterfalls[j].textContent = lyrList[i];
        } else {
            waterfalls[j].textContent = waterfalls[j-1].textContent;
        }
    }
    console.log(i, lyrList[i], (timestamps[i + 1] - timestamps[i])*1000);
    setTimeout(() => {
        displayLyric(i + 1);
    }, timestamps[i + 1] - timestamps[i]);
}

console.log(timestamps);
displayLyric(ps);

// for (var i = 0; i < n; i++) {
//     displayLyric(i);
// }

function start() {
    /* not in use anymore, the above loop cycles through the lyrics automatically*/
    // add song actually playing also
    // this will need to maybe be recursive somehow
    let lastTime = 0;
    for (let i = 0; i < lyrList.length; i++) {
        let currTime = parseTimestamp(timeList[i]);
        let delay = currTime - lastTime;
        extraTime = delay % 16;
        add = !add;
        timerID = setTimeout(() => {
            waterfall.innerHTML = lyrList[i];
        }, add ? delay + extraTime : delay - extraTime);
    }
    
}

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
    console.log(minutes, seconds, milliseconds);
    return (minutes * 60 + seconds) * 1000 + milliseconds;
}


function parseTimeList(timeList) {
    // timeList is a string in the format "HH:MM:SS,HH:MM:SS,HH:MM:SS"
    return timeList.map(parseTimestamp);
}
