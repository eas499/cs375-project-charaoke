let ps = 6;
let waterfalls = [];

const BUFFER = "---------------------------";
for (let i=0; i<ps; i++) {
    let wf = document.getElementById("waterfall" + i)
    wf.textContent = BUFFER;
    waterfalls.push(wf);
}

let buffer = document.getElementById("buffer");
let timerID;
let score = 0;
// let extraTime = 0;
// let add = false;

const outer = document.getElementById("progress_bar_outer");

window.onSpotifyWebPlaybackSDKReady = () => {
    fetch("/get_token_and_song").then((response) => {
        return response.json();
    }).then((body) => {
        let token = body.token;
        let song = body.song
        const player = new Spotify.Player({
            name: 'Web Playback SDK Quick Start Player',
            getOAuthToken: cb => { cb( token ); },
            volume: 0
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
                    }).catch((error) => {
                        console.log(error.message);
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
    }).catch((error) => {
        console.log(error.message);
    });
}

const START_DELAY = 3000;
function playSong(player, song) {
    // the gameplay loop (lyric updating, audio playing, etc) goes here
    console.log(player);
    console.log(song);    

    player.connect();

    let timedLyrics = parseLyricFile(song);
    console.log(timedLyrics);
    const displayIter = timedLyrics.entries();
    for (i=ps-2; i>=0; i--) {
        waterfalls[i].textContent = displayIter.next().value[1][1];
    }
    const lyricIter = timedLyrics.entries();
    setTimeout(() => {
        player.seek(0);
        player.setVolume(0.5);
        displayLyric(lyricIter, displayIter);
    }, START_DELAY);
}

function displayLyric(lyricIter, displayIter) {
    // We have two offset iterators to correctly time both the waterfalling of lyrics and the scoring
    //      displayIter starts later, and is used to get the next lyric to add to the waterfall
    //      lyricIter contains the duration and the current lyric that is being scored
    let next = lyricIter.next();
    if (next.done) return;
    const lyric = next.value[1]; // [duration, lyric_text]
    console.log(lyric);
    for (let j=ps-1; j>=0; j--) {
        if (j==0) {
            next = displayIter.next();
            if (next.done) {
                waterfalls[j].textContent = BUFFER; // TODO: figure out way to make us not have to do this (theres probably a CSS way to stop the p tags from being collapsed)
            } else {
                waterfalls[j].textContent = next.value[1][1];
            }
        } else {
            waterfalls[j].textContent = waterfalls[j-1].textContent;
        }
    }

    animateProgressBar(lyric[0]);

    timerID = setTimeout(() => {
        let inputBox = document.getElementById("type");
        let typedLyr = inputBox.value;
        inputBox.value = "";
        scoreLyric(lyric[1], typedLyr);
        displayLyric(lyricIter, displayIter);
    }, lyric[0]);
}

function animateProgressBar(duration) {
    outer.textContent = "";
    let inner = document.createElement("div");
    inner.id = "progress_bar_inner";
    inner.style.animationDuration = duration + "ms";
    outer.append(inner);
}

function mainMenu() {
    window.location.href= "/index.html";
}

function parseTimestamp(timestamp) {
    // timestamp is a string in the format "MM:SS.MS"
    let parts = timestamp.split(":");
    let minutes = parseInt(parts[0]);
    parts = parts[1].split(".");
    let seconds = parseInt(parts[0]);
    let milliseconds = parseInt(parts[1]) * 10;
    //console.log(minutes, seconds, milliseconds);
    return (minutes * 60 + seconds) * 1000 + milliseconds;
}

function getDurations(timestamps) {
    // converts a list of timestamps (in ms) to a list of durations in order
    // TODO: adjust to the browser 16 ms clock cycle in here if needed
    let durations = [timestamps[0]];
    for (let i = 1; i < timestamps.length; i++) {
        durations.push(timestamps[i] - timestamps[i-1]);
    }
    return durations;
}

function parseLyricFile(song) {
    // assumes lrc file is coming in as a string
    let linesArr = song.lyrics.split('\n');
    console.log(linesArr);
    let timestamps = [];
    let lyrics = [];
    let parsedObj = {};
    for (line in linesArr) {
        let lineSplit = linesArr[line].split("]");
        let timestamp = parseTimestamp(lineSplit[0].split("[")[1]);
        let lyr = stripNonAlphaNum(lineSplit[1]);
        console.log(timestamp, lyr);
        if (lyr.trim() != "") {
            timestamps.push(timestamp);
            lyrics.push(stripNonAlphaNum(lineSplit[1]));
        }
    }
    timestamps.push(song.duration * 1000);
    console.log(timestamps, lyrics);
    durations = getDurations(timestamps);
    durations[1] += durations[0];
    durations.shift();
    return durations.map((dur, i) => [dur, lyrics[i]]);
}

function stripNonAlphaNum(str) {
    // strip leading and trailing whitespace, convert to lower case, and remove all non-space/non-alphanumeric characters
    let new_str = "";
    str = str.toLowerCase();
    for (let c of str) {
        let code = c.charCodeAt(0);
        if (code == 32 || (code >= 48 && code <= 57) || (code >= 97 && code <= 122)) {
            new_str += c;
        }
    }
    return new_str.trim();
}

function scoreLyric(target, typed) {
    let stripped_typed = stripNonAlphaNum(typed);
    let lyrScore = Math.round((1 - (levenshtein(target, stripped_typed) / target.length)) * 100);
    if (lyrScore < 0) lyrScore = 0;
    console.log(levenshtein(target, stripped_typed), target.length, lyrScore, target, stripped_typed);
    score += lyrScore;
    let scoreText = document.getElementById("score");
    scoreText.innerText = "Score: " + score;
}
