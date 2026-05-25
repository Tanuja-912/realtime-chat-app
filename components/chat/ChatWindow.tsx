'use client'

import { uploadFile } from '@/utils/uploadFile'
import { useEffect, useState } from 'react'
import { Smile } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { socket } from '@/services/socket/socket'
import { useChatStore } from '@/store/chatStore'
import { useThemeStore } from '@/store/themeStore'

import TypingIndicator from '@/components/TypingIndicator'
import VoiceCall from '@/components/VoiceCall'
import VideoCall from '@/components/VideoCall'
import MessageBubble from './MessageBubble'
import EmojiPickerComponent from './EmojiPicker'
import VoiceRecorder from './VoiceRecorder'

type Theme = 'dark' | 'ocean' | 'sunset' | 'space' | 'neon' | 'glass'

interface Message {
  id: string
  sender: string
  content: string
  type?: 'text' | 'file'
  status?: 'sent' | 'delivered' | 'seen'
}

// 🟢 MOCK USERS
const users = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
]

export default function ChatWindow() {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [callType, setCallType] = useState<null | 'voice' | 'video'>(null)
  const [isTyping, setIsTyping] = useState(false)

  const roomId = 'global-room'

  const { theme, setTheme } = useThemeStore()

  const {
    messages,
    addMessage,
    updateMessageReaction,
    presence,
    setPresence,
  } = useChatStore()

  // ================= SOCKET =================
  useEffect(() => {
    socket.on('receive_message', (data: Message) => {
      addMessage(data)
    })

    socket.on('reaction-updated', ({ messageId, emoji }) => {
      updateMessageReaction(messageId, emoji)
    })

    socket.on('user-typing', () => setIsTyping(true))
    socket.on('user-stop-typing', () => setIsTyping(false))

    socket.on('presence-update', ({ userId, status }) => {
      setPresence(userId, status)
    })

    return () => {
      socket.off('receive_message')
      socket.off('reaction-updated')
      socket.off('user-typing')
      socket.off('user-stop-typing')
      socket.off('presence-update')
    }
  }, [addMessage, updateMessageReaction, setPresence])

  // ================= SEND MESSAGE =================
  const sendMessage = () => {
    if (!message.trim()) return

    const payload: Message = {
      id: crypto.randomUUID(),
      sender: 'You',
      content: message,
      type: 'text',
      status: 'sent',
    }

    socket.emit('send_message', {
      ...payload,
      roomId,
    })

    socket.emit('message-sent', { messageId: payload.id })
    socket.emit('stop-typing', roomId)

    addMessage(payload)
    setMessage('')
  }

  // ================= FILE UPLOAD =================
  const handleFileUpload = async (file: File) => {
    const data = await uploadFile(file)
    if (!data) return

    const payload: Message = {
      id: crypto.randomUUID(),
      sender: 'You',
      content: data.url,
      type: 'file',
      status: 'sent',
    }

    socket.emit('send_message', {
      ...payload,
      roomId,
    })

    socket.emit('message-sent', { messageId: payload.id })

    addMessage(payload)
  }

  // ================= CALLS =================
  const startVoiceCall = () => {
    socket.emit('join-room', roomId)
    setCallType('voice')
  }

  const startVideoCall = () => {
    socket.emit('join-room', roomId)
    setCallType('video')
  }

  const themes: Record<Theme, string> = {
    dark: 'bg-black',
    ocean:
      "bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')] bg-cover bg-center",
    sunset:
      "bg-[url('https://images.unsplash.com/photo-1493246507139-91e8fad9978e')] bg-cover bg-center",
    space:
      "bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564')] bg-cover bg-center",
    neon:
      'bg-gradient-to-br from-purple-900 via-black to-pink-700',
    glass: 'bg-white/10 backdrop-blur-md',
  }

  return (
    <div className="flex-1 text-white flex flex-col relative overflow-hidden">

      {/* BACKGROUND */}
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 ${themes[theme]}`}
        />
      </AnimatePresence>

      <div className="relative z-10 flex flex-col flex-1">

        {/* THEME */}
        <div className="flex gap-2 p-3 border-b border-zinc-800 bg-black/40">
          <button onClick={() => setTheme('dark')}>🖤 Dark</button>
          <button onClick={() => setTheme('ocean')}>🌊 Ocean</button>
          <button onClick={() => setTheme('sunset')}>🌇 Sunset</button>
          <button onClick={() => setTheme('space')}>🌌 Space</button>
          <button onClick={() => setTheme('neon')}>💜 Neon</button>
        </div>

        {/* USERS */}
        <div className="p-3 border-b border-zinc-800 bg-black/30">
          <h2 className="text-sm mb-2 text-gray-300">Users</h2>

          <div className="flex gap-4 overflow-x-auto">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-2">

                <div
                  className={`w-2 h-2 rounded-full ${
                    presence[user.id] === 'online'
                      ? 'bg-green-500'
                      : 'bg-gray-500'
                  }`}
                />

                <span className="text-sm">{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MESSAGES WITH ANIMATION */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          <AnimatePresence>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {isTyping && <TypingIndicator />}
        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-zinc-800 flex gap-3 items-center bg-black/40">

          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Smile size={28} />
          </button>

          <input
            className="flex-1 bg-zinc-900/80 p-3 rounded-lg outline-none"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              socket.emit('typing', roomId)
            }}
            onBlur={() => socket.emit('stop-typing', roomId)}
            placeholder="Type a message"
          />

          <input
            type="file"
            className="hidden"
            id="fileUpload"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              await handleFileUpload(file)
            }}
          />

          <label
            htmlFor="fileUpload"
            className="cursor-pointer bg-gray-700 px-3 py-2 rounded"
          >
            📎
          </label>

          <VoiceRecorder />

          <button
            onClick={startVoiceCall}
            className="bg-green-500 px-4 py-3 rounded-lg"
          >
            🎤 Call
          </button>

          <button
            onClick={startVideoCall}
            className="bg-purple-500 px-4 py-3 rounded-lg"
          >
            🎥 Video
          </button>

          <button
            onClick={sendMessage}
            className="bg-blue-500 px-6 py-3 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>

      {/* CALL MODAL */}
      {callType && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">

          {callType === 'voice' && <VoiceCall roomId={roomId} />}
          {callType === 'video' && <VideoCall roomId={roomId} />}

          <button
            onClick={() => setCallType(null)}
            className="absolute top-4 right-4 bg-red-500 px-3 py-2 rounded"
          >
            Close
          </button>

        </div>
      )}
    </div>
  )
}