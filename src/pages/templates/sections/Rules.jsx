const JOB_TYPES = ['HVAC Repair', 'HVAC Install', 'Plumbing Repair', 'Drain Cleaning', 'Electrical', 'Pest Control', 'Garage Door']

const inputStyle = (disabled) => ({
  width: '100%', padding: '7px 10px',
  border: '1px solid var(--border)', borderRadius: 6,
  fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
  background: disabled ? 'var(--surface-2)' : '#fff',
  outline: 'none', boxSizing: 'border-box',
})

const selectStyle = (disabled) => ({
  width: '100%', padding: '7px 10px',
  border: '1px solid var(--border)', borderRadius: 6,
  fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
  background: disabled ? 'var(--surface-2)' : '#fff',
  outline: 'none', cursor: disabled ? 'default' : 'pointer',
})

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function MultiSelect({ value, options, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(opt => {
        const selected = value.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => {
              if (disabled) return
              const next = selected ? value.filter(v => v !== opt) : [...value, opt]
              onChange(next)
            }}
            style={{
              padding: '3px 10px', borderRadius: 5, fontSize: 'var(--fs-label)', fontWeight: 500,
              border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
              background: selected ? 'var(--accent-light)' : '#fff',
              color: selected ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function SubBlock({ title, description, children }) {
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 8,
      padding: '16px 18px', marginBottom: 16,
    }}>
      <div style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: description ? 6 : 14 }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)', marginBottom: 14 }}>
          {description}
        </div>
      )}
      {children}
    </div>
  )
}

export default function Rules({ fields, onChange, isSystem }) {
  const f = fields

  function update(key, changes) {
    onChange(key, { ...f[key], ...changes })
  }

  return (
    <section id="section-rules" style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Rules</div>
      <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', marginBottom: 20 }}>
        Configure how the agent handles scheduling, service areas, escalations, and job types.
      </div>

      {/* Scheduling */}
      <SubBlock title="Scheduling rules">
        <Field label="Job types available">
          <MultiSelect
            value={f.jobTypesAvailable.value}
            options={JOB_TYPES}
            onChange={v => update('jobTypesAvailable', { value: v })}
            disabled={isSystem}
          />
        </Field>
        <Field label="Booking window">
          <select value={f.bookingWindow.value} onChange={e => update('bookingWindow', { value: e.target.value })} disabled={isSystem} style={selectStyle(isSystem)}>
            <option>Same day</option>
            <option>Next day</option>
            <option>48 hours out</option>
            <option>Custom</option>
          </select>
        </Field>
      </SubBlock>

      {/* Service Area */}
      <SubBlock title="Service area rules">
        <Field label="If caller is outside service area">
          <select value={f.callerOutsideArea.value} onChange={e => update('callerOutsideArea', { value: e.target.value })} disabled={isSystem} style={selectStyle(isSystem)}>
            <option>Decline and end call</option>
            <option>Offer callback</option>
            <option>Transfer to human</option>
          </select>
        </Field>
      </SubBlock>

      {/* Unavailable escalation handling */}
      <SubBlock
        title="Unavailable escalation handling"
        description="Configure what the agent does when it needs a human but cannot reach one."
      >
        <Field label="When escalation contact is unavailable">
          <select value={f.unavailableEscalationBehavior.value} onChange={e => update('unavailableEscalationBehavior', { value: e.target.value })} disabled={isSystem} style={selectStyle(isSystem)}>
            <option>Take a message</option>
            <option>Offer callback</option>
            <option>Leave voicemail</option>
          </select>
        </Field>
        <Field label="When an emergency job comes in and no one is available">
          <select value={f.emergencyUnavailableBehavior.value} onChange={e => update('emergencyUnavailableBehavior', { value: e.target.value })} disabled={isSystem} style={selectStyle(isSystem)}>
            <option>Take a message</option>
            <option>Offer callback</option>
            <option>Transfer to emergency line</option>
          </select>
        </Field>
      </SubBlock>

      {/* Escalation */}
      <SubBlock title="Escalation rules">
        <Field label="Escalation triggers">
          <MultiSelect
            value={f.escalationTriggers.value}
            options={['Caller requests human', 'Complaint or dispute', 'Job type requires confirmation', 'Booking failure']}
            onChange={v => update('escalationTriggers', { value: v })}
            disabled={isSystem}
          />
        </Field>
        <Field label="Fallback if no answer">
          <select value={f.fallbackIfNoAnswer.value} onChange={e => update('fallbackIfNoAnswer', { value: e.target.value })} disabled={isSystem} style={selectStyle(isSystem)}>
            <option>Leave voicemail</option>
            <option>Take a message</option>
            <option>End call</option>
          </select>
        </Field>
      </SubBlock>
    </section>
  )
}
