// Ultraviolet client configuration for static hosting on Vercel
// Uses CDN-hosted bundle/handler and a local rewrite-friendly Bare endpoint

/* eslint-disable */
self.__uv$config = {
  prefix: "/uv/service/",
  bare: "/bare/", // Configure a rewrite to an external Bare server in next.config.mjs
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3/dist/uv.handler.js",
  bundle: "https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3/dist/uv.bundle.js",
  config: "/uv/uv.config.js",
  sw: "/uv/uv.sw.js",
}


