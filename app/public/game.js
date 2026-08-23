let ps = 6;
let waterfalls = [];

for (i=0; i<ps; i++) {
    waterfalls.push(document.getElementById("waterfall" + i));
}

let buffer = document.getElementById("buffer");
let timerID;
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

function playSong(player, song) {
    // the gameplay loop (lyric updating, audio playing, etc) goes here
    console.log(player);
    console.log(song);    

    player.connect();

    let timedLyrics = parseLyricFile(song.lyrics);
    startLyrics(timedLyrics);
}

function startLyrics(timedLyrics) {
    const displayIter = timedLyrics.entries();
    for (i=ps-2; i>=0; i--) {
        waterfalls[i].textContent = displayIter.next().value[1][1];
    }
    const lyricIter = timedLyrics.entries();
    displayLyric(lyricIter, displayIter);
}
function displayLyric(lyricIter, displayIter) {
    // We have two offset iterators to correctly time both the waterfalling of lyrics and the scoring
    //      displayIter starts later, and is used to get the next lyric to add to the waterfall
    //      lyricIter contains the duration and the current lyric that is being scored
    const next = lyricIter.next();
    if (next.done) return;
    const lyric = next.value[1]; // [duration, lyric_text]
    for (let j=ps-1; j>=0; j--) {
        if (j==0) {
            if (displayIter.next().done) {
                waterfalls[j].textContent = "-------------------------"; // TODO: figure out way to make us not have to do this (theres probably a CSS way to stop the p tags from being collapsed)
            } else {
                waterfalls[j].textContent = displayIter.next().value[1][1];
            }
        } else {
            waterfalls[j].textContent = waterfalls[j-1].textContent;
        }
    }
    timerID = setTimeout(() => {
        displayLyric(lyricIter, displayIter);
    }, lyric[0]);
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

function getDurations(timestamps) {
    // converts a list of timestamps (in ms) to a list of durations in order
    // TODO: adjust to the browser 16 ms clock cycle in here if needed
    let durations = [timestamps[0]];
    for (let i = 1; i < timestamps.length; i++) {
        durations.push(timestamps[i] - timestamps[i-1]);
    }
    return durations;
}

function parseLyricFile(lrc) {
    // assumes lrc file is coming in as a string
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
    durations = getDurations(parseTimeList(timestamps));
    return durations.map((dur, i) => [dur, lyrics[i]]);
}
