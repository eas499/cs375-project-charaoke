function getTopSongs() {
    //get top songs from SQL database
    //maybe just have this be handled in server.js as well?
}

function updateResults(el) {
    const search_input = el.input;
    if (search_input == "") {
        getTopSongs();
    } else {
        fetch(`/get_songs?search=${search_input}`).then((response) => {
            return response.json();
        }).then((body) => {
            //update page with songs that match the search input
        });
    }
}
