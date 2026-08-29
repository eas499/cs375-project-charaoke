let finalScore = 0;

function submitScore() {
    let name = document.getElementById("name");
    name = name.value;

    // submit to postgres with the name and score
}
fetch("/get_score").then((response) => {
    let scoreText = document.getElementById("score");
    scoreText.innerText = "Your final score is: " + response;
});

function mainMenu() {
    window.location.href = "/index.html";
}