import { useState, useEffect, useCallback } from 'react'
import { ArrowRight, RefreshCw, Send, Trash2, Users, UserPlus, TrendingUp, Mail } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || ''
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || ''

interface Stats {
  total: number
  active: number
  confirmed: number
  unsubscribed: number
  today: number
  this_week: number
  this_month: number
  daily_signups: { date: string; count: number }[]
}

interface Subscriber {
  id: number
  email: string
  source: string | null
  subscribed_at: string
  confirmed: boolean
  unsubscribed: boolean
}

interface EmailLog {
  id: number
  subject: string
  body_preview: string
  sent_at: string
  recipient_count: number
  resend_batch_id: string | null
}

const headers = () => ({
  'Content-Type': 'application/json',
  'x-admin-key': ADMIN_KEY,
})

export default function WaitlistAdmin() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [tab, setTab] = useState<'overview' | 'subscribers' | 'compose' | 'history'>('overview')
  const [loading, setLoading] = useState(true)

  // Compose state
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, subsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/waitlist/stats`, { headers: headers() }),
        fetch(`${API_BASE}/api/admin/waitlist/list?limit=200`, { headers: headers() }),
        fetch(`${API_BASE}/api/admin/waitlist/emails`, { headers: headers() }),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (subsRes.ok) setSubscribers(await subsRes.json())
      if (logsRes.ok) setEmailLogs(await logsRes.json())
    } catch (e) {
      console.error('Failed to fetch waitlist data', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleDelete = async (email: string) => {
    if (!confirm(`Remove ${email} permanently?`)) return
    await fetch(`${API_BASE}/api/admin/waitlist/delete?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: headers(),
    })
    fetchAll()
  }

  const handleSend = async () => {
    if (!subject.trim() || !htmlBody.trim()) return
    setSending(true)
    setSendResult(null)
    try {
      const resp = await fetch(`${API_BASE}/api/admin/waitlist/send`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ subject, html: htmlBody }),
      })
      const data = await resp.json()
      if (resp.ok) {
        setSendResult(`Sent to ${data.recipients} subscribers!`)
        setSubject('')
        setHtmlBody('')
        fetchAll()
      } else {
        setSendResult(`Error: ${data.error}`)
      }
    } catch {
      setSendResult('Failed to send. Check connection.')
    }
    setSending(false)
  }

  // Chart rendering
  const maxCount = stats ? Math.max(...stats.daily_signups.map(d => d.count), 1) : 1
  const chartWidth = 600
  const chartHeight = 160
  const barWidth = stats?.daily_signups.length ? Math.min(16, (chartWidth - 40) / stats.daily_signups.length - 2) : 16

  const card = (bg: string, border: string) => ({
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: '20px 24px',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#08080c', color: '#f0f0f2', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: '#7c5bf0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛡️</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>Waitlist Admin</h1>
        </div>
        <button onClick={fetchAll} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', color: '#8a8a9a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 0 }}>
        {(['overview', 'subscribers', 'compose', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '14px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t ? '2px solid #7c5bf0' : '2px solid transparent',
              color: tab === t ? '#f0f0f2' : '#8a8a9a',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
        {loading && !stats ? (
          <p style={{ color: '#8a8a9a' }}>Loading...</p>
        ) : tab === 'overview' && stats ? (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { icon: <Users size={16} />, label: 'Total Signups', value: stats.total, color: '#7c5bf0' },
                { icon: <UserPlus size={16} />, label: 'Today', value: stats.today, color: '#22c55e' },
                { icon: <TrendingUp size={16} />, label: 'This Week', value: stats.this_week, color: '#60a5fa' },
                { icon: <Mail size={16} />, label: 'Active', value: stats.active, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={card('rgba(255,255,255,0.03)', 'rgba(255,255,255,0.06)')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ color: s.color }}>{s.icon}</span>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8a8a9a' }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: '#f0f0f2' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Signup chart */}
            <div style={{ ...card('rgba(255,255,255,0.03)', 'rgba(255,255,255,0.06)'), marginBottom: 32 }}>
              <h3 style={{ fontSize: 13, color: '#8a8a9a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>Daily Signups (Last 30 Days)</h3>
              {stats.daily_signups.length > 0 ? (
                <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
                  {stats.daily_signups.map((d, i) => {
                    const barHeight = (d.count / maxCount) * (chartHeight - 30)
                    const x = (i / stats.daily_signups.length) * (chartWidth - 40) + 20
                    return (
                      <g key={d.date}>
                        <rect
                          x={x}
                          y={chartHeight - 20 - barHeight}
                          width={barWidth}
                          height={barHeight}
                          rx={3}
                          fill="#7c5bf0"
                          opacity={0.8}
                        />
                        {i % 7 === 0 && (
                          <text x={x} y={chartHeight - 4} fill="#8a8a9a" fontSize={9} fontFamily="'JetBrains Mono', monospace">
                            {d.date.slice(5)}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </svg>
              ) : (
                <p style={{ color: '#8a8a9a', fontSize: 13 }}>No signups yet. Share your landing page!</p>
              )}
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={card('rgba(255,255,255,0.03)', 'rgba(255,255,255,0.06)')}>
                <h3 style={{ fontSize: 13, color: '#8a8a9a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#8a8a9a' }}>Active subscribers</span>
                    <span style={{ color: '#22c55e', fontFamily: "'JetBrains Mono', monospace" }}>{stats.active}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#8a8a9a' }}>Unsubscribed</span>
                    <span style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>{stats.unsubscribed}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#8a8a9a' }}>This month</span>
                    <span style={{ color: '#60a5fa', fontFamily: "'JetBrains Mono', monospace" }}>{stats.this_month}</span>
                  </div>
                </div>
              </div>
              <div style={card('rgba(255,255,255,0.03)', 'rgba(255,255,255,0.06)')}>
                <h3 style={{ fontSize: 13, color: '#8a8a9a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Recent Emails Sent</h3>
                {emailLogs.length > 0 ? emailLogs.slice(0, 3).map(log => (
                  <div key={log.id} style={{ fontSize: 12, color: '#8a8a9a', marginBottom: 8 }}>
                    <span style={{ color: '#f0f0f2' }}>{log.subject}</span> — {log.recipient_count} recipients
                  </div>
                )) : (
                  <p style={{ color: '#8a8a9a', fontSize: 13 }}>No emails sent yet.</p>
                )}
              </div>
            </div>
          </>
        ) : tab === 'subscribers' ? (
          <>
            <div style={{ marginBottom: 16, fontSize: 13, color: '#8a8a9a' }}>
              {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
            </div>
            <div style={{ ...card('rgba(255,255,255,0.03)', 'rgba(255,255,255,0.06)'), padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Email', 'Source', 'Signed Up', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8a8a9a', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(sub => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: '#f0f0f2', fontFamily: "'JetBrains Mono', monospace" }}>{sub.email}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#8a8a9a' }}>{sub.source || '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#8a8a9a' }}>{new Date(sub.subscribed_at + 'Z').toLocaleDateString()}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          fontSize: 11,
                          padding: '3px 10px',
                          borderRadius: 100,
                          background: sub.unsubscribed ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                          color: sub.unsubscribed ? '#ef4444' : '#22c55e',
                          border: `1px solid ${sub.unsubscribed ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                        }}>
                          {sub.unsubscribed ? 'Unsubscribed' : 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <button onClick={() => handleDelete(sub.email)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6, padding: 4 }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : tab === 'compose' ? (
          <div style={{ maxWidth: 640 }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 24 }}>Send Email to Waitlist</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#8a8a9a', display: 'block', marginBottom: 6 }}>Subject</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Praesidio is launching — you're in!"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#f0f0f2',
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#8a8a9a', display: 'block', marginBottom: 6 }}>HTML Body</label>
              <textarea
                value={htmlBody}
                onChange={e => setHtmlBody(e.target.value)}
                rows={12}
                placeholder="<h1>We're live!</h1><p>Praesidio is now available...</p>"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#f0f0f2',
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={handleSend}
                disabled={sending || !subject.trim() || !htmlBody.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #7c5bf0 0%, #4a8bf5 100%)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  border: 'none',
                  cursor: sending ? 'wait' : 'pointer',
                  opacity: sending || !subject.trim() || !htmlBody.trim() ? 0.5 : 1,
                }}
              >
                <Send size={14} /> {sending ? 'Sending...' : 'Send to All Subscribers'}
              </button>
              {stats && <span style={{ fontSize: 12, color: '#8a8a9a' }}>Will send to {stats.active} active subscriber{stats.active !== 1 ? 's' : ''}</span>}
            </div>
            {sendResult && (
              <p style={{ marginTop: 16, fontSize: 13, color: sendResult.startsWith('Error') ? '#ef4444' : '#22c55e' }}>{sendResult}</p>
            )}
          </div>
        ) : tab === 'history' ? (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 24 }}>Email History</h2>
            {emailLogs.length === 0 ? (
              <p style={{ color: '#8a8a9a', fontSize: 13 }}>No emails sent yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {emailLogs.map(log => (
                  <div key={log.id} style={card('rgba(255,255,255,0.03)', 'rgba(255,255,255,0.06)')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 500 }}>{log.subject}</h3>
                      <span style={{ fontSize: 11, color: '#8a8a9a' }}>{new Date(log.sent_at + 'Z').toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#8a8a9a' }}>
                      <span><ArrowRight size={11} style={{ display: 'inline' }} /> {log.recipient_count} recipients</span>
                      {log.resend_batch_id && <span>Batch: {log.resend_batch_id.slice(0, 12)}...</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
