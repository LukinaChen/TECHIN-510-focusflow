'use client'

type Session = {
  id: string
  duration_minutes: number
  started_at: string
  completed: boolean
  reward_earned: number
  created_at: string
  topic: string | null
  notes: string | null
}

type Props = {
  sessions: Session[]
  totalPoints: number
  level: string
}

export default function ExportPdfButton({ sessions, totalPoints, level }: Props) {
  function handleExport() {
    const completedSessions = sessions.filter((s) => s.completed)

    const rows = sessions.map((s) => `
      <tr>
        <td>${s.topic ?? '—'}</td>
        <td>${s.duration_minutes} min</td>
        <td>${new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
        <td>${s.completed ? 'Completed' : 'Incomplete'}</td>
        <td>${s.reward_earned > 0 ? `+${s.reward_earned}` : '0'}</td>
        <td>${s.notes ?? ''}</td>
      </tr>
    `).join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>FocusFlow — Session Report</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
          .stats { display: flex; gap: 24px; margin-bottom: 28px; }
          .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 24px; text-align: center; }
          .stat-value { font-size: 28px; font-weight: 700; color: #4f46e5; }
          .stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { text-align: left; padding: 10px 12px; background: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; }
          td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
          td:last-child { color: #64748b; max-width: 200px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>FocusFlow — Session Report</h1>
        <p class="subtitle">Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <div class="stats">
          <div class="stat"><div class="stat-value">${totalPoints}</div><div class="stat-label">Total Points</div></div>
          <div class="stat"><div class="stat-value">${completedSessions.length}</div><div class="stat-label">Completed</div></div>
          <div class="stat"><div class="stat-value">${sessions.length}</div><div class="stat-label">Total Sessions</div></div>
          <div class="stat"><div class="stat-value">${level}</div><div class="stat-label">Level</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Topic</th><th>Duration</th><th>Date</th><th>Status</th><th>Points</th><th>Notes</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.print()
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
    >
      Export PDF
    </button>
  )
}
