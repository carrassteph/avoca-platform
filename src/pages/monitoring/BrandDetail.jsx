import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import { BRAND_METRICS, CALL_RECORDS } from '../../data/monitoringData'

// ─── Metric card (same as Monitoring.jsx) ─────────────────────────────────────

function MetricCard({ label, value, unit, trend, trendLabel, invertColor, grayTrend }) {
  const color = grayTrend || trend === 0 || trend === undefined
    ? 'var(--text-tertiary)'
    : (invertColor ? trend < 0 : trend > 0)
      ? 'var(--green-text)'
      : 'var(--red-text)'

  return (
    <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px', background: '#fff' }}>
      <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1 }}>
        {value}{unit && <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 2 }}>{unit}</span>}
      </div>
      {trendLabel && (
        <div style={{ fontSize: 'var(--fs-label)', color }}>{trendLabel}</div>
      )}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TIME_WINDOWS = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
  { value: 'last90', label: 'Last 90 days' },
]

function formatTime(ts) {
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function OutcomeBadge({ outcome }) {
  const cfg = {
    booked:     { bg: 'var(--green-bg)', color: 'var(--green-text)', label: 'Booked' },
    escalated:  { bg: 'var(--amber-bg)', color: 'var(--amber-text)', label: 'Escalated' },
    unresolved: { bg: 'var(--red-bg)',   color: 'var(--red-text)',   label: 'Unresolved' },
  }[outcome] || { bg: 'var(--surface-2)', color: 'var(--text-secondary)', label: outcome }
  return (
    <span style={{ fontSize: 'var(--fs-label)', fontWeight: 600, background: cfg.bg, color: cfg.color, padding: '2px 8px', borderRadius: 4 }}>
      {cfg.label}
    </span>
  )
}

function ScoreValue({ score }) {
  const color = score >= 80 ? 'var(--green-text)' : score >= 50 ? 'var(--amber-text)' : 'var(--red-text)'
  return <span style={{ fontSize: 'var(--fs-table)', fontWeight: 600, color }}>{score}</span>
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BrandDetail() {
  const { brandId } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()

  const [timeWindow, setTimeWindow] = useState('last7')
  const [expandedCallId, setExpandedCallId] = useState(null)

  const brand = state.brands.find(b => b.id === brandId)
  const agent = state.agents.find(a => a.brandId === brandId)
  const metrics = BRAND_METRICS[brandId]?.[timeWindow]
  const calls = CALL_RECORDS[brandId] || []

  if (!brand) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontSize: 'var(--fs-body)' }}>
        Brand not found.
      </div>
    )
  }

  const selectStyle = {
    padding: '5px 10px', fontSize: 'var(--fs-body)',
    border: '1px solid var(--border)', borderRadius: 6,
    background: '#fff', color: 'var(--text-primary)',
    cursor: 'pointer', outline: 'none',
  }

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <button
            onClick={() => navigate('/monitoring')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-body)', padding: 0, marginBottom: 6 }}
          >
            <ChevronLeft size={14} /> Monitoring
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{brand.name}</h1>
            {agent && <StatusBadge status={agent.status} />}
          </div>
          <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)', marginTop: 2 }}>{brand.region}</div>
        </div>
        <select value={timeWindow} onChange={e => setTimeWindow(e.target.value)} style={selectStyle}>
          {TIME_WINDOWS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
        </select>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
        <MetricCard
          label="Total calls handled"
          value={metrics?.totalCalls ?? 0}
          trend={metrics?.trends?.calls}
          trendLabel={metrics?.trends?.calls !== undefined ? `${metrics.trends.calls > 0 ? '+' : ''}${metrics.trends.calls} vs last period` : undefined}
        />
        <MetricCard
          label="Booking rate"
          value={metrics?.bookingRate ?? 0}
          unit="%"
          trend={metrics?.trends?.booking}
          trendLabel={metrics?.trends?.booking !== undefined ? `${metrics.trends.booking > 0 ? '+' : ''}${metrics.trends.booking}pp vs last period` : undefined}
        />
        <MetricCard
          label="Escalation rate"
          value={metrics?.escalationRate ?? 0}
          unit="%"
          trend={metrics?.trends?.escalation}
          trendLabel={metrics?.trends?.escalation !== undefined ? `${metrics.trends.escalation > 0 ? '+' : ''}${metrics.trends.escalation}pp vs last period` : undefined}
          invertColor
        />
        <MetricCard
          label="Avg call duration"
          value={metrics?.avgDuration ?? 0}
          unit=" min"
          trend={metrics?.trends?.duration}
          trendLabel={metrics?.trends?.duration !== undefined ? `${metrics.trends.duration > 0 ? '+' : ''}${metrics.trends.duration}m vs last period` : undefined}
          grayTrend
        />
      </div>

      {/* Calls table */}
      <div style={{ marginBottom: 8, fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-primary)' }}>Recent calls</div>

      {calls.length === 0 ? (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '60px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--fs-body)' }}>
          No calls recorded yet for this brand.
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-1)' }}>
                {['Time', 'Caller ID', 'Duration', 'Outcome', 'Score', ''].map(h => (
                  <th key={h} style={{
                    padding: '8px 12px', textAlign: 'left',
                    fontSize: 'var(--fs-label)', fontWeight: 500,
                    color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calls.map((call, i) => {
                const isExpanded = expandedCallId === call.id
                return (
                  <>
                    <tr
                      key={call.id}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 12px', fontSize: 'var(--fs-table)', color: 'var(--text-secondary)', borderBottom: isExpanded ? 'none' : '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                        {formatTime(call.timestamp)}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 'var(--fs-table)', color: 'var(--text-secondary)', borderBottom: isExpanded ? 'none' : '1px solid var(--border)', fontFamily: 'monospace' }}>
                        {call.callerId}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 'var(--fs-table)', color: 'var(--text-secondary)', borderBottom: isExpanded ? 'none' : '1px solid var(--border)' }}>
                        {call.duration}m
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: isExpanded ? 'none' : '1px solid var(--border)' }}>
                        <OutcomeBadge outcome={call.outcome} />
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: isExpanded ? 'none' : '1px solid var(--border)' }}>
                        <ScoreValue score={call.score} />
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: isExpanded ? 'none' : '1px solid var(--border)' }}>
                        <button
                          onClick={() => setExpandedCallId(isExpanded ? null : call.id)}
                          style={{
                            background: 'none', border: 'none', padding: 0,
                            fontSize: 'var(--fs-label)', color: 'var(--accent)',
                            cursor: 'pointer', fontWeight: 500,
                          }}
                        >
                          {isExpanded ? 'Hide transcript' : 'View transcript'}
                        </button>
                      </td>
                    </tr>

                    {/* Transcript accordion */}
                    {isExpanded && (
                      <tr key={`${call.id}-transcript`}>
                        <td colSpan={6} style={{ padding: 0, borderBottom: '1px solid var(--border)' }}>
                          <div style={{ padding: '16px 20px', background: 'var(--surface-1)', borderTop: '1px solid var(--border)' }}>
                            {/* Metric pills */}
                            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                              {[
                                { label: 'Task',       pass: call.metrics?.task },
                                { label: 'Quality',    pass: call.metrics?.quality },
                                { label: 'Guardrails', pass: call.metrics?.guardrails },
                              ].map(({ label, pass }) => (
                                <span key={label} style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  fontSize: 'var(--fs-label)', fontWeight: 500,
                                  background: pass ? 'var(--green-bg)' : 'var(--red-bg)',
                                  color: pass ? 'var(--green-text)' : 'var(--red-text)',
                                  padding: '3px 8px', borderRadius: 4,
                                }}>
                                  {label} {pass ? '✓' : '✗'}
                                </span>
                              ))}
                            </div>

                            {/* Summary sentence for low scores */}
                            {call.score < 80 && call.summary && (
                              <div style={{
                                background: '#FFFBEB', border: '1px solid #FDE68A',
                                borderRadius: 6, padding: '8px 12px',
                                fontSize: 'var(--fs-body)', color: '#92400E',
                                marginBottom: 14, lineHeight: 1.6,
                              }}>
                                {call.summary}
                              </div>
                            )}

                            {/* Transcript */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {call.transcript.map((line, j) => {
                                const isAgent = line.speaker === 'agent'
                                return (
                                  <div key={j}>
                                    <div style={{
                                      display: 'flex', gap: 8,
                                      background: line.flagged ? '#FFFBEB' : 'transparent',
                                      padding: line.flagged ? '6px 8px' : '0',
                                      borderRadius: line.flagged ? 4 : 0,
                                      border: line.flagged ? '1px solid #FDE68A' : 'none',
                                    }}>
                                      <span style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: isAgent ? '#0F766E' : 'var(--text-secondary)', flexShrink: 0, width: 40 }}>
                                        {isAgent ? 'Agent' : 'Caller'}
                                      </span>
                                      <span style={{ fontSize: 'var(--fs-body)', color: 'var(--text-primary)', lineHeight: 1.5 }}>{line.text}</span>
                                      {line.flagged && <span style={{ marginLeft: 'auto', fontSize: 'var(--fs-label)', color: '#92400E', flexShrink: 0 }}>⚑</span>}
                                    </div>
                                    {line.flagged && line.annotation && (
                                      <div style={{ marginTop: 4, marginLeft: 48, fontSize: 'var(--fs-label)', color: '#92400E', fontStyle: 'italic' }}>
                                        {line.annotation}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
