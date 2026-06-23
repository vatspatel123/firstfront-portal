import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMessageStore, useProjectStore } from '../../store/useApiStores'
import { useAuthStore } from '../../store/authStore'

export default function Messages() {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, loading, fetchMessages, sendMessage } = useMessageStore()
  const { projects, fetchProjects } = useProjectStore()
  const { user } = useAuthStore()

  useEffect(() => { fetchMessages(); fetchProjects() }, [fetchMessages, fetchProjects])

  const currentProject = projects[0]
  const projectId = currentProject?.id || ''

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    </div>
  )

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim() || !projectId) return
    sendMessage(projectId, input)
    setInput('')
    toast.success('Message sent')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="bg-white rounded-xl border overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        <div className="px-5 py-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
            {currentProject?.name?.[0] || 'P'}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{currentProject?.name || 'Select a project'}</p>
            <p className="text-xs text-gray-500">{messages.length} messages</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === user?.id
              return (
                <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {m.sender_name?.[0] || '?'}
                  </div>
                  <div className={`flex-1 max-w-[75%] ${isMe ? 'flex flex-col items-end' : ''}`}>
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      isMe ? 'bg-primary-600 text-white' : 'bg-white border border-gray-100'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 px-1">
                      {m.sender_name} · {new Date(m.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex items-end gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none max-h-32 focus:ring-2 focus:ring-primary-500"
            />
            <button onClick={send} disabled={!input.trim() || !projectId} className="bg-primary-600 text-white p-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
