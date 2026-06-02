import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Bot, Copy, Archive, Pencil, Phone, MoreHorizontal } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { BRANDS, REGIONS } from '../../data/mockData'
import StatusBadge from '../../components/StatusBadge'
import ConfirmModal from '../../components/ConfirmModal'
import Tooltip from '../../components/Tooltip'

const TD = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 'var(--fs-table)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', ...style }}>
    {children}
  </td>
)

export default function AgentsList() {
  const { state, dispatch, showToast } = useApp()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')
  const [templateFilter, setTemplateFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const publishedTemplates = state.templates.filter(t => t.status === 'published')
  const hasPublishedTemplates = publishedTemplates.length > 0
  const isFiltered = statusFilter !== 'all' || templateFilter !== 'all' || brandFilter !== 'all' || regionFilter !== 'all'

  const filtered = state.agents.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (templateFilter !== 'all' && a.templateId !== templateFilter) return false
    if (brandFilter !== 'all' && a.brandName !== brandFilter) return false
    if (regionFilter !== 'all' && a.region !== regionFilter) return false
    return true
  })

  function handleDuplicate(a) {
    dispatch({ type: 'DUPLICATE_AGENT', payload: { id: a.id } })
    showToast(`"${a.brandName}" duplicated as draft`)
  }

  function handleArchiveConfirm() {
    dispatch({ type: 'ARCHIVE_AGENT', payload: { id: archiveTarget.id } })
    showToast(`"${archiveTarget.brandName}" archived`)
    setArchiveTarget(null)
  }

  const selectStyle = {
    padding: '5px 10px', fontSize: 'var(--fs-body)',
    border: '1px solid var(--border)', borderRadius: 6,
    background: '#fff', color: 'var(--text-primary)',
    cursor: 'pointer', outline: 'none',
  }

  const createBtn = (
    <button
      onClick={() => hasPublishedTemplates && navigate('/agents/new')}
      disabled={!hasPublishedTemplates}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: hasPublishedTemplates ? 'var(--accent)' : 'var(--surface-2)',
        color: hasPublishedTemplates ? '#fff' : 'var(--text-tertiary)',
        border: 'none', borderRadius: 6,
        padding: '7px 14px', fontSize: 'var(--fs-body)', fontWeight: 500,
        cursor: hasPublishedTemplates ? 'pointer' : 'not-allowed',
      }}
    >
      <Plus size={14} />
      Create agent
    </button>
  )

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Agents</h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>
            Deploy and manage AI voice agents across your portfolio brands.
          </p>
        </div>
        {hasPublishedTemplates
          ? createBtn
          : <Tooltip text="Publish a template first to create an agent">{createBtn}</Tooltip>
        }
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All statuses</option>
          <option value="live">Live</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
        </select>
        <select value={templateFilter} onChange={e => setTemplateFilter(e.target.value)} style={selectStyle}>
          <option value="all">All templates</option>
          {state.templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} style={selectStyle}>
          <option value="all">All brands</option>
          {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} style={selectStyle}>
          <option value="all">All regions</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table or empty */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          <Bot size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>No agents found</div>
          <div style={{ fontSize: 'var(--fs-body)', marginBottom: 20 }}>
            {isFiltered
              ? 'Try adjusting your filters.'
              : hasPublishedTemplates
                ? 'Create your first agent to get started.'
                : 'Publish a template before creating an agent.'}
          </div>
          {!isFiltered && (
            hasPublishedTemplates ? (
              <button
                onClick={() => navigate('/agents/new')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', borderRadius: 6, padding: '7px 14px',
                  fontSize: 'var(--fs-body)', fontWeight: 500, cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Create agent
              </button>
            ) : (
              <button
                onClick={() => navigate('/templates')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'none', color: 'var(--accent)',
                  border: '1px solid var(--accent)', borderRadius: 6, padding: '7px 14px',
                  fontSize: 'var(--fs-body)', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Go to templates
              </button>
            )
          )}
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-1)' }}>
                {['Brand name', 'Status', 'Template used', 'Date created', 'Actions'].map(h => (
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
              {filtered.map(a => (
                <tr
                  key={a.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <TD>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{a.brandName}</div>
                    {a.region && <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginTop: 1 }}>{a.region}</div>}
                  </TD>
                  <TD><StatusBadge status={a.status} /></TD>
                  <TD style={{ color: 'var(--text-secondary)' }}>{a.templateName}</TD>
                  <TD style={{ color: 'var(--text-secondary)' }}>
                    {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TD>
                  <TD>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={() => navigate(`/agents/${a.id}`)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: 'none', border: '1px solid var(--border)',
                          borderRadius: 5, padding: '4px 10px',
                          fontSize: 'var(--fs-label)', cursor: 'pointer',
                          color: 'var(--text-secondary)', fontWeight: 500,
                        }}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => navigate(`/agents/${a.id}/test`)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: 'none', border: '1px solid var(--border)',
                          borderRadius: 5, padding: '4px 10px',
                          fontSize: 'var(--fs-label)', cursor: 'pointer',
                          color: 'var(--text-secondary)', fontWeight: 500,
                        }}
                      >
                        <Phone size={12} /> Test
                      </button>

                      {/* Overflow menu */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === a.id ? null : a.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 28, height: 28,
                            background: 'none', border: '1px solid var(--border)',
                            borderRadius: 5, cursor: 'pointer',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <MoreHorizontal size={13} />
                        </button>
                        {openMenuId === a.id && (
                          <div
                            style={{
                              position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                              background: '#fff', border: '1px solid var(--border)',
                              borderRadius: 7, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              zIndex: 100, minWidth: 140, overflow: 'hidden',
                            }}
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <button
                              onClick={() => { handleDuplicate(a); setOpenMenuId(null) }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                width: '100%', padding: '8px 14px',
                                background: 'none', border: 'none',
                                fontSize: 'var(--fs-body)', cursor: 'pointer',
                                color: 'var(--text-secondary)', textAlign: 'left',
                                borderBottom: '1px solid var(--border)',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <Copy size={13} /> Duplicate
                            </button>
                            <button
                              onClick={() => { setArchiveTarget(a); setOpenMenuId(null) }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                width: '100%', padding: '8px 14px',
                                background: 'none', border: 'none',
                                fontSize: 'var(--fs-body)', cursor: 'pointer',
                                color: 'var(--red-text)', textAlign: 'left',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <Archive size={13} /> Archive
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {archiveTarget && (
        <ConfirmModal
          title={`Archive "${archiveTarget.brandName}"?`}
          body="This agent will be removed. This action cannot be undone. The template it was based on will not be affected."
          confirmLabel="Archive agent"
          onConfirm={handleArchiveConfirm}
          onCancel={() => setArchiveTarget(null)}
        />
      )}
    </div>
  )
}
