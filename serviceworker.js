self.oninstall = function() {
    caches.open('backgroundSyncExample').then(function(cache) {
        cache.addAll([
            '/',
            'index.html',
            'index.js'
        ])
        .then(function() {
            // .add() doesn't return a response
            console.log('added file');
        })
        .catch(function(err) {
            console.log(err);
        });
    })
    .catch(function(err) {
        console.log('err ', err);
    })
}

self.onfetch = function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(cachedFiles) {
            if(cachedFiles) {
                return cachedFiles;
            } else {
                return fetch(event.request);
            }
        })
    );
}

self.addEventListener('sync', function(event) {
    console.log('i am sync');
    console.log('event-tag == ', event.tag);
    console.log(new Date());
    // get fake API setup
    // event.waitUntil();

});

function callToServer() {
    // first we reach into indexeddb to grab our data to pass to the server
    var db = indexedDB.open()
    // fetch('https://www.mocky.io/v2/5c0452da3300005100d01d1f')
}