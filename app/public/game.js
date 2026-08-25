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

    let timedLyrics = parseLyricFile(song);
    console.log(timedLyrics);
    startLyrics(timedLyrics);
}

function startLyrics(timedLyrics) {
    const displayIter = timedLyrics.entries();
    console.log(displayIter);
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
    let next = lyricIter.next();
    if (next.done) return;
    const lyric = next.value[1]; // [duration, lyric_text]
    console.log(lyric);
    for (let j=ps-1; j>=0; j--) {
        if (j==0) {
            next = displayIter.next();
            if (next.done) {
                waterfalls[j].textContent = "-------------------------"; // TODO: figure out way to make us not have to do this (theres probably a CSS way to stop the p tags from being collapsed)
            } else {
                waterfalls[j].textContent = next.value[1][1];
            }
        } else {
            waterfalls[j].textContent = waterfalls[j-1].textContent;
        }
    }

    let inputBox = document.getElementById("type");
    let typedLyr = inputBox.value;
    scoreLyric(lyric, typedLyr);
    typedLyr = "";
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
    let timestamps = [];
    let lyrics = [];
    let parsedObj = {};
    for (line in linesArr) {
        let lineSplit = linesArr[line].split("]");
        let timestamp = lineSplit[0].split("[");
        timestamps.push(parseTimestamp(timestamp[1]));
        lyrics.push(lineSplit[1]);
    }
    timestamps.push(song.duration * 1000);
    durations = getDurations(timestamps);
    durations[1] += durations[0];
    durations.shift();
    return durations.map((dur, i) => [dur, lyrics[i]]);
}

function scoreLyric(target, typed) {
    let lyrScore = (1 - (levenshtein(target, typed) / target.length)) * 100;
    score += lyrScore;
    let scoreText = document.getElementById("score");
    scoreText.innerText = "Score: " + score;
}

// Source - https://stackoverflow.com/a/35279162
// Posted by gustf, modified by community. See post 'Timeline' for change history
// Retrieved 2026-08-23, License - CC BY-SA 3.0

function levenshtein(s, t) {
    if (s === t) {
        return 0;
    }
    var n = s.length, m = t.length;
    if (n === 0 || m === 0) {
        return n + m;
    }
    var x = 0, y, a, b, c, d, g, h, k;
    var p = new Array(n);
    for (y = 0; y < n;) {
        p[y] = ++y;
    }

    for (; (x + 3) < m; x += 4) {
        var e1 = t.charCodeAt(x);
        var e2 = t.charCodeAt(x + 1);
        var e3 = t.charCodeAt(x + 2);
        var e4 = t.charCodeAt(x + 3);
        c = x;
        b = x + 1;
        d = x + 2;
        g = x + 3;
        h = x + 4;
        for (y = 0; y < n; y++) {
            k = s.charCodeAt(y);
            a = p[y];
            if (a < c || b < c) {
                c = (a > b ? b + 1 : a + 1);
            }
            else {
                if (e1 !== k) {
                    c++;
                }
            }

            if (c < b || d < b) {
                b = (c > d ? d + 1 : c + 1);
            }
            else {
                if (e2 !== k) {
                    b++;
                }
            }

            if (b < d || g < d) {
                d = (b > g ? g + 1 : b + 1);
            }
            else {
                if (e3 !== k) {
                    d++;
                }
            }

            if (d < g || h < g) {
                g = (d > h ? h + 1 : d + 1);
            }
            else {
                if (e4 !== k) {
                    g++;
                }
            }
            p[y] = h = g;
            g = d;
            d = b;
            b = c;
            c = a;
        }
    }

    for (; x < m;) {
        var e = t.charCodeAt(x);
        c = x;
        d = ++x;
        for (y = 0; y < n; y++) {
            a = p[y];
            if (a < c || d < c) {
                d = (a > d ? d + 1 : a + 1);
            }
            else {
                if (e !== s.charCodeAt(y)) {
                    d = c + 1;
                }
                else {
                    d = c;
                }
            }
            p[y] = d;
            c = a;
        }
        h = d;
    }

    return h;
}
