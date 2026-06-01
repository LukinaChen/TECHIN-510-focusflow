'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcReward } from '@/lib/utils'

const ENCOURAGEMENTS = [
  "Amazing focus! You're building a great habit. 🧠",
  "You did it! Consistency is the key to mastery. 🔑",
  "Look at you go! Every focused session counts. ⭐",
  "Incredible! Your future self thanks you. 🙌",
  "You crushed it! Distraction didn't stand a chance. 💪",
  "Outstanding work! That's what dedication looks like. 🏆",
]

type TimerState = 'idle' | 'running' | 'completed' | 'broken' | 'cancelled'

const PRESETS = [
  { label: '25 min', value: 25 },
  { label: '50 min', value: 50 },
]

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function TimerPage() {
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [selectedDuration, setSelectedDuration] = useState(25)
  const [customInput, setCustomInput] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [focusLossCount, setFocusLossCount] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [topic, setTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [encouragement] = useState(
    () => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
  )

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<Date | null>(null)
  const selectedDurationRef = useRef(25)
  const timerStateRef = useRef<TimerState>('idle')
  const focusLossCountRef = useRef(0)
  const focusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completionGuardRef = useRef(false)
  const topicRef = useRef('')
  const notesRef = useRef('')

  useEffect(() => { selectedDurationRef.current = selectedDuration }, [selectedDuration])
  useEffect(() => { topicRef.current = topic }, [topic])
  useEffect(() => { notesRef.current = notes }, [notes])

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const saveSession = useCallback(async (completed: boolean) => {
    setSaving(true)
    const points = completed ? calcReward(selectedDurationRef.current) : 0
    setEarnedPoints(points)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !startedAtRef.current) return

      await supabase.from('sessions').insert({
        user_id: user.id,
        duration_minutes: selectedDurationRef.current,
        started_at: startedAtRef.current.toISOString(),
        completed,
        reward_earned: points,
        topic: topicRef.current || null,
        notes: notesRef.current || null,
      })
    } catch (err) {
      console.error('Failed to save session:', err)
    } finally {
      setSaving(false)
    }
  }, [])

  useEffect(() => {
    if (timerState !== 'running' || secondsLeft !== 0 || !startedAtRef.current || completionGuardRef.current) return
    completionGuardRef.current = true
    stopInterval()
    timerStateRef.current = 'completed'
    setTimerState('completed')
    saveSession(true)
  }, [secondsLeft, timerState, stopInterval, saveSession])

  const handleBroken = useCallback(() => {
    if (timerStateRef.current !== 'running') return
    stopInterval()
    timerStateRef.current = 'broken'
    setTimerState('broken')
    saveSession(false)
  }, [stopInterval, saveSession])

  const handleFocusLoss = useCallback(() => {
    if (timerStateRef.current !== 'running') return
    if (focusDebounceRef.current) return
    focusDebounceRef.current = setTimeout(() => { focusDebounceRef.current = null }, 500)

    const newCount = focusLossCountRef.current + 1
    focusLossCountRef.current = newCount
    setFocusLossCount(newCount)

    if (newCount === 1) setShowWarning(true)
    else handleBroken()
  }, [handleBroken])

  useEffect(() => {
    if (timerState !== 'running') return
    const onVisibilityChange = () => { if (document.hidden) handleFocusLoss() }
    const onBlur = () => handleFocusLoss()
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', onBlur)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onBlur)
    }
  }, [timerState, handleFocusLoss])

  function startTimer() {
    const seconds = selectedDuration * 60
    startedAtRef.current = new Date()
    timerStateRef.current = 'running'
    focusLossCountRef.current = 0
    completionGuardRef.current = false
    setFocusLossCount(0)
    setShowWarning(false)
    setSecondsLeft(seconds)
    setTimerState('running')
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
  }

  async function handleCancel() {
    if (!window.confirm('Cancel this focus session?')) return
    stopInterval()
    timerStateRef.current = 'cancelled'
    setTimerState('cancelled')
    await saveSession(false)
  }

  function reset() {
    stopInterval()
    timerStateRef.current = 'idle'
    focusLossCountRef.current = 0
    completionGuardRef.current = false
    startedAtRef.current = null
    setTimerState('idle')
    setSecondsLeft(0)
    setFocusLossCount(0)
    setShowWarning(false)
    setNotes('')
    setEarnedPoints(0)
  }

  function handleDurationSelect(mins: number) {
    setSelectedDuration(mins)
    setCustomInput('')
  }

  function handleCustomInput(value: string) {
    setCustomInput(value)
    const num = parseInt(value)
    if (!isNaN(num) && num >= 1 && num <= 120) setSelectedDuration(num)
  }

  // ─── Idle ────────────────────────────────────────────────────────────────
  if (timerState === 'idle') {
    return (
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Focus Session</h1>
          <p className="text-slate-500 mt-1">Choose a duration and stay on this page</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Class / Topic
          </p>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. TECHIN 510 — Week 9 lecture"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-5"
          />

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Presets
          </p>
          <div className="flex gap-3 mb-5">
            {PRESETS.map((preset) => {
              const active = selectedDuration === preset.value && !customInput
              return (
                <button
                  key={preset.value}
                  onClick={() => handleDurationSelect(preset.value)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Custom (1–120 min)
          </p>
          <input
            type="number"
            min="1"
            max="120"
            value={customInput}
            onChange={(e) => handleCustomInput(e.target.value)}
            placeholder="Enter minutes…"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
          />

          <p className="text-xs text-slate-400 text-center mb-4">
            {selectedDuration < 10 ? '5 pts' : selectedDuration < 30 ? '10 pts' : '20 pts'} on completion
          </p>

          <button
            onClick={startTimer}
            className="w-full py-4 bg-indigo-600 text-white text-base font-bold rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200"
          >
            Start {selectedDuration} min Focus
          </button>
        </div>
      </div>
    )
  }

  // ─── Running ─────────────────────────────────────────────────────────────
  if (timerState === 'running') {
    const totalSeconds = selectedDuration * 60
    const elapsed = totalSeconds - secondsLeft
    const progress = Math.min(100, (elapsed / totalSeconds) * 100)
    const focused = focusLossCount === 0

    return (
      <div className="max-w-sm mx-auto text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ${
          focused ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${focused ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          {focused ? 'Active' : 'Focus Lost!'}
        </div>

        {showWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between text-left">
            <p className="text-amber-800 text-sm font-medium">
              ⚠️ Focus lost — one more will break your session
            </p>
            <button onClick={() => setShowWarning(false)} className="ml-3 text-amber-500 hover:text-amber-700 text-lg leading-none" aria-label="Dismiss">✕</button>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm mb-4">
          {topic && <p className="text-xs font-medium text-indigo-400 mb-2">{topic}</p>}
          <div className="text-7xl font-mono font-bold text-slate-900 tracking-tight tabular-nums">
            {formatTime(secondsLeft)}
          </div>
          <p className="text-slate-400 mt-3 text-sm">{selectedDuration} minute session</p>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-6">
          <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
        </div>

        {/* Notes box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Session Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jot down key points from class…"
            rows={4}
            className="w-full text-sm text-slate-700 placeholder-slate-300 resize-none focus:outline-none"
          />
        </div>

        <button
          onClick={handleCancel}
          disabled={saving}
          className="px-8 py-2.5 text-slate-500 text-sm font-medium border border-slate-200 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-40"
        >
          Cancel Session
        </button>
      </div>
    )
  }

  // ─── Result states ────────────────────────────────────────────────────────
  const RESULT = {
    completed: {
      icon: '🎉',
      title: 'Session Complete!',
      message: encouragement,
      sub: `+${earnedPoints} points · ${selectedDuration} min session`,
      cardClass: 'bg-emerald-50 border-emerald-200',
      titleClass: 'text-emerald-800',
      badgeClass: 'bg-emerald-100 text-emerald-700',
    },
    broken: {
      icon: '❌',
      title: 'Session Broken',
      message: 'You lost focus twice — session ended early.',
      sub: '0 points earned',
      cardClass: 'bg-red-50 border-red-200',
      titleClass: 'text-red-800',
      badgeClass: 'bg-red-100 text-red-700',
    },
    cancelled: {
      icon: '⏹',
      title: 'Session Cancelled',
      message: 'You cancelled the session.',
      sub: '0 points earned',
      cardClass: 'bg-slate-100 border-slate-200',
      titleClass: 'text-slate-700',
      badgeClass: 'bg-slate-200 text-slate-600',
    },
  }

  const cfg = RESULT[timerState as 'completed' | 'broken' | 'cancelled']

  function exportSessionPdf() {
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const status = timerState === 'completed' ? 'Completed' : timerState === 'broken' ? 'Broken (focus lost)' : 'Cancelled'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>FocusFlow — ${topic || 'Session'} Notes</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 48px; color: #1e293b; max-width: 680px; margin: 0 auto; }
          h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
          .meta { color: #64748b; font-size: 13px; margin-bottom: 32px; }
          .meta span { margin-right: 16px; }
          .badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600;
            background: ${timerState === 'completed' ? '#d1fae5' : '#fee2e2'};
            color: ${timerState === 'completed' ? '#065f46' : '#991b1b'}; }
          .notes-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-top: 24px; min-height: 200px; }
          .notes-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; }
          .notes-text { font-size: 15px; line-height: 1.7; white-space: pre-wrap; color: #334155; }
          .no-notes { color: #94a3b8; font-style: italic; }
          @media print { body { padding: 24px; } }
        </style>
      </head>
      <body>
        <h1>${topic || 'Focus Session'}</h1>
        <div class="meta">
          <span>${date}</span>
          <span>${selectedDuration} min</span>
          <span class="badge">${status}</span>
          ${timerState === 'completed' ? `<span>+${earnedPoints} pts</span>` : ''}
        </div>
        <div class="notes-box">
          <div class="notes-label">Session Notes</div>
          ${notes
            ? `<div class="notes-text">${notes.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`
            : `<div class="no-notes">No notes taken during this session.</div>`
          }
        </div>
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
    <div className="max-w-sm mx-auto text-center">
      <div className={`border rounded-2xl p-8 mb-6 ${cfg.cardClass}`}>
        <div className="text-5xl mb-4">{cfg.icon}</div>
        <h2 className={`text-2xl font-bold mb-2 ${cfg.titleClass}`}>{cfg.title}</h2>
        <p className="text-slate-500 mb-4">{cfg.message}</p>
        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${cfg.badgeClass}`}>
          {cfg.sub}
        </span>
      </div>

      {saving && <p className="text-sm text-slate-400 mb-4">Saving session…</p>}

      <button
        onClick={exportSessionPdf}
        className="w-full py-3 mb-3 text-indigo-600 font-semibold border border-indigo-200 rounded-2xl hover:bg-indigo-50 transition-colors"
      >
        Export Notes as PDF
      </button>

      <button
        onClick={reset}
        disabled={saving}
        className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md shadow-indigo-200"
      >
        Start New Session
      </button>
    </div>
  )
}
