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
                event.target.result.forEach(function(record) {
                    window.fetch('https://www.mocky.io/v2/5c0452da3300005100d01d1f', {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers:{
                          'Content-Type': 'application/json'
                        }
                    }).then(function(rez) {
                        return rez.json();
                    }).then(function(response) {
                        db.transaction("newsletterSignup", "readwrite")
                        .objectStore("newsletterObjStore")
                        .clear();
                    }).catch(function(err) {
                        console.log('err ', err);
                    })
                });
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
        navigator.serviceWorker.register('./serviceworker.js')
        .then(registration => navigator.serviceWorker.ready)
        .then(function(registration) {
            document.getElementById('submitForm').addEventListener('click', (event) => {
                event.preventDefault();
                if(registration.sync) {
                    registration.sync.register('test-sync').then(() => {
                        console.log('sync registered!');
                    })
                } else {
                    // sync isn't there so fallback
                    console.log('ELSE');
                }
            })
        })
    }
}

function saveData() {
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
    }
}

function fetchData() {
    var myDB = window.indexedDB.open('newsletterSignup');

    myDB.onsuccess = function(event) {
        this.result.transaction("newsletterObjStore").objectStore("newsletterObjStore").getAll().onsuccess = function(event) {
            return event.target.result;
        };
    };
}

function checkInternet() {
    event.preventDefault();
    saveData();
    var data = fetchData();

    var postObj = {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
          'Content-Type': 'application/json'
        }
    };
    if(navigator.onLine) {
        // send request
        fetchIt('https://www.mocky.io/v2/5c0452da3300005100d01d1f', postObj)
        .then(function(response) {
            var db = window.indexedDB.open('newsletterSignup');
            db.onsuccess = function(event) {
                db.transaction("newsletterSignup", "readwrite")
                .objectStore("newsletterObjStore")
                .clear();
            }
        })
        .catch(function(err) {
            console.log(err);
        });
    } else {
        alert("You are offline! When your internet returns, we'll finish up your request.");
    }
}