Service workers have been having a moment. In March 2018, iOS Safari began including service workers -- so all major browsers at this point support offline options.

However, service workers alone will only get someone part of the way to a truly seamless online-to-offline experience. Caching assets is great, but without an internet connection you still can't access new data or send any requests. Currently a request might look like this:

** REQUEST LIFECYCLE **

A user pushes a button and a request is fired off to a server somewhere. If there is internet, everything should go off without a hitch. If there is not internet ... well things aren't so simple. The request won't be sent, and perhaps the user realizes their request never made it through, or perhaps they are unaware. Fortunately, there's a better way.

Enter: [background sync](link).

** BACKGROUND SYNC LIFECYCLE **

The lifecycle with background sync is slightly different. First a user makes a request, but instead of the request being attempted immediately, the service worker steps in. The service worker will check if the user has internet access -- if they do, great. The request will be sent. If not, the service worker will wait until the user _does_ have internet and at that point send the request, after it fetches data out of IndexedDB. Best of all, background sync will go ahead and send the request even if the user has navigated away from the original page.

** PICTURE FROM CANIUSE **

While background sync is fully supported only in Chrome, Firefox and Edge are currently working on implementing it. Fortunately with the use of feature detection and `onLine` and `offLine` events, we can safely use background sync in any application while also including a fallback.

** PICTURE FROM DEMO **

(If you'd like to follow along with the demo, [the code can be found here](link) and [the demo itself is found here.](link))

Let's assume we have a very simple newsletter signup form. We want the user to be able to signup for our newsletter whether or not they currently have internet access. Let's start with background sync.

When you are first setting up a service worker, you'll have to register it from your application's JavaScript file. That might look like this:

```
if(navigator.serviceWorker) {
      navigator.serviceWorker.register('serviceworker.js');
}
```

Notice that we are using feature detection even when registering the service worker. There's almost no downside to using feature detection and it'll stop errors from cropping up in older browsers like Internet Explorer 11 when the service worker isn't available. Overall, it's a good habit to keep up even if it isn't always necessary.

When we set up background sync, our register function changes and may look something like this:

```
if(navigator.serviceWorker) {
        navigator.serviceWorker.register('./serviceworker.js')
        .then(function() {
            return navigator.serviceWorker.ready
        })
        .then(function(registration) {
            document.getElementById('submitForm').addEventListener('click', (event) => {
                registration.sync.register('example-sync')
                .catch(function(err) {
                    return err;
                })
            })
        })
        .catch( /.../ )
    }
```

This is a lot more code, but we'll break it down one line at a time.

First we are registering the service worker like before, but now we're taking advantage of the fact that `register` function returns a promise. The next piece you see is `navigator.serviceWorker.ready`. This is a read-only property of a service worker that essentially just lets you know if the service worker is ready or not. This property provides a way for us to delay execution of the following functions until the service worker is actually ready.

Next we have a reference to the service worker's registration. We'll put an event listener on our submit button, and at that point register a sync event and pass in a string. That string will be used over on the service worker side later on.

Let's re-write this real quick to include feature detection, since we know background sync doesn't yet have wide support.

```
if(navigator.serviceWorker) {
        navigator.serviceWorker.register('./serviceworker.js')
        .then(function() {
            return navigator.serviceWorker.ready
        })
        .then(function(registration) {
            document.getElementById('submitForm').addEventListener('click', (event) => {
                if(registration.sync) {
                    registration.sync.register('example-sync')
                    .catch(function(err) {
                        return err;
                    })
                }
            })
        })
    }
```

Now let's take a look at the service worker side.

```
self.onsync = function(event) {
    if(event.tag == 'example-sync') {
        event.waitUntil(sendToServer());
    }
}
```

We attach a function to [`onsync`](link), the event listener for background sync. We want to watch to for the string we passed into the register function back in the application's JavaScript. We're watching for that string using [`event.tag`](link).

We're also using [`event.waitUntil`](link). Because a service worker isn't continually running -- it "wakes up" to do a task and then "goes back to sleep" -- we want to use `event.waitUntil` to keep the service worker active. This function accepts a function parameter. The function we pass in will return a promise, and `event.waitUntil` will keep the service worker "awake" until that function resolves. If we didn't use `event.waitUntil` the request might never make it to the server because the service worker would run the `onsync` function and then immediately go back to sleep.

Looking at the code above, you'll notice we don't have to do anything to check on the status of the user's internet connection or send the request again if the first attempt fails. Background sync is handling all of that for us. Let's take a look at how we access the data in the service worker.

A service worker is isolated in its own worker, so we won't be able to access any data directly from the DOM. We'll rely on Indexeddb to get the data and then send the data onward to the server.

IndexedDB utilizes callbacks while a service worker is promise-based, so we'll have to account for that in our function. (There are wrappers around IndexedDB that make this process a little simpler.)

Here is what our function might look like:

```
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
```

Walking through it, we're returning a promise, and we'll use the `resolve` and `reject` parameters to make this function more promise-based to keep everything in line with the service worker.

We'll open a database

# The issue: 20% of Americans without internet at home

# Service workers (brief discussion)

# How background sync helps

# Request lifecycle

# Request lifecycle with background sync

# IndexedDB

# Implement background sync in index.js

# Set up sync listener in service worker

# Access indexeddb from sw

# Backup plan