import ChatSidebar from '@/components/chat/ChatSidebar'
import ChatWindow from '@/components/chat/ChatWindow'

export default function ChatPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar />
      <ChatWindow />
    </div>
  )
}