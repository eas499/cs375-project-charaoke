console.log("game.js loaded");
const levenshtein = require('js-levenshtein');
let ps = 6;
let waterfalls = [];

for (i=0; i<ps; i++) {
    waterfalls.push(document.getElementById("waterfall" + i));
}

let buffer = document.getElementById("buffer");
let timerID;
let score = 0;
// let extraTime = 0;
// let add = false;

window.onSpotifyWebPlaybackSDKReady = () => {
    fetch("/get_token_and_song").then((response) => {
        return response.json();
    }).then((body) => {
        let token = body.token;
        let song = body.song
        const player = new Spotify.Player({
            name: 'Web Playback SDK Quick Start Player',
            getOAuthToken: cb => { cb( token ); },
            volume: 0.5
        });

        player.addListener("ready", ({ device_id }) => {
            const play = ({
                context_uri,
                playerInstance: {
                    _options: { getOAuthToken, id },
                },
            }) => {
                getOAuthToken((access_token) => {
                    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
                        method: "PUT",
                        body: JSON.stringify({ uris: [context_uri] }),
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${access_token}`,
                        },
                    });
                });
            };

            play({
                playerInstance: player,
                context_uri: song.uri,
                position_ms: 0,
            });
        });

        playSong(player, song);
    });
}

function playSong(player, song) {
    // the gameplay loop (lyric updating, audio playing, etc) goes here
    let lyrObj = parseLyricFile(song.lyrics);
    let timestamps = lyrObj["timestamps"];
    let lyrList = lyrObj["lyrics"];
    displayLyricHelper(lyrList, timestamps);

    player.seek(0);
    player.resume();
}

function displayLyricHelper(lyrList, timestamps) {
    for (i=0; i<ps; i++) {
        waterfalls[i].textContent = lyrList[i];
    }
    displayLyric(ps, lyrList, timestamps);
}
function displayLyric(i, lyrList, timestamps) {
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
        displayLyric(i + 1, lyrList);
    }, timestamps[i + 1] - timestamps[i]);
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
    //console.log(minutes, seconds, milliseconds);
    return (minutes * 60 + seconds) * 1000 + milliseconds;
}

function parseTimeList(timeList) {
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

function scoreLyric(tar, input) {
    let lyricScore = (1 - (levenshtein(tar, input) / length(lyric))) * 100;
    score += lyricScore;
    let scoreText = document.getElementById("score");
    scoreText.innerText = score;
}