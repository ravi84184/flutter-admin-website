'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "aeb82a63ab8d5eaa05c2c740cb04b716",
"index.html": "ca047c04c6a8ec784f2442345f2ff0e7",
"/": "50e8ff70993f0817c933b8a89910d0e8",
"main.dart.js": "07a430292774e6de89021a49b9889c8c",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "ee1860a58c95a3163dbf987238cf4a88",
"assets/AssetManifest.json": "cf17862802c6d8c3bff783391755a68d",
"assets/NOTICES": "d1b0f5e9a6bfc9b49fd5e885d726854a",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/assets/spotify.png": "06e43cea5d48e294d2d6147486216628",
"assets/assets/jira.png": "4b19de4182b852aa45f24fcf295f33f8",
"assets/assets/intercom.png": "bf5bc356b9a957c31af8de79c9c4039a",
"assets/assets/email.png": "0a3a3edc6e1e916e5078b7cc65a92a31",
"assets/assets/dashboard.png": "6186e931fda6bbeec07d881d6f96328f",
"assets/assets/circle-dribble_icon-icons.com_66836.png": "9b519934362ada463c1216b7c8561dbb",
"assets/assets/bitcoin.png": "8ae1133e128425b1bdb2ec7de9eb33d1",
"assets/assets/cart.png": "c0484e32b5bf7bc8330b4134cd3ec852",
"assets/assets/safari.png": "9611a953905551ad5612457cc168488f",
"assets/assets/file.png": "f6bcd0c69d9c1284e1e72ab112835513",
"assets/assets/gitlab.png": "bc3c1f14326a57e9d3a22c523d420488",
"assets/assets/graph/index.html": "50e8ff70993f0817c933b8a89910d0e8",
"assets/assets/figma.png": "23b81ccea1bbeae6f88a9cd5aec7ae04",
"assets/assets/user3.jpg": "e2862a26a227b907764c094f3dd8202e",
"assets/assets/user2.jpg": "e50e46d165528a7f0bb518c899babedd",
"assets/assets/apple.png": "cc06fe8aeda933561e0b1bbaa21c1708",
"assets/assets/user1.jpg": "298202557bc740b9f360fcd5aa8a11d5",
"assets/assets/messenger.png": "74cec10b75f54428b1b51df463eb4ca8",
"assets/assets/slack.png": "d9fb2c471f3feaf933d12dacb7039b56",
"assets/assets/calendar.png": "1755ce73b4ab82c76c782789312ac852",
"assets/assets/user4.jpg": "54e168cd82a977b42070c96a9d87d267",
"assets/assets/dribble.png": "696824794adf6cc68076bdac65c8a07b",
"assets/assets/sketch.png": "cba58b7031a486cb889bd11b564c4522",
"assets/assets/products.png": "ac1f5fed4bc4dc45441eb2925c8f77ab",
"assets/assets/facebook.png": "dcf7f2901e604283d4357d7fc71622f5",
"assets/assets/chat.png": "b7e7b460fe8220cfaadeff31366c5c07"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
