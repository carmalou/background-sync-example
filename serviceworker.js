self.oninstall = function(event) {
    caches.open('backgroundSyncSample2')
    .then(function(cache) {
        cache.addAll([
            '/',
            './../index.html',
            './bundle.js'
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
    if(event.tag == 'example-sync') {
        event.waitUntil(syncIt());
    }
}

// down here are the other functions to go get the indexeddb data and also post to our server

function syncIt() {
    return getIndexedDB()
    .then(sendToServer)
    .catch(function(err) {
        return err;
    })
}

function getIndexedDB() {
    return new Promise(function(resolve, reject) {
        var db = indexedDB.open('newsletterSignup');
        db.onsuccess = function(event) {
            this.result.transaction("newsletterObjStore").objectStore("newsletterObjStore").getAll().onsuccess = function(event) {
                resolve(event.target.result);
            }
        }
        db.onerror = function(err) {
            reject(err);
        }
    });
}

function sendToServer(response) {
    return fetch('https://www.mocky.io/v2/5c0452da3300005100d01d1f', {
            method: 'POST',
            body: JSON.stringify(response),
            headers:{
              'Content-Type': 'application/json'
            }
    }).then(function(rez2) {
        return rez2.text();
    }).catch(function(err) {
        return err;
    })
}