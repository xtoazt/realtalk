/* eslint-disable */
// Minimal UV service worker loader using CDN bundle to keep repo light
importScripts(
  'https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3/dist/uv.bundle.js',
  '/uv/uv.config.js',
  'https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3/dist/uv.sw.js'
)


