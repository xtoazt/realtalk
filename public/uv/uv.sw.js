/* eslint-disable */
// UV-Static SW loader with resilient fallbacks
;(function () {
  const bundles = [
    'https://cdn.jsdelivr.net/gh/TheTIW/UV-Static/static/uv.bundle.js',
    'https://cdn.statically.io/gh/TheTIW/UV-Static/main/static/uv.bundle.js',
    'https://rawcdn.githack.com/TheTIW/UV-Static/main/static/uv.bundle.js',
    'https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3/dist/uv.bundle.js',
  ]
  const handlers = [
    'https://cdn.jsdelivr.net/gh/TheTIW/UV-Static/static/uv.handler.js',
    'https://cdn.statically.io/gh/TheTIW/UV-Static/main/static/uv.handler.js',
    'https://rawcdn.githack.com/TheTIW/UV-Static/main/static/uv.handler.js',
    'https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3/dist/uv.handler.js',
  ]
  const swcores = [
    'https://cdn.jsdelivr.net/gh/TheTIW/UV-Static/static/uv.sw.js',
    'https://cdn.statically.io/gh/TheTIW/UV-Static/main/static/uv.sw.js',
    'https://rawcdn.githack.com/TheTIW/UV-Static/main/static/uv.sw.js',
    'https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3/dist/uv.sw.js',
  ]

  function tryImport(urls) {
    for (let i = 0; i < urls.length; i++) {
      try {
        importScripts(urls[i])
        return true
      } catch (e) {}
    }
    return false
  }

  const ok1 = tryImport(bundles)
  const ok2 = tryImport(handlers)
  try {
    importScripts('/uv/uv.config.js')
  } catch (e) {}
  const ok3 = tryImport(swcores)
  if (!(ok1 && ok2 && ok3)) {
    // Failed to initialize UV; SW will still register but won't proxy
  }
})()


