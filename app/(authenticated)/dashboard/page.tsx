import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Session = {
  id: string
  duration_minutes: number
  started_at: string
  completed: boolean
  reward_earned: number
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const sessions = (data ?? []) as Session[]
  const totalPoints = sessions.reduce((sum, s) => sum + s.reward_earned, 0)
  const completedCount = sessions.filter((s) => s.completed).length

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-indigo-600">{totalPoints}</div>
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-1">
            Total Points
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-emerald-600">{completedCount}</div>
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-1">
            Completed
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-slate-700">{sessions.length}</div>
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-1">
            Total Sessions
          </div>
        </div>
      </div>

      {/* Session history */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Session History</h2>
        </div>

        {sessions.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-slate-400 text-sm">No sessions yet.</p>
            <p className="text-slate-400 text-sm mt-1">
              Start a focus session to see your history here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-slate-800">
                    {session.duration_minutes} min
                  </span>
                  <span className="text-slate-400 text-sm ml-3">
                    {formatDate(session.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      session.completed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {session.completed ? 'Completed' : 'Incomplete'}
                  </span>
                  {session.reward_earned > 0 && (
                    <span className="text-sm font-bold text-indigo-600">
                      +{session.reward_earned}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
