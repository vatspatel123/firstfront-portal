import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMessageStore, useProjectStore } from '../../store/useApiStores'

interface Message {
  id: string
  sender: 'me' | 'them'
  name: string
  avatar: string
  text: string
  time: string
  attachments?: { name: string; size: string }[]
}

const initialMessages: Message[] = [
  { id: 'm1', sender: 'them', name: 'Priya Sharma', avatar: 'PS', text: 'Hi Rajesh! I\'ve started reviewing the site photos for Shanti Niketan Roof. Quick question — the KML file shows the roof tilted 18°, is that correct?', time: '2 hours ago' },
  { id: 'm2', sender: 'me', name: 'Rajesh Patel', avatar: 'RP', text: 'Yes, that\'s the actual tilt angle. The roof faces south-west.', time: '1 hour ago' },
  { id: 'm3', sender: 'them', name: 'Priya Sharma', avatar: 'PS', text: 'Perfect. I\'ll account for that in the shadow analysis. I\'ll have the initial report ready by tomorrow.', time: '1 hour ago' },
  { id: 'm4', sender: 'them', name: 'Priya Sharma', avatar: 'PS', text: 'I\'ve uploaded the first draft of the shadow analysis report. Let me know if you have any feedback!', time: '20 min ago', attachments: [{ name: 'shadow-draft-v1.pdf', size: '3.8 MB' }] },
]

export default function Messages() {
  const [localMessages, setLocalMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages: apiMessages, loading, fetchMessages, sendMessage } = useMessageStore()
  const { projects, fetchProjects } = useProjectStore()

  useEffect(() => { fetchMessages(); fetchProjects() }, [fetchMessages, fetchProjects])

  const currentProject = projects[0]
  const projectId = currentProject?.id || ''

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
      <div className="card overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        <div className="p-5 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
              <div className={`flex-1 ${i % 2 === 0 ? '' : 'flex flex-col items-end'}`}>
                <div className={`rounded-2xl px-4 py-2.5 bg-gray-100 animate-pulse ${i % 2 === 0 ? 'w-3/4' : 'w-1/2'} h-10`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [localMessages, apiMessages])

  const allMessages = [...localMessages, ...apiMessages.map((m): Message => ({
    id: m.id, sender: 'them' as const, name: m.sender_name, avatar: 'PS',
    text: m.text, time: new Date(m.created_at).toLocaleTimeString()
  }))]

  const send = () => {
    if (!input.trim()) return
    const newMsg: Message = { id: `m${Date.now()}`, sender: 'me', name: 'Rajesh Patel', avatar: 'RP', text: input, time: 'just now' }
    setLocalMessages([...localMessages, newMsg])
    sendMessage(projectId, input)
    setInput('')
    toast.success('Message sent')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button className="btn-ghost flex items-center gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="card overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-bold flex items-center justify-center">PS</div>
          <div className="flex-1">
            <p className="font-display font-medium text-ink">Priya Sharma</p>
            <p className="text-xs text-gray-500">{currentProject?.name || 'Project'} · <span className="text-success">● Online</span></p>
          </div>
          <button className="btn-ghost text-sm">View Project</button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-surface/50">
          <div className="text-center">
            <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full">Today</span>
          </div>
          {allMessages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.sender === 'me' ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {m.avatar}
              </div>
              <div className={`flex-1 max-w-[75%] ${m.sender === 'me' ? 'flex flex-col items-end' : ''}`}>
                <div className={`rounded-2xl px-4 py-2.5 ${
                  m.sender === 'me' ? 'bg-brand-500 text-white' : 'bg-white border border-gray-100'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                  {m.attachments && (
                    <div className="mt-2 space-y-1.5">
                      {m.attachments.map((a, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                          m.sender === 'me' ? 'bg-brand-600' : 'bg-gray-50'
                        }`}>
                          <Paperclip className="h-3 w-3" />
                          <span className="font-medium">{a.name}</span>
                          <span className="opacity-70">· {a.size}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 px-1">{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
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
              className="input-field flex-1 resize-none max-h-32"
            />
            <button onClick={send} disabled={!input.trim()} className="btn-primary !p-2.5">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
