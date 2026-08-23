function modeButtonClicked(mode) {
    if (mode == "beat") {
        location.href = "beat.html";
    } else {
        location.href = "lyric.html";
    }
}

function login() {
    window.location.href = "/auth/login";
}
