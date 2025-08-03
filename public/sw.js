if (!self.define) {
  let e,
    a = {};
  const s = (s, c) => (
    (s = new URL(s + '.js', c).href),
    a[s] ||
      new Promise((a) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = s), (e.onload = a), document.head.appendChild(e));
        } else ((e = s), importScripts(s), a());
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, i) => {
    const n =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (a[n]) return;
    let t = {};
    const r = (e) => s(e, n),
      f = { module: { uri: n }, exports: t, require: r };
    a[n] = Promise.all(c.map((e) => f[e] || r(e))).then((e) => (i(...e), t));
  };
}
define(['./workbox-4754cb34'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/static/SMRLmQG1ot0KqcLCU6cQG/_buildManifest.js',
          revision: '77cf76c3ae587faf5bb9537910b6a34e',
        },
        {
          url: '/_next/static/SMRLmQG1ot0KqcLCU6cQG/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/115-ac998548e5a1f846.js',
          revision: 'ac998548e5a1f846',
        },
        {
          url: '/_next/static/chunks/249-ce8fa38df7e7ab16.js',
          revision: 'ce8fa38df7e7ab16',
        },
        {
          url: '/_next/static/chunks/42-51ea3c8bddffdddf.js',
          revision: '51ea3c8bddffdddf',
        },
        {
          url: '/_next/static/chunks/4bd1b696-cf72ae8a39fa05aa.js',
          revision: 'cf72ae8a39fa05aa',
        },
        {
          url: '/_next/static/chunks/521-067c312db5f9b107.js',
          revision: '067c312db5f9b107',
        },
        {
          url: '/_next/static/chunks/555-88a76364464a1273.js',
          revision: '88a76364464a1273',
        },
        {
          url: '/_next/static/chunks/7508b87c-999fb5c47b7ef01e.js',
          revision: '999fb5c47b7ef01e',
        },
        {
          url: '/_next/static/chunks/808-40f4411557355b91.js',
          revision: '40f4411557355b91',
        },
        {
          url: '/_next/static/chunks/964-c3e49cf7341645bb.js',
          revision: 'c3e49cf7341645bb',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-94048657565bcaf3.js',
          revision: '94048657565bcaf3',
        },
        {
          url: '/_next/static/chunks/app/join/%5Bcode%5D/page-e6806d84c7607b13.js',
          revision: 'e6806d84c7607b13',
        },
        {
          url: '/_next/static/chunks/app/layout-5603786cfc42d0ee.js',
          revision: '5603786cfc42d0ee',
        },
        {
          url: '/_next/static/chunks/app/page-aecffa6aea9d57e3.js',
          revision: 'aecffa6aea9d57e3',
        },
        {
          url: '/_next/static/chunks/app/trip/%5BtripId%5D/budget/page-7817cca2f0ba813c.js',
          revision: '7817cca2f0ba813c',
        },
        {
          url: '/_next/static/chunks/app/trip/%5BtripId%5D/checklist/page-b61ee7611d94e6c8.js',
          revision: 'b61ee7611d94e6c8',
        },
        {
          url: '/_next/static/chunks/app/trip/%5BtripId%5D/files/page-6aaad6c0bfbb602e.js',
          revision: '6aaad6c0bfbb602e',
        },
        {
          url: '/_next/static/chunks/app/trip/%5BtripId%5D/layout-986c151181e04aa1.js',
          revision: '986c151181e04aa1',
        },
        {
          url: '/_next/static/chunks/app/trip/%5BtripId%5D/memo/page-005c9239a588354a.js',
          revision: '005c9239a588354a',
        },
        {
          url: '/_next/static/chunks/app/trip/%5BtripId%5D/page-4600bcce99ed1304.js',
          revision: '4600bcce99ed1304',
        },
        {
          url: '/_next/static/chunks/dd8162e8-afa4e1516459be9b.js',
          revision: 'afa4e1516459be9b',
        },
        {
          url: '/_next/static/chunks/framework-7c95b8e5103c9e90.js',
          revision: '7c95b8e5103c9e90',
        },
        {
          url: '/_next/static/chunks/main-app-3ba70990913a05c4.js',
          revision: '3ba70990913a05c4',
        },
        {
          url: '/_next/static/chunks/main-cd3f8eefaa2e6a9e.js',
          revision: 'cd3f8eefaa2e6a9e',
        },
        {
          url: '/_next/static/chunks/pages/_app-0a0020ddd67f79cf.js',
          revision: '0a0020ddd67f79cf',
        },
        {
          url: '/_next/static/chunks/pages/_error-03529f2c21436739.js',
          revision: '03529f2c21436739',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-8c94b35adf29e9b1.js',
          revision: '8c94b35adf29e9b1',
        },
        {
          url: '/_next/static/css/27f64f03aff400af.css',
          revision: '27f64f03aff400af',
        },
        {
          url: '/_next/static/media/569ce4b8f30dc480-s.p.woff2',
          revision: 'ef6cefb32024deac234e82f932a95cbd',
        },
        {
          url: '/_next/static/media/747892c23ea88013-s.woff2',
          revision: 'a0761690ccf4441ace5cec893b82d4ab',
        },
        {
          url: '/_next/static/media/8d697b304b401681-s.woff2',
          revision: 'cc728f6c0adb04da0dfcb0fc436a8ae5',
        },
        {
          url: '/_next/static/media/93f479601ee12b01-s.p.woff2',
          revision: 'da83d5f06d825c5ae65b7cca706cb312',
        },
        {
          url: '/_next/static/media/9610d9e46709d722-s.woff2',
          revision: '7b7c0ef93df188a852344fc272fc096b',
        },
        {
          url: '/_next/static/media/ba015fad6dcf6784-s.woff2',
          revision: '8ea4f719af3312a055caf09f34c89a77',
        },
        {
          url: '/apple-touch-icon.png',
          revision: '03935195b9f5b957cd0a586b22905416',
        },
        {
          url: '/correction/time.PNG',
          revision: 'a00ec7c6ed0fe85f7181d4b179130ac7',
        },
        {
          url: '/favicon-16x16.png',
          revision: 'f0b3f7018bc19d393f7b0c58d1ac767f',
        },
        {
          url: '/favicon-32x32.png',
          revision: '40d376a8e1e8a365cf35aae38e1d61d4',
        },
        { url: '/favicon.ico', revision: '40d376a8e1e8a365cf35aae38e1d61d4' },
        { url: '/file.svg', revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71' },
        { url: '/globe.svg', revision: '2aaafa6a49b6563925fe440891e32717' },
        {
          url: '/icon-192x192.png',
          revision: '425216de6ca64c9dc8ad2b1117e977dd',
        },
        {
          url: '/icon-512x512.png',
          revision: 'c57c56d77e04f492dc8cebf2ad17e9c7',
        },
        { url: '/icon.png', revision: 'b48298a8c0c0c08a62f03796fa45f43f' },
        { url: '/manifest.json', revision: '577b4bd3abc848df9cfe1529b7a76f2a' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/vercel.svg', revision: 'c0af2f507b369b085b35ef4bbe3bcf1e' },
        { url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: a,
              event: s,
              state: c,
            }) =>
              a && 'opaqueredirect' === a.type
                ? new Response(a.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: a.headers,
                  })
                : a,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const a = e.pathname;
        return !a.startsWith('/api/auth/') && !!a.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      'GET'
    ));
});
