require('indexeddb-getall-shim');
import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch';

function init() {
    initializeServiceWorker();
    initializeDB();
    checkIndexedDB();
}

init();

function checkIndexedDB() {
    if(navigator.onLine) {
        var newsletterDB = window.indexedDB.open('newsletterSignup');
        newsletterDB.onsuccess = function(event) {
            this.result.transaction("newsletterObjStore").objectStore("newsletterObjStore").getAll().onsuccess = function(event) {
                window.fetch('https://www.mocky.io/v2/5c0452da3300005100d01d1f', {
                        method: 'POST',
                        body: JSON.stringify(event.target.result),
                        headers:{
                          'Content-Type': 'application/json'
                        }
                    }).then(function(rez) {
                        return rez.text();
                    }).then(function(response) {
                        newsletterDB.result.transaction("newsletterObjStore", "readwrite")
                        .objectStore("newsletterObjStore")
                        .clear();
                    }).catch(function(err) {
                        console.log('err ', err);
                    })
            };
        };
    }
}

function initializeDB() {
    var newsletterDB = window.indexedDB.open('newsletterSignup');

    newsletterDB.onupgradeneeded = function(event) {
        var db = event.target.result;

        var newsletterObjStore = db.createObjectStore("newsletterObjStore", { autoIncrement: true });
        newsletterObjStore.createIndex("firstName", "firstName", { unique: false });
        newsletterObjStore.createIndex("lastName", "lastName", { unique: false });
        newsletterObjStore.createIndex("email", "email", { unique: true });
        newsletterObjStore.createIndex("dateAdded", "dateAdded", { unique: true });
    }
}

function initializeServiceWorker() {
    if(navigator.serviceWorker) {
        navigator.serviceWorker.register('./dist/serviceworker.js')
        .then(function() {
            return navigator.serviceWorker.ready
        })
        .then(function(registration) {
            document.getElementById('submitForm').addEventListener('click', (event) => {
                event.preventDefault();
                saveData().then(function() {
                    if(registration.sync) {
                        registration.sync.register('example-sync')
                        .catch(function(err) {
                            return err;
                        })
                    } else {
                        // sync isn't there so fallback
                        checkInternet();
                    }
                });
            })
        })
    } else {
        document.getElementById('submitForm').addEventListener('click', (event) => {
            event.preventDefault();
            saveData().then(function() {
                checkInternet();
            });
        })
    }
}

function saveData() {
    return new Promise(function(resolve, reject) {
        var tmpObj = {
            firstName: document.getElementById('firstname').value,
            lastName: document.getElementById('lastname').value,
            email: document.getElementById('email').value,
            dateAdded: new Date()
        };
    
        var myDB = window.indexedDB.open('newsletterSignup');
    
        myDB.onsuccess = function(event) {
          var objStore = this.result.transaction('newsletterObjStore', 'readwrite').objectStore('newsletterObjStore');
          objStore.add(tmpObj);
          resolve();
        }

        myDB.onerror = function(err) {
            reject(err);
        }
    })
}

function fetchData() {
    return new Promise(function(resolve, reject) {
        var myDB = window.indexedDB.open('newsletterSignup');

        myDB.onsuccess = function(event) {
            this.result.transaction("newsletterObjStore").objectStore("newsletterObjStore").getAll().onsuccess = function(event) {
                resolve(event.target.result);
            };
        };

        myDB.onerror = function(err) {
            reject(err);
        }
    })
}

function sendData() {
    fetchData().then(function(response) {
        var postObj = {
            method: 'POST',
            body: JSON.stringify(response),
            headers:{
              'Content-Type': 'application/json'
            }
        };
    
        // send request
        return window.fetch('https://www.mocky.io/v2/5c0452da3300005100d01d1f', postObj)
    })
    .then(clearData)
    .catch(function(err) {
        console.log(err);
    });
}

function clearData() {
    return new Promise(function(resolve, reject) {
        var db = window.indexedDB.open('newsletterSignup');
        db.onsuccess = function(event) {
            db.transaction("newsletterSignup", "readwrite")
            .objectStore("newsletterObjStore")
            .clear();

            resolve();
        }

        db.onerror = function(err) {
            reject(err);
        }
    })
}

function checkInternet() {
    event.preventDefault();
    if(navigator.onLine) {
        sendData();
    } else {
        alert("You are offline! When your internet returns, we'll finish up your request.");
    }
}

window.addEventListener('online', function() {
    if(!navigator.serviceWorker && !window.SyncManager) {
        fetchData().then(function(response) {
            if(response.length > 0) {
                return sendData();
            }
        });
    }
});

window.addEventListener('offline', function() {
    alert('You have lost internet access!');
});