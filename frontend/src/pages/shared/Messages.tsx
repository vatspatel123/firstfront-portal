import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, ArrowLeft, ChevronDown, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMessageStore, useProjectStore } from '../../store/useApiStores'
import { useAuthStore } from '../../store/authStore'

export default function Messages() {
  const [input, setInput] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, fetchMessages, sendMessage } = useMessageStore()
  const { projects, loading: projectsLoading, fetchProjects } = useProjectStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects])

  useEffect(() => {
    if (selectedProjectId) {
      fetchMessages(selectedProjectId)
    }
  }, [selectedProjectId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || !selectedProjectId) return
    try {
      await sendMessage(selectedProjectId, input)
      setInput('')
    } catch {
      toast.error('Failed to send message')
    }
  }

  if (projectsLoading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        {/* Header with project selector */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="relative">
              <select
                value={selectedProjectId || ''}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="appearance-none font-medium text-slate-900 pr-6 bg-transparent border-none focus:ring-0 cursor-pointer text-sm"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="text-xs text-slate-400">{messages.length} messages</div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
          {!selectedProjectId ? (
            <div className="text-center text-slate-400 py-8">
              <p>Select a project to view messages</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === user?.id
              return (
                <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    isMe ? 'bg-blue-600' : 'bg-slate-400'
                  }`}>
                    {m.sender_name?.[0] || '?'}
                  </div>
                  <div className={`flex-1 max-w-[75%] ${isMe ? 'flex flex-col items-end' : ''}`}>
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      isMe ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 px-1">
                      {m.sender_name} · {new Date(m.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-end gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder={selectedProjectId ? "Type a message..." : "Select a project first..."}
              disabled={!selectedProjectId}
              rows={1}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl resize-none max-h-32 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
            />
            <button onClick={send} disabled={!input.trim() || !selectedProjectId} className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
