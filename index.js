window.onload = function() {
    initializeDB();
    if(navigator.serviceWorker) {
        navigator.serviceWorker.register('./serviceworker.js')
        .then(() => { return navigator.serviceWorker.ready })
        .then(function(registration) {
            // // here we'll use a little feature detection to make sure the user has background sync available!
            if(registration.sync) {
                document.getElementById('submitForm').addEventListener('click', () => {
                    registration.sync.register('test-sync').then(() => {
                        console.log('Sync registered!');
                    });
                });
            // if they don't have background sync available, we'll set up something else!
            } else {

            }
        });
    }
}

function handleClick(e) {
    e.preventDefault();
    saveData();
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
            console.log(event.target.result);
        };
    };
}

function checkInternet() {
    if(navigator.onLine) {
        // send request
    }    
}

document.getElementById('submitForm').addEventListener('click', handleClick);