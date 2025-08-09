// Ultraviolet client configuration for static hosting on Vercel
// Uses CDN-hosted bundle/handler and a local rewrite-friendly Bare endpoint

/* eslint-disable */
;(function(){
  const fallback = {
    handler: [
      "https://cdn.jsdelivr.net/gh/TheTIW/UV-Static/static/uv.handler.js",
      "https://cdn.statically.io/gh/TheTIW/UV-Static/main/static/uv.handler.js",
      "https://rawcdn.githack.com/TheTIW/UV-Static/main/static/uv.handler.js",
      "https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3/dist/uv.handler.js",
    ],
    bundle: [
      "https://cdn.jsdelivr.net/gh/TheTIW/UV-Static/static/uv.bundle.js",
      "https://cdn.statically.io/gh/TheTIW/UV-Static/main/static/uv.bundle.js",
      "https://rawcdn.githack.com/TheTIW/UV-Static/main/static/uv.bundle.js",
      "https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3/dist/uv.bundle.js",
    ],
  }

  function safeCodec() {
    try {
      // @ts-ignore
      if (typeof Ultraviolet !== 'undefined' && Ultraviolet?.codec?.xor) {
        // @ts-ignore
        return { enc: Ultraviolet.codec.xor.encode, dec: Ultraviolet.codec.xor.decode }
      }
    } catch {}
    return { enc: (u) => u, dec: (u) => u }
  }

  const { enc, dec } = safeCodec()

  self.__uv$config = {
    prefix: "/uv/",
    encodeUrl: enc,
    decodeUrl: dec,
    handler: fallback.handler[0],
    bundle: fallback.bundle[0],
    config: "/uv/uv.config.js",
    sw: "/uv/uv.sw.js",
  }
})()


