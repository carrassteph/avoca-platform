import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { REGIONS } from '../../data/mockData'

const TD = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 'var(--fs-table)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', ...style }}>
    {children}
  </td>
)

export default function BrandsList() {
  const { state, dispatch, showToast } = useApp()
  const navigate = useNavigate()
  const [regionFilter, setRegionFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = state.brands.filter(b => {
    if (regionFilter !== 'all' && b.region !== regionFilter) return false
    return true
  })

  function agentCount(brandId) {
    return state.agents.filter(a => a.brandId === brandId).length
  }

  function handleDeleteConfirm() {
    dispatch({ type: 'DELETE_BRAND', payload: { id: deleteTarget.id } })
    showToast(`"${deleteTarget.name}" deleted`)
    setDeleteTarget(null)
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Brand management</h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>
            Configure brand details used across agent deployments.
          </p>
        </div>
        <button
          onClick={() => navigate('/brands/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 6,
            padding: '7px 14px', fontSize: 'var(--fs-body)', fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Plus size={14} /> Add brand
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} style={selectStyle}>
          <option value="all">All regions</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table or empty */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          <Building2 size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>No brands found</div>
          <div style={{ fontSize: 'var(--fs-body)', marginBottom: 20 }}>
            {regionFilter !== 'all' ? 'Try adjusting your filters.' : 'Add your first brand to get started.'}
          </div>
          {regionFilter === 'all' && (
            <button
              onClick={() => navigate('/brands/new')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 6, padding: '7px 14px',
                fontSize: 'var(--fs-body)', fontWeight: 500, cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Add brand
            </button>
          )}
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-1)' }}>
                {['Brand name', 'Region', 'Agents using it', 'ST instance ID', 'Date added', 'Actions'].map(h => (
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
              {filtered.map(b => {
                const count = agentCount(b.id)
                const isDeleting = deleteTarget?.id === b.id
                return (
                  <tr
                    key={b.id}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <TD><span style={{ fontWeight: 500 }}>{b.name}</span></TD>
                    <TD style={{ color: 'var(--text-secondary)' }}>{b.region}</TD>
                    <TD style={{ color: 'var(--text-secondary)' }}>
                      {count > 0 ? count : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                    </TD>
                    <TD style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 11 }}>{b.serviceTitanInstanceId}</TD>
                    <TD style={{ color: 'var(--text-secondary)' }}>
                      {new Date(b.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TD>
                    <TD>
                      {isDeleting ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 'var(--fs-label)', color: 'var(--text-secondary)' }}>
                            Delete {b.name}? This will not affect existing agents.
                          </span>
                          <button
                            onClick={handleDeleteConfirm}
                            style={{ background: 'none', border: 'none', padding: 0, fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--red-text)', cursor: 'pointer' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteTarget(null)}
                            style={{ background: 'none', border: 'none', padding: 0, fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => navigate(`/brands/${b.id}`)}
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
                            onClick={() => setDeleteTarget(b)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: 'none', border: '1px solid var(--border)',
                              borderRadius: 5, padding: '4px 10px',
                              fontSize: 'var(--fs-label)', cursor: 'pointer',
                              color: 'var(--text-secondary)', fontWeight: 500,
                            }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </TD>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
