// Custom Next.js server with integrated Socket.IO for voice signaling
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Socket.IO for voice signaling
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  })

  // Voice chat signaling logic
  const roomToSockets = new Map()
  const socketInfo = new Map()

  io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, userId }) => {
      if (!roomId || !userId) return

      socket.join(roomId)
      socketInfo.set(socket.id, { roomId, userId })

      if (!roomToSockets.has(roomId)) roomToSockets.set(roomId, new Set())
      roomToSockets.get(roomId).add(socket.id)

      socket.to(roomId).emit('user-joined', { socketId: socket.id, userId })

      const peers = Array.from(roomToSockets.get(roomId)).filter((id) => id !== socket.id)
      socket.emit('room-peers', peers.map((id) => ({ socketId: id, userId: socketInfo.get(id)?.userId })))
    })

    socket.on('signal-offer', ({ to, description }) => {
      io.to(to).emit('signal-offer', { from: socket.id, description })
    })

    socket.on('signal-answer', ({ to, description }) => {
      io.to(to).emit('signal-answer', { from: socket.id, description })
    })

    socket.on('signal-ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('signal-ice-candidate', { from: socket.id, candidate })
    })

    socket.on('leave-room', () => {
      const info = socketInfo.get(socket.id)
      if (!info) return
      const { roomId, userId } = info
      socket.leave(roomId)
      socketInfo.delete(socket.id)
      const set = roomToSockets.get(roomId)
      if (set) {
        set.delete(socket.id)
        if (set.size === 0) roomToSockets.delete(roomId)
      }
      socket.to(roomId).emit('user-left', { socketId: socket.id, userId })
    })

    socket.on('disconnect', () => {
      const info = socketInfo.get(socket.id)
      if (!info) return
      const { roomId, userId } = info
      socketInfo.delete(socket.id)
      const set = roomToSockets.get(roomId)
      if (set) {
        set.delete(socket.id)
        if (set.size === 0) roomToSockets.delete(roomId)
      }
      socket.to(roomId).emit('user-left', { socketId: socket.id, userId })
    })
  })

  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Voice signaling integrated`)
  })
})

