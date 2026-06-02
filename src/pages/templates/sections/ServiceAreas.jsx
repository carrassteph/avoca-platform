const inputStyle = {
  width: '100%', padding: '7px 10px',
  border: '1px solid var(--border)', borderRadius: 6,
  fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
}

export default function ServiceAreas({ fields, onChange, isSystem }) {
  const f = fields

  function update(key, changes) {
    onChange(key, { ...f[key], ...changes })
  }

  return (
    <section id="section-service-areas" style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Service areas</div>
      <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', marginBottom: 20 }}>
        Define where this agent can accept calls from.
      </div>

      {/* Service area logic */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
          Service area logic
        </label>
        <textarea
          value={f.serviceAreaLogic.value}
          onChange={e => update('serviceAreaLogic', { value: e.target.value })}
          disabled={isSystem}
          rows={2}
          style={{
            ...inputStyle,
            background: isSystem ? 'var(--surface-2)' : '#fff',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Zip codes */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
          Zip codes <span style={{ color: '#DC2626' }}>*</span>
        </label>
        <textarea
          value={f.zipCodes.value}
          onChange={e => update('zipCodes', { value: e.target.value })}
          disabled={isSystem}
          rows={3}
          placeholder="e.g. 02101, 02116, 02134"
          style={{
            ...inputStyle,
            background: isSystem ? 'var(--surface-2)' : '#fff',
            resize: 'vertical',
          }}
        />
        <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginTop: 4 }}>
          Enter comma-separated zip codes.
        </div>
      </div>
    </section>
  )
}
