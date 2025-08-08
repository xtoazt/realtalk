// Simple Socket.IO signaling server for WebRTC voice rooms
// Run with: node server/voice-socket-server.js

const http = require('http')
const { Server } = require('socket.io')

const PORT = process.env.VOICE_SERVER_PORT || 4000
const server = http.createServer()
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
})

// roomId -> Set(socket.id)
const roomToSockets = new Map()
// socket.id -> { roomId, userId }
const socketInfo = new Map()

io.on('connection', (socket) => {
  socket.on('join-room', ({ roomId, userId }) => {
    if (!roomId || !userId) return

    socket.join(roomId)
    socketInfo.set(socket.id, { roomId, userId })

    if (!roomToSockets.has(roomId)) roomToSockets.set(roomId, new Set())
    roomToSockets.get(roomId).add(socket.id)

    // Notify others in room
    socket.to(roomId).emit('user-joined', { socketId: socket.id, userId })

    // Send back current peers in the room to the new user
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

server.listen(PORT, () => {
  console.log(`[voice] Socket.IO signaling server listening on ${PORT}`)
})



