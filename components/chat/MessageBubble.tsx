import { useState } from "react"
import { socket } from "@/services/socket/socket"
import { motion } from "framer-motion"

interface Props {
  message: {
    id?: string
    sender: string
    content: string
    type?: "text" | "file"
    reactions?: Record<string, number>
    status?: "sent" | "delivered" | "seen"
  }
}

const emojis = ["❤️", "😂", "👍", "🔥"]

export default function MessageBubble({ message }: Props) {
  const [showReactions, setShowReactions] = useState(false)

  const addReaction = (emoji: string) => {
    socket.emit("add-reaction", {
      messageId: message.id,
      emoji,
    })

    setShowReactions(false)
  }

  return (
    <div className="flex justify-end relative group">

      {/* 🟢 ANIMATED MESSAGE BUBBLE */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-blue-500 px-4 py-2 rounded-2xl max-w-[60%] text-white"
      >

        {/* sender */}
        <p className="text-sm opacity-70">
          {message.sender}
        </p>

        {/* message content */}
        <div className="flex justify-between items-end gap-3 mt-1">

          {/* TEXT OR FILE */}
          {message.type === "file" ? (
            <img
              src={message.content}
              alt="file"
              className="rounded-lg max-w-[200px]"
            />
          ) : (
            <p className="break-words">{message.content}</p>
          )}

          {/* status ticks */}
          {message.status && (
            <span className="text-[10px] whitespace-nowrap opacity-80 ml-2">
              {message.status === "sent" && "✓"}
              {message.status === "delivered" && "✓✓"}
              {message.status === "seen" && (
                <span className="text-blue-300">✓✓</span>
              )}
            </span>
          )}
        </div>

        {/* reactions display */}
        {message.reactions && (
          <div className="flex gap-1 mt-2 text-sm">
            {Object.entries(message.reactions).map(([emoji, count]) => (
              <span
                key={emoji}
                className="bg-blue-700 px-2 rounded-full"
              >
                {emoji} {count}
              </span>
            ))}
          </div>
        )}

      </motion.div>

      {/* Reaction button */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="absolute -bottom-6 text-xs text-gray-300"
      >
        React
      </button>

      {/* emoji picker */}
      {showReactions && (
        <div className="absolute bottom-12 right-0 bg-black border border-zinc-700 p-2 rounded flex gap-2">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addReaction(emoji)}
              className="text-xl hover:scale-125 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

    </div>
  )
}