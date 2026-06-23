import { useEffect, useState } from 'react'
import API from '../../utils/api'
import { CalendarCheck } from 'lucide-react'

export default function Followups() {
  const [followups, setFollowups] = useState([])

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        const res = await API.get('/api/leads/followups/today')
        setFollowups(res.data)
      } catch (err) {
        console.error('Failed to load followups', err)
      }
    }
    fetchFollowups()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Today's Follow-ups</h1>
      <div className="bg-white rounded-xl border">
        {followups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CalendarCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No follow-ups scheduled for today</p>
          </div>
        ) : (
          <div className="divide-y">
            {followups.map((fu: any) => (
              <div key={fu.id} className="p-4">
                <p className="font-medium">{fu.note}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Lead ID: {fu.lead_id} | Status: {fu.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
