var fetchIt = require('./src/fetch.js')
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
    event.waitUntil(sendToServer().catch((err) => {
        console.log('err ', err);
    }));
});

function accessIndexedDB() {
    var myDB = indexedDB.open('testEmailDB');

    return new Promise(function (resolve, reject) {
        myDB.onsuccess = function(event) {
            var request = this.result.transaction("emailObjStore").objectStore("emailObjStore").getAll();
            
            request.onsuccess = function(event) {
                resolve(event.target.result);
            };

            request.onerror = function (err) {
                reject(err);
            };
        };

        myDB.onerror = function (err) {
            reject(err);
        };
    });
}

function sendToServer() {
    return accessIndexedDB()
        .then(function (data) {
            return Promise.all(data.map(function(response) {
                return fetch('https://www.mocky.io/v2/5c0452da3300005100d01d1f', {
                        method: 'POST',
                        data: response
                    })
                    .then(function(rez2) {
                        return rez2.json();
                    })
                    .then(function(rez2) {
                        console.log('sync response: ', rez2);
                        return rez2;
                    })
            }))
            .then(function(response) {
                console.log('arr of fetches: ', response);
            })
        })
}