/* eslint-disable */
// Minimal UV service worker loader using CDN bundle to keep repo light
importScripts(
  'https://cdn.jsdelivr.net/gh/TheTIW/UV-Static/static/uv.bundle.js',
  'https://cdn.jsdelivr.net/gh/TheTIW/UV-Static/static/uv.handler.js',
  '/uv/uv.config.js',
  'https://cdn.jsdelivr.net/gh/TheTIW/UV-Static/static/uv.sw.js'
)


