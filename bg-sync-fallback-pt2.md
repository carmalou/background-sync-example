### Support for legacy browsers

In our last post, we were building a simple newsletter signup app. We set up background sync in a service worker, so the user could sign up for the newsletter with or without internet access. [Background sync](https://developers.google.com/web/updates/2015/12/background-sync) allows a service worker to intercept outgoing fetch requests. If the user doesn't have internet access, the service worker will attempt the fetch request once the internet connection has returned.

Unfortunately, service workers aren't supported in legacy browsers and the background sync feature is only supported in Chrome as of now. In this post we'll focus on utilizing other offline features in order to mimic background sync and offer a similar experience.

### Online and Offline Events

We'll start with [online and offline events.](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/Online_and_offline_events) Our code to register the service work last time looked like this:

```
if(navigator.serviceWorker) {
    navigator.serviceWorker.register('./serviceworker.js')
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
                }
            });
        })
    })
}
```

Let's do a quick recap of this code. After we register the service worker, we use the promise returned from `navigator.serviceWorker.ready` to ensure that the service worker is in fact ready to go. Once the service worker is ready to go, we'll attach an event listener to the submit button and immediately save the data into IndexedDB. Lucky for us IndexedDB is supported in effectively all browsers, so we can pretty well rely on it.

After we've saved the data, we use feature detection to make sure we can use background sync. Let's go ahead and add our fallback plan in the else.

```
if(registration.sync) {
    registration.sync.register('example-sync')
    .catch(function(err) {
        return err;
    })
} else {
    if(navigator.onLine) {
        sendData();
    } else {
        alert("You are offline! When your internet returns, we'll finish up your request.");
    }
}
```

### Additional support

We're using `navigator.onLine` to check the user's internet connection. If they have a connection, this will return true. If they have an internet connection, we'll go ahead and send off the data. Otherwise, we'll pop up an alert letting the user know that their data hasn't been sent.

Let's add a couple of events to watch the internet connection. First we'll add an event to watch the connection going offline.

```
window.addEventListener('offline', function() {
    alert('You have lost internet access!');
});
```

If the user loses their internet connection, they'll see an alert. Next we'll add an event listener for watching for the user to come back online.

```
window.addEventListener('online', function() {
    if(!navigator.serviceWorker && !window.SyncManager) {
        fetchData().then(function(response) {
            if(response.length > 0) {
                return sendData();
            }
        });
    }
});
```

Once the user's internet connection returns, we'll do a quick check if a service worker is available and also sync being available. We want to check on this because if the browser has sync available, we don't need to rely on our fallback because it would result in two fetches. However, if we do use our fallback, we first pull the data out of IndexedDB like so:

```
var myDB = window.indexedDB.open('newsletterSignup');

myDB.onsuccess = function(event) {
    this.result.transaction("newsletterObjStore").objectStore("newsletterObjStore").getAll().onsuccess = function(event) {
        return event.target.result;
    };
};

myDB.onerror = function(err) {
    reject(err);
}
```

Next we'll verify that the response from IndexedDB actually has data, and if it does we'll send it to our server.

This fallback won't entirely replace background sync for a few reasons. Firstly, we are checking for online and offline events, which we do not need to do with background sync because background sync handles all that for us. Additionally, background sync will continue attempting to send requests even if the user has navigated away from the page.

Our solution won't be able to send the request even if the user navigates away, but we can pre-emptively check IndexedDB as soon as the page loads and send any cached data immediately. This solution also watches for any network connection changes, and sends cached data as soon as the connection returns.

### Next steps in offline support

Edge and Firefox browsers are currently working on implementing background sync, which is fantastic. It is one of the best features for providing a more empathetic experience for users moving between internet connection and connection loss. Fortunately with a little help from online and offline events and IndexedDB, we can start providing a better experience for users today.

If you'd like to learn more about offline techniques, check out my blog: [carmalou.com](https://carmalou.com/) or [follow me on Twitter.](https://twitter.com/carmalou)