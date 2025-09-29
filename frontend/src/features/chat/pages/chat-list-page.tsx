import { ChatList } from '../components/chat-list'

export function ChatListPage() {
  return (
    <div className="mx-auto p-6 container">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 font-bold text-2xl">Messages</h1>
        <div className="h-[600px]">
          <ChatList />
        </div>
      </div>
    </div>
  )
}
