function fetchIt(url, postObj) {
    if(window) {
        return window.fetch(url, postObj)
        .then(function(response) {
            return response.json()
        });
    } else {
        return fetch(url, postObj)
        .then(function(response) {
            return response.json()
        });
    }
}

module.exports = fetchIt;