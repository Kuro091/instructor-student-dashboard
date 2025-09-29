import { ChatWindow } from '../components/chat-window'

export function ChatConversationPage() {
  return (
    <div className="mx-auto p-6 container">
      <div className="mx-auto max-w-6xl">
        <div className="h-[700px]">
          <ChatWindow />
        </div>
      </div>
    </div>
  )
}
