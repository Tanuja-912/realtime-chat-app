import { create } from 'zustand'

export type Message = {
  id: string
  sender: string
  content: string
  status?: "sent" | "delivered" | "seen"
  reactions?: Record<string, number>
}

type PresenceStatus = "online" | "offline"

type ChatStore = {
  messages: Message[]

  // 🟢 NEW: presence map
  presence: Record<string, PresenceStatus>

  addMessage: (msg: Message) => void
  setMessages: (msgs: Message[]) => void

  updateMessageReaction: (messageId: string, emoji: string) => void

  // 🟢 NEW: presence updater
  setPresence: (userId: string, status: PresenceStatus) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],

  // 🟢 INITIAL PRESENCE STATE
  presence: {},

  // =====================
  // 💬 ADD MESSAGE
  // =====================
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  // =====================
  // 📦 SET MESSAGES
  // =====================
  setMessages: (msgs) =>
    set(() => ({
      messages: msgs,
    })),

  // =====================
  // ❤️ REACTIONS
  // =====================
  updateMessageReaction: (messageId, emoji) =>
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id !== messageId) return msg

        return {
          ...msg,
          reactions: {
            ...msg.reactions,
            [emoji]: (msg.reactions?.[emoji] || 0) + 1,
          },
        }
      }),
    })),

  // =====================
  // 🟢 PRESENCE UPDATE
  // =====================
  setPresence: (userId, status) =>
    set((state) => ({
      presence: {
        ...state.presence,
        [userId]: status,
      },
    })),
}))