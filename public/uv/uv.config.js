// Ultraviolet client configuration for static hosting on Vercel
// Uses CDN-hosted bundle/handler and a local rewrite-friendly Bare endpoint

/* eslint-disable */
self.__uv$config = {
  // UV-Static compatible prefix and assets loaded from the UV-Static repo.
  // No external Bare server required.
  prefix: "/uv/service/",
  // bare omitted intentionally — UV-Static handles requests in SW
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "https://cdn.jsdelivr.net/gh/TheTIW/UV-Static/static/uv.handler.js",
  bundle: "https://cdn.jsdelivr.net/gh/TheTIW/UV-Static/static/uv.bundle.js",
  config: "/uv/uv.config.js",
  sw: "/uv/uv.sw.js",
}


