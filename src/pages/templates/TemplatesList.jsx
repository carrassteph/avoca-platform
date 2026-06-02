import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LayoutTemplate, Copy, Archive, Pencil } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import TypeBadge from '../../components/TypeBadge'
import ConfirmModal from '../../components/ConfirmModal'
import Tooltip from '../../components/Tooltip'

const TD = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 'var(--fs-table)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', ...style }}>
    {children}
  </td>
)

export default function TemplatesList() {
  const { state, dispatch, showToast } = useApp()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [archiveBlockedName, setArchiveBlockedName] = useState(null)

  const filtered = state.templates.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    return true
  })

  function agentCount(templateId) {
    return state.agents.filter(a => a.templateId === templateId && (a.status === 'live' || a.status === 'draft')).length
  }

  function handleDuplicate(t) {
    dispatch({ type: 'DUPLICATE_TEMPLATE', payload: { id: t.id } })
    showToast(`"${t.name}" duplicated as a custom draft`)
  }

  function handleArchiveClick(t) {
    const active = agentCount(t.id)
    if (active > 0) {
      setArchiveBlockedName(`"${t.name}" is used by ${active} active agent${active > 1 ? 's' : ''}. Archive or delete those agents first.`)
      return
    }
    setArchiveTarget(t)
  }

  function handleArchiveConfirm() {
    dispatch({ type: 'ARCHIVE_TEMPLATE', payload: { id: archiveTarget.id } })
    showToast(`"${archiveTarget.name}" archived`)
    setArchiveTarget(null)
  }

  const selectStyle = {
    padding: '5px 10px',
    fontSize: 'var(--fs-body)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    background: '#fff',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    outline: 'none',
  }

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Templates</h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>
            Define reusable agent configurations across your portfolio.
          </p>
        </div>
        <button
          onClick={() => navigate('/templates/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 6,
            padding: '7px 14px', fontSize: 'var(--fs-body)', fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Plus size={14} />
          Create template
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
          <option value="all">All types</option>
          <option value="system">System</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Archive blocked error */}
      {archiveBlockedName && (
        <div
          style={{
            background: 'var(--red-bg)', color: 'var(--red-text)',
            border: '1px solid #FCA5A5',
            borderRadius: 6, padding: '10px 14px',
            fontSize: 'var(--fs-body)', marginBottom: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <span>{archiveBlockedName}</span>
          <button
            onClick={() => setArchiveBlockedName(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-text)', fontWeight: 600, fontSize: 16, lineHeight: 1 }}
          >×</button>
        </div>
      )}

      {/* Table or empty */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          <LayoutTemplate size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>No templates found</div>
          <div style={{ fontSize: 'var(--fs-body)', marginBottom: 20 }}>
            {statusFilter !== 'all' || typeFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first template to get started.'}
          </div>
          {statusFilter === 'all' && typeFilter === 'all' && (
            <button
              onClick={() => navigate('/templates/new')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 6, padding: '7px 14px',
                fontSize: 'var(--fs-body)', fontWeight: 500, cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Create template
            </button>
          )}
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-1)' }}>
                {['Name', 'Type', 'Status', 'Agents using it', 'Last edited', 'Actions'].map(h => (
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
              {filtered.map(t => (
                <tr
                  key={t.id}
                  style={{ cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <TD>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.name}</span>
                  </TD>
                  <TD><TypeBadge type={t.type} /></TD>
                  <TD><StatusBadge status={t.status} /></TD>
                  <TD style={{ color: 'var(--text-secondary)' }}>
                    {agentCount(t.id) > 0 ? agentCount(t.id) : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                  </TD>
                  <TD style={{ color: 'var(--text-secondary)' }}>
                    {new Date(t.lastEdited).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {t.type === 'system' ? (
                        <>
                          <Tooltip text="Unable to edit system defaults">
                            <button
                              disabled
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                background: 'none', border: '1px solid var(--border)',
                                borderRadius: 5, padding: '4px 10px',
                                fontSize: 'var(--fs-label)', cursor: 'not-allowed',
                                color: 'var(--text-tertiary)', fontWeight: 500,
                                opacity: 0.5,
                              }}
                            >
                              <Pencil size={12} /> Edit
                            </button>
                          </Tooltip>
                          <button
                            onClick={() => handleDuplicate(t)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: 'none', border: '1px solid var(--border)',
                              borderRadius: 5, padding: '4px 10px',
                              fontSize: 'var(--fs-label)', cursor: 'pointer',
                              color: 'var(--text-secondary)', fontWeight: 500,
                            }}
                          >
                            <Copy size={12} /> Duplicate
                          </button>
                          <button
                            onClick={() => handleArchiveClick(t)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: 'none', border: '1px solid var(--border)',
                              borderRadius: 5, padding: '4px 10px',
                              fontSize: 'var(--fs-label)', cursor: 'pointer',
                              color: 'var(--text-secondary)', fontWeight: 500,
                            }}
                          >
                            <Archive size={12} /> Archive
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate(`/templates/${t.id}`)}
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
                            onClick={() => handleDuplicate(t)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: 'none', border: '1px solid var(--border)',
                              borderRadius: 5, padding: '4px 10px',
                              fontSize: 'var(--fs-label)', cursor: 'pointer',
                              color: 'var(--text-secondary)', fontWeight: 500,
                            }}
                          >
                            <Copy size={12} /> Duplicate
                          </button>
                          <button
                            onClick={() => handleArchiveClick(t)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: 'none', border: '1px solid var(--border)',
                              borderRadius: 5, padding: '4px 10px',
                              fontSize: 'var(--fs-label)', cursor: 'pointer',
                              color: 'var(--text-secondary)', fontWeight: 500,
                            }}
                          >
                            <Archive size={12} /> Archive
                          </button>
                        </>
                      )}
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
          title={`Archive "${archiveTarget.name}"?`}
          body="This template will be removed from the library. Agents that were created from it will not be affected."
          confirmLabel="Archive"
          onConfirm={handleArchiveConfirm}
          onCancel={() => setArchiveTarget(null)}
        />
      )}
    </div>
  )
}
