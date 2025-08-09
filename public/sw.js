self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Basic notification click focus behavior
self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        const client = clientList[0]
        client.focus()
        return
      }
      self.clients.openWindow('/')
    })
  )
})

// Inject Ultraviolet (UV-Static) into the global service worker so it can proxy /uv/service/* for any page
try {
  ;(function(){
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
        try { importScripts(urls[i]); return true } catch (e) {}
      }
      return false
    }
    try { importScripts('/uv/uv.config.js') } catch (e) {}
    const ok1 = tryImport(bundles)
    const ok2 = tryImport(handlers)
    const ok3 = tryImport(swcores)
    // If initialized, create a dummy fetch to warm SW path
    if (ok1 && ok2 && ok3 && self.__uv$config?.prefix) {
      fetch(self.__uv$config.prefix + 'warmup').catch(()=>{})
    }
  })()
} catch {}


