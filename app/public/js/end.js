let finalScore = 0;

function displayLeaderboard(board) {
    let tbody = document.getElementById("leaderboard");
    document.getElementById("message").textContent = "";
    tbody.textContent = "";
    for (let row of board) {
        let tr = document.createElement("tr");
        let tdp = document.createElement("td");
        tdp.textContent = row.placement;
        tr.append(tdp);
        let tdn = document.createElement("td");
        tdn.textContent = row.name;
        tr.append(tdn);
        let tds = document.createElement("td");
        tds.textContent = row.score;
        tr.append(tds);
        tbody.append(tr);
    }
}

function submitScore() {
    let name = document.getElementById("name");
    name = name.value;
    fetch("/submit_score", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name })
    }).then((response) => {
        if (response.status == 200) {
            return response.json();
        } else {
            throw Error("invalid response");
        }
    }).then((body) => {
        const board = body.rows;
        displayLeaderboard(board);
    }).catch((error) => {
        console.log(error.message);
    });
}

fetch("/get_score").then((response) => {
    return response.json();
}).then((body) => {
    let scoreText = document.getElementById("score");
    scoreText.innerText = "Your final score is: " + body.score;
});

function mainMenu() {
    window.location.href = "/index.html";
}
