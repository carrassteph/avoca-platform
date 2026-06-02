import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import { SUMMARY_METRICS, BRAND_METRICS } from '../../data/monitoringData'

// ─── Brand multiselect ────────────────────────────────────────────────────────

function BrandMultiselect({ brands, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const allSelected = selected.includes('all')
  const label = allSelected
    ? 'All brands'
    : selected.length === 1
      ? brands.find(b => b.id === selected[0])?.name
      : `${selected.length} brands`

  function toggle(id) {
    if (id === 'all') {
      onChange(['all'])
    } else {
      const without = selected.filter(s => s !== 'all')
      const next = without.includes(id) ? without.filter(s => s !== id) : [...without, id]
      onChange(next.length === 0 ? ['all'] : next)
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6,
          background: '#fff', cursor: 'pointer', fontSize: 'var(--fs-body)',
          color: 'var(--text-primary)', fontFamily: 'inherit',
        }}
      >
        <span>{label}</span>
        <ChevronDown size={13} style={{ color: 'var(--text-tertiary)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          background: '#fff', border: '1px solid var(--border)', borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 50, minWidth: 200, overflow: 'hidden',
        }}>
          {[{ id: 'all', name: 'All brands' }, ...brands].map((b, i) => {
            const checked = b.id === 'all' ? allSelected : selected.includes(b.id)
            return (
              <label key={b.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', cursor: 'pointer',
                borderBottom: i < brands.length ? '1px solid var(--border)' : 'none',
                fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
                background: checked ? 'var(--surface-1)' : '#fff',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                onMouseLeave={e => e.currentTarget.style.background = checked ? 'var(--surface-1)' : '#fff'}
              >
                <input type="checkbox" checked={checked} onChange={() => toggle(b.id)} style={{ accentColor: 'var(--accent)', cursor: 'pointer' }} />
                {b.name}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Metric card ─────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

const TIME_WINDOWS = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
  { value: 'last90', label: 'Last 90 days' },
]

const SORT_COLS = {
  name: b => b.name,
  calls: b => b.metrics?.totalCalls ?? 0,
  booking: b => b.metrics?.bookingRate ?? 0,
  escalation: b => b.metrics?.escalationRate ?? 0,
  duration: b => b.metrics?.avgDuration ?? 0,
  lastCall: b => b.metrics?.lastCall ?? '',
}

function relativeTime(ts) {
  if (!ts) return '—'
  const diff = (Date.now() - new Date(ts).getTime()) / 1000
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Monitoring() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [selectedBrands, setSelectedBrands] = useState(['all'])
  const [timeWindow, setTimeWindow] = useState('last7')
  const [sortBy, setSortBy] = useState('calls')
  const [sortDir, setSortDir] = useState('desc')

  // Derive unique brand rows from agents with brandIds
  const activeBrandIds = [...new Set(state.agents.filter(a => a.brandId).map(a => a.brandId))]
  const activeBrands = activeBrandIds
    .map(id => {
      const brand = state.brands.find(b => b.id === id)
      const agent = state.agents.find(a => a.brandId === id)
      return brand ? { ...brand, agentStatus: agent?.status || 'draft' } : null
    })
    .filter(Boolean)

  // Compute summary cards
  const filteredIds = selectedBrands.includes('all') ? activeBrandIds : selectedBrands
  const summary = (() => {
    if (selectedBrands.includes('all')) return SUMMARY_METRICS[timeWindow]
    const ms = filteredIds.map(id => BRAND_METRICS[id]?.[timeWindow]).filter(Boolean)
    if (!ms.length) return SUMMARY_METRICS[timeWindow]
    const totalCalls = ms.reduce((s, m) => s + m.totalCalls, 0)
    const bookingRate = Math.round(ms.reduce((s, m) => s + m.bookingRate, 0) / ms.length)
    const escalationRate = Math.round(ms.reduce((s, m) => s + m.escalationRate, 0) / ms.length)
    const avgDuration = Math.round(ms.reduce((s, m) => s + m.avgDuration, 0) / ms.length * 10) / 10
    return { totalCalls, bookingRate, escalationRate, avgDuration, trends: {} }
  })()

  // Build rows with metrics
  const rows = activeBrands
    .filter(b => selectedBrands.includes('all') || selectedBrands.includes(b.id))
    .map(b => ({ ...b, metrics: BRAND_METRICS[b.id]?.[timeWindow] }))

  // Sort
  const sorted = [...rows].sort((a, b) => {
    const av = SORT_COLS[sortBy]?.(a) ?? 0
    const bv = SORT_COLS[sortBy]?.(b) ?? 0
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function handleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  function SortIcon({ col }) {
    if (sortBy !== col) return <span style={{ color: 'var(--border)', fontSize: 10 }}>↕</span>
    return <span style={{ color: 'var(--accent)', fontSize: 10 }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  const thStyle = (col) => ({
    padding: '8px 12px', textAlign: 'left',
    fontSize: 'var(--fs-label)', fontWeight: 500,
    color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none',
    background: sortBy === col ? 'var(--surface-1)' : 'var(--surface-1)',
  })

  const selectStyle = {
    padding: '5px 10px', fontSize: 'var(--fs-body)',
    border: '1px solid var(--border)', borderRadius: 6,
    background: '#fff', color: 'var(--text-primary)',
    cursor: 'pointer', outline: 'none',
  }

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Monitoring</h1>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>
          Track call performance across your active agent portfolio.
        </p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <BrandMultiselect brands={activeBrands} selected={selectedBrands} onChange={setSelectedBrands} />
        <select value={timeWindow} onChange={e => setTimeWindow(e.target.value)} style={selectStyle}>
          {TIME_WINDOWS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
        <MetricCard
          label="Total calls handled"
          value={summary.totalCalls}
          trend={summary.trends?.calls}
          trendLabel={summary.trends?.calls !== undefined ? `${summary.trends.calls > 0 ? '+' : ''}${summary.trends.calls} vs last period` : undefined}
        />
        <MetricCard
          label="Booking rate"
          value={summary.bookingRate}
          unit="%"
          trend={summary.trends?.booking}
          trendLabel={summary.trends?.booking !== undefined ? `${summary.trends.booking > 0 ? '+' : ''}${summary.trends.booking}pp vs last period` : undefined}
        />
        <MetricCard
          label="Escalation rate"
          value={summary.escalationRate}
          unit="%"
          trend={summary.trends?.escalation}
          trendLabel={summary.trends?.escalation !== undefined ? `${summary.trends.escalation > 0 ? '+' : ''}${summary.trends.escalation}pp vs last period` : undefined}
          invertColor
        />
        <MetricCard
          label="Avg call duration"
          value={summary.avgDuration}
          unit=" min"
          trend={summary.trends?.duration}
          trendLabel={summary.trends?.duration !== undefined ? `${summary.trends.duration > 0 ? '+' : ''}${summary.trends.duration}m vs last period` : undefined}
          grayTrend
        />
      </div>

      {/* Brand table */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-1)' }}>
              <th onClick={() => handleSort('name')} style={thStyle('name')}>Brand <SortIcon col="name" /></th>
              <th style={{ ...thStyle('status'), cursor: 'default' }}>Status</th>
              <th onClick={() => handleSort('calls')} style={thStyle('calls')}>Calls <SortIcon col="calls" /></th>
              <th onClick={() => handleSort('booking')} style={thStyle('booking')}>Booking rate <SortIcon col="booking" /></th>
              <th onClick={() => handleSort('escalation')} style={thStyle('escalation')}>Escalation rate <SortIcon col="escalation" /></th>
              <th onClick={() => handleSort('duration')} style={thStyle('duration')}>Avg duration <SortIcon col="duration" /></th>
              <th onClick={() => handleSort('lastCall')} style={thStyle('lastCall')}>Last call <SortIcon col="lastCall" /></th>
              <th style={{ ...thStyle('actions'), cursor: 'default' }}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(b => {
              const m = b.metrics
              const hasCalls = m?.totalCalls > 0
              return (
                <tr
                  key={b.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 500, fontSize: 'var(--fs-body)', color: 'var(--text-primary)' }}>{b.name}</div>
                    <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginTop: 1 }}>{b.region}</div>
                  </td>
                  <td style={{ padding: '12px 12px', borderBottom: '1px solid var(--border)' }}>
                    <StatusBadge status={b.agentStatus} />
                  </td>
                  <td style={{ padding: '12px 12px', borderBottom: '1px solid var(--border)', fontSize: 'var(--fs-table)', color: 'var(--text-primary)' }}>
                    {hasCalls ? m.totalCalls : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 12px', borderBottom: '1px solid var(--border)', minWidth: 140 }}>
                    {hasCalls ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', maxWidth: 80 }}>
                          <div style={{ height: '100%', width: `${m.bookingRate}%`, background: m.bookingRate >= 80 ? '#16A34A' : m.bookingRate >= 65 ? '#D97706' : '#DC2626', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 'var(--fs-table)', color: 'var(--text-primary)', fontWeight: 500 }}>{m.bookingRate}%</span>
                      </div>
                    ) : <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-table)' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 12px', borderBottom: '1px solid var(--border)', fontSize: 'var(--fs-table)', color: hasCalls ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    {hasCalls ? `${m.escalationRate}%` : '—'}
                  </td>
                  <td style={{ padding: '12px 12px', borderBottom: '1px solid var(--border)', fontSize: 'var(--fs-table)', color: hasCalls ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    {hasCalls ? `${m.avgDuration}m` : '—'}
                  </td>
                  <td style={{ padding: '12px 12px', borderBottom: '1px solid var(--border)', fontSize: 'var(--fs-table)', color: 'var(--text-secondary)' }}>
                    {relativeTime(m?.lastCall)}
                  </td>
                  <td style={{ padding: '12px 12px', borderBottom: '1px solid var(--border)' }}>
                    <button
                      onClick={() => navigate(`/monitoring/${b.id}`)}
                      style={{
                        background: 'none', border: 'none', padding: 0,
                        fontSize: 'var(--fs-label)', color: 'var(--accent)',
                        cursor: 'pointer', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}
                    >
                      View calls <ExternalLink size={11} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
