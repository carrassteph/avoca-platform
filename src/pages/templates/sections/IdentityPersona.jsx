const Field = ({ label, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
)

const selectStyle = (disabled) => ({
  width: '100%', padding: '7px 10px',
  border: '1px solid var(--border)', borderRadius: 6,
  fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
  background: disabled ? 'var(--surface-2)' : '#fff',
  outline: 'none', cursor: disabled ? 'default' : 'pointer',
})

const SERVICE_CATEGORIES = ['HVAC', 'Plumbing', 'Electrical', 'Pest Control', 'Garage Door']

export default function IdentityPersona({ fields, onChange, isSystem }) {
  const f = fields

  function updateField(key, changes) {
    onChange(key, { ...f[key], ...changes })
  }

  return (
    <section id="section-identity" style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Identity and persona</div>
      <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', marginBottom: 20 }}>
        Define how this agent presents itself and which services it covers.
      </div>

      <Field label="Communication style">
        <select
          value={f.communicationStyle.value}
          onChange={e => updateField('communicationStyle', { value: e.target.value })}
          disabled={isSystem}
          style={selectStyle(isSystem)}
        >
          <option>Professional</option>
          <option>Friendly</option>
          <option>Conversational</option>
        </select>
      </Field>

      <Field label="Service category">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SERVICE_CATEGORIES.map(cat => {
            const selected = f.serviceCategory.value.includes(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  if (isSystem) return
                  const next = selected
                    ? f.serviceCategory.value.filter(c => c !== cat)
                    : [...f.serviceCategory.value, cat]
                  updateField('serviceCategory', { value: next })
                }}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 'var(--fs-body)', fontWeight: 500,
                  border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                  background: selected ? 'var(--accent-light)' : '#fff',
                  color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: isSystem ? 'default' : 'pointer',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </Field>
    </section>
  )
}
