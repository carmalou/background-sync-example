window.onload = function() {
    if(navigator.serviceWorker) {
        navigator.serviceWorker.register('./serviceworker.js')
        .then(() => { return navigator.serviceWorker.ready })
        .then(function(registration) {
            document.getElementById('submitForm').addEventListener('click', () => {
                registration.sync.register('test-sync').then(() => {
                    console.log('Sync registered!');
                });
            });
        });
    }
}

function followAlong() {
    console.log("Welcome to Background Sync example!");
}

function handleClick(e) {
    e.preventDefault();
}

document.getElementById('submitForm').addEventListener('click', handleClick);