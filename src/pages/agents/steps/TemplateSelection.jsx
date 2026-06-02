import { CheckCircle2 } from 'lucide-react'

export default function TemplateSelection({ templates, selectedId, onSelect }) {
  if (templates.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
        <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>No published templates</div>
        <div style={{ fontSize: 'var(--fs-body)' }}>Publish a template first to create an agent.</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
      {templates.map(t => {
        const isSelected = selectedId === t.id
        const categories = t.fields.serviceCategory?.value || []

        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              textAlign: 'left',
              background: '#fff',
              border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 10,
              padding: 18,
              cursor: 'pointer',
              position: 'relative',
              outline: 'none',
              boxShadow: isSelected ? '0 0 0 3px var(--accent-light)' : 'none',
              transition: 'all 0.1s',
            }}
          >
            {isSelected && (
              <span style={{ position: 'absolute', top: 12, right: 12 }}>
                <CheckCircle2 size={18} style={{ color: 'var(--accent)' }} />
              </span>
            )}
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 6, paddingRight: isSelected ? 24 : 0 }}>
              {t.name}
            </div>
            {categories.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {categories.map(c => (
                  <span key={c} style={{
                    fontSize: 'var(--fs-label)', background: 'var(--surface-2)',
                    color: 'var(--text-secondary)', padding: '2px 7px', borderRadius: 4,
                  }}>{c}</span>
                ))}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
