self.oninstall = function(event) {
    caches.open('backgroundSyncSample2')
    .then(function(cache) {
        cache.addAll([
            '/',
            'index.html',
            'index.js'
        ])
        .catch(function(err) {
            console.log('files not added ', err);
        })
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
        .catch(function(err) {
            console.log('err in fetch ', err);
        })
    );
}

self.onsync = function(event) {
    console.log('sync ', event);
}