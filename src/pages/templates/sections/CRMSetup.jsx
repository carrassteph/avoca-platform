const selectStyle = (disabled) => ({
  width: '100%', padding: '7px 10px',
  border: '1px solid var(--border)', borderRadius: 6,
  fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
  background: disabled ? 'var(--surface-2)' : '#fff',
  outline: 'none', cursor: disabled ? 'default' : 'pointer',
})

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

export default function CRMSetup({ fields, onChange, isSystem }) {
  const f = fields

  function update(key, changes) {
    onChange(key, { ...f[key], ...changes })
  }

  return (
    <section id="section-crm" style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>CRM setup</div>
      <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', marginBottom: 20 }}>
        Connect the agent to ServiceTitan and configure how bookings are routed.
      </div>

      <Field label="Dispatch rule">
        <select value={f.dispatchRule.value} onChange={e => update('dispatchRule', { value: e.target.value })} disabled={isSystem} style={selectStyle(isSystem)}>
          <option>Auto-dispatch</option>
          <option>Hold for review</option>
        </select>
      </Field>

      <Field label="Booking confirmation method">
        <select
          value={f.bookingConfirmationMethod.value}
          onChange={e => update('bookingConfirmationMethod', { value: e.target.value })}
          disabled={isSystem}
          style={selectStyle(isSystem)}
        >
          <option>SMS</option>
          <option>Email</option>
          <option>Both</option>
        </select>
      </Field>
    </section>
  )
}
