let express = require("express");

let hostname = "localhost";
let port = 3000;
let app = express();

app.use(express.static("public"));

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
