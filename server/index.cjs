const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// =========================
// ROOM USERS + PRESENCE
// =========================
const roomUsers = {}
const onlineUsers = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // =========================
  // 🟢 USER ONLINE
  // =========================
  socket.on('user-online', (userId) => {
    onlineUsers.set(userId, socket.id)

    io.emit('presence-update', {
      userId,
      status: 'online',
    })
  })

  // =========================
  // 💬 CHAT SYSTEM
  // =========================
  socket.on('send_message', (data) => {
    if (data.roomId) {
      socket.to(data.roomId).emit('receive_message', data)
    } else {
      socket.broadcast.emit('receive_message', data)
    }
  })

  // =========================
  // ❤️ REACTIONS
  // =========================
  socket.on('add-reaction', ({ messageId, emoji }) => {
    io.emit('reaction-updated', {
      messageId,
      emoji,
    })
  })

  // =========================
  // ⌨️ TYPING
  // =========================
  socket.on('typing', (roomId) => {
    socket.to(roomId).emit('user-typing', {
      userId: socket.id,
    })
  })

  socket.on('stop-typing', (roomId) => {
    socket.to(roomId).emit('user-stop-typing', {
      userId: socket.id,
    })
  })

  // =========================
  // 🎥 ROOM JOIN
  // =========================
  socket.on('join-room', (roomId) => {
    socket.join(roomId)

    if (!roomUsers[roomId]) {
      roomUsers[roomId] = []
    }

    roomUsers[roomId].push(socket.id)

    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
    })

    socket.emit(
      'all-users',
      roomUsers[roomId].filter((id) => id !== socket.id)
    )
  })

  // =========================
  // 🎥 LEAVE ROOM
  // =========================
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId)

    if (roomUsers[roomId]) {
      roomUsers[roomId] = roomUsers[roomId].filter(
        (id) => id !== socket.id
      )
    }

    socket.to(roomId).emit('user-left', {
      userId: socket.id,
    })
  })

  // =========================
  // 📞 WEBRTC SIGNALING
  // =========================
  socket.on('signal', ({ userToSignal, signal, callerId }) => {
    io.to(userToSignal).emit('signal', {
      signal,
      callerId,
    })
  })

  socket.on('call-user', ({ userToCall, signalData, from }) => {
    io.to(userToCall).emit('incoming-call', {
      from,
      signal: signalData,
    })
  })

  socket.on('answer-call', ({ to, signal }) => {
    io.to(to).emit('call-accepted', {
      signal,
      from: socket.id,
    })
  })

  // =========================
  // 📩 READ RECEIPTS (FIXED)
  // =========================
  socket.on('message-sent', ({ messageId }) => {
    socket.broadcast.emit('message-delivered', { messageId })
  })

  socket.on('message-seen', ({ messageId }) => {
    io.emit('message-seen', { messageId })
  })

  // =========================
  // ❌ DISCONNECT
  // =========================
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)

    // remove from presence map
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId)

        io.emit('presence-update', {
          userId,
          status: 'offline',
          lastSeen: Date.now(),
        })
        break
      }
    }

    // remove from rooms
    for (const roomId in roomUsers) {
      roomUsers[roomId] = roomUsers[roomId].filter(
        (id) => id !== socket.id
      )

      socket.to(roomId).emit('user-left', {
        userId: socket.id,
      })
    }
  })
})

// =========================
// 🚀 START SERVER
// =========================
server.listen(5000, () => {
  console.log('Server running on port 5000')
})