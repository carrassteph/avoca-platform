import { X, Plus } from 'lucide-react'

const inputStyle = (disabled) => ({
  width: '100%', padding: '7px 10px',
  border: '1px solid var(--border)', borderRadius: 6,
  fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
  background: disabled ? 'var(--surface-2)' : '#fff',
  outline: 'none', boxSizing: 'border-box',
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

export default function Scripts({ fields, onChange, isSystem }) {
  const f = fields

  function update(key, changes) {
    onChange(key, { ...f[key], ...changes })
  }

  return (
    <section id="section-scripts" style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Scripts</div>
      <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', marginBottom: 20 }}>
        Define what the agent says at key points in the call.
      </div>

      <Field
        label="Intro script"
        hint='Use [Brand Name] as a variable — it will be replaced when the agent is created.'
      >
        <textarea
          value={f.introScript.value}
          onChange={e => update('introScript', { value: e.target.value })}
          disabled={isSystem}
          rows={3}
          style={{ ...inputStyle(isSystem), resize: 'vertical' }}
        />
      </Field>

      <Field
        label="Qualification questions"
        hint="Default questions asked to qualify the caller. Brand operators can customize these."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {f.qualificationQuestions.value.map((q, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', width: 16, flexShrink: 0, textAlign: 'right' }}>{i + 1}.</span>
              <input
                type="text"
                value={q}
                onChange={e => {
                  const next = [...f.qualificationQuestions.value]
                  next[i] = e.target.value
                  update('qualificationQuestions', { value: next })
                }}
                disabled={isSystem}
                style={{ ...inputStyle(isSystem), flex: 1 }}
              />
              {!isSystem && (
                <button
                  onClick={() => update('qualificationQuestions', { value: f.qualificationQuestions.value.filter((_, j) => j !== i) })}
                  disabled={f.qualificationQuestions.value.length <= 1}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, flexShrink: 0,
                    background: 'none', border: 'none', borderRadius: 4,
                    cursor: f.qualificationQuestions.value.length <= 1 ? 'not-allowed' : 'pointer',
                    color: f.qualificationQuestions.value.length <= 1 ? 'var(--border)' : 'var(--text-tertiary)',
                    padding: 0,
                  }}
                  onMouseEnter={e => { if (f.qualificationQuestions.value.length > 1) e.currentTarget.style.color = 'var(--text-secondary)' }}
                  onMouseLeave={e => { if (f.qualificationQuestions.value.length > 1) e.currentTarget.style.color = 'var(--text-tertiary)' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
          {!isSystem && (
            <button
              onClick={() => update('qualificationQuestions', { value: [...f.qualificationQuestions.value, ''] })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', padding: '4px 0 0',
                fontSize: 'var(--fs-body)', color: 'var(--accent)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Plus size={13} /> Add question
            </button>
          )}
        </div>
      </Field>

      <Field label="Out of service area response">
        <textarea
          value={f.outOfServiceAreaResponse.value}
          onChange={e => update('outOfServiceAreaResponse', { value: e.target.value })}
          disabled={isSystem}
          rows={3}
          style={{ ...inputStyle(isSystem), resize: 'vertical' }}
        />
      </Field>

      <Field label="After-hours response">
        <textarea
          value={f.afterHoursResponse.value}
          onChange={e => update('afterHoursResponse', { value: e.target.value })}
          disabled={isSystem}
          rows={3}
          style={{ ...inputStyle(isSystem), resize: 'vertical' }}
        />
      </Field>

      <Field
        label="Objection handling"
        hint="Common objections and the agent's recommended responses."
      >
        <textarea
          value={f.objectionHandling.value}
          onChange={e => update('objectionHandling', { value: e.target.value })}
          disabled={isSystem}
          rows={4}
          style={{ ...inputStyle(isSystem), resize: 'vertical' }}
        />
      </Field>

      <Field label="Closing script">
        <textarea
          value={f.closingScript.value}
          onChange={e => update('closingScript', { value: e.target.value })}
          disabled={isSystem}
          rows={3}
          style={{ ...inputStyle(isSystem), resize: 'vertical' }}
        />
      </Field>
    </section>
  )
}
