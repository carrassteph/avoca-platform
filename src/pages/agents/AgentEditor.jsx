import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Loader2, CheckCircle2, Plus, X, Pencil, RotateCcw } from 'lucide-react'
import { useApp } from '../../context/AppContext'

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'section-brand',  label: 'Brand',         required: true },
  { id: 'section-config', label: 'Configuration', required: true },
  { id: 'section-scripts',label: 'Scripts',       required: false },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const DEFAULT_HOURS = {
  Mon: { open: '08:00', close: '18:00', closed: false },
  Tue: { open: '08:00', close: '18:00', closed: false },
  Wed: { open: '08:00', close: '18:00', closed: false },
  Thu: { open: '08:00', close: '18:00', closed: false },
  Fri: { open: '08:00', close: '18:00', closed: false },
  Sat: { open: '', close: '', closed: true },
  Sun: { open: '', close: '', closed: true },
}

const SCRIPT_FIELDS = [
  { key: 'introScript',              label: 'Intro script',                type: 'textarea'  },
  { key: 'qualificationQuestions',   label: 'Qualification questions',      type: 'questions' },
  { key: 'outOfServiceAreaResponse', label: 'Out of service area response', type: 'textarea'  },
  { key: 'afterHoursResponse',       label: 'After-hours response',         type: 'textarea'  },
  { key: 'objectionHandling',        label: 'Objection handling',           type: 'textarea'  },
  { key: 'closingScript',            label: 'Closing script',               type: 'textarea'  },
]

// ─── Styles ───────────────────────────────────────────────────────────────────

const input = (disabled) => ({
  width: '100%', padding: '7px 10px',
  border: '1px solid var(--border)', borderRadius: 6,
  fontSize: 'var(--fs-body)', color: disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
  background: disabled ? 'var(--surface-2)' : '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
})

const timeInput = (disabled) => ({
  padding: '5px 8px', width: 112,
  border: '1px solid var(--border)', borderRadius: 5,
  fontSize: 'var(--fs-body)', color: disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
  background: disabled ? 'var(--surface-2)' : '#fff',
  outline: 'none', fontFamily: 'inherit',
})

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 5 }}>
      {children}{required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
    </label>
  )
}

// Inherited field from template
function InheritedField({ label, value, templateName }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <label style={{ fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</label>
        <span style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 4 }}>
          Inherited · {templateName}
        </span>
      </div>
      <div style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)', background: 'var(--surface-2)', minHeight: 34 }}>
        {Array.isArray(value) ? value.map((v, i) => <div key={i}>{i + 1}. {v}</div>) : value}
      </div>
    </div>
  )
}

// Brand record inherited field — overridable per agent
function OverridableBrandField({ fieldKey, label, brandValue, brandFields, onChange, overrides, setOverrides, type = 'text', options }) {
  const isEditing = !!overrides[fieldKey]
  const displayValue = isEditing ? (brandFields[fieldKey] ?? brandValue) : brandValue

  function handleEdit() {
    setOverrides(prev => ({ ...prev, [fieldKey]: true }))
    onChange(fieldKey, brandValue)
  }

  function handleReset() {
    setOverrides(prev => { const next = { ...prev }; delete next[fieldKey]; return next })
    onChange(fieldKey, undefined)
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <label style={{ fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isEditing && (
            <span style={{ fontSize: 'var(--fs-label)', background: '#EFF6FF', color: '#1D4ED8', padding: '2px 7px', borderRadius: 4 }}>
              From brand record
            </span>
          )}
          <button
            onClick={isEditing ? handleReset : handleEdit}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 9px', fontSize: 'var(--fs-label)', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 500 }}
          >
            {isEditing ? <><RotateCcw size={11} /> Reset</> : <><Pencil size={11} /> Edit</>}
          </button>
        </div>
      </div>
      {isEditing ? (
        type === 'select' ? (
          <select
            value={displayValue || ''}
            onChange={e => onChange(fieldKey, e.target.value)}
            style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 'var(--fs-body)', color: 'var(--text-primary)', background: '#fff', outline: 'none', cursor: 'pointer' }}
          >
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type="text"
            value={displayValue || ''}
            onChange={e => onChange(fieldKey, e.target.value)}
            style={input(false)}
          />
        )
      ) : (
        <div style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', background: 'var(--surface-2)', minHeight: 34 }}>
          {brandValue || '—'}
        </div>
      )}
    </div>
  )
}

function BrandSearchSelect({ value, brands, onChange }) {
  const [query, setQuery] = useState(() => brands.find(b => b.id === value)?.name || '')
  const [open, setOpen] = useState(false)
  const blurTimer = useRef(null)

  const filtered = brands.filter(b => b.name.toLowerCase().includes(query.toLowerCase()))

  function handleSelect(brand) {
    setQuery(brand.name)
    onChange(brand)
    setOpen(false)
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => {
      setOpen(false)
      if (!brands.find(b => b.name === query)) setQuery(brands.find(b => b.id === value)?.name || '')
    }, 150)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(null); setOpen(true) }}
          onFocus={() => { clearTimeout(blurTimer.current); setOpen(true) }}
          onBlur={handleBlur}
          placeholder="Search brands…"
          style={{ ...input(false), paddingRight: 32 }}
        />
        <ChevronDown size={14} style={{
          position: 'absolute', right: 10, top: '50%',
          transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
          color: 'var(--text-tertiary)', pointerEvents: 'none', transition: 'transform 0.15s',
        }} />
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid var(--border)', borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 50, maxHeight: 220, overflowY: 'auto',
        }}>
          {filtered.length === 0
            ? <div style={{ padding: '10px 12px', fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)' }}>No brands match</div>
            : filtered.map(brand => (
              <button key={brand.id} onMouseDown={() => handleSelect(brand)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', border: 'none', background: 'none',
                fontSize: 'var(--fs-body)', cursor: 'pointer', fontFamily: 'inherit',
                borderBottom: '1px solid var(--border)',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{brand.name}</div>
                <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)' }}>{brand.region}</div>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)} style={{ display: 'inline-flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
      <span style={{ width: 32, height: 18, borderRadius: 9, background: value ? 'var(--accent)' : 'var(--border)', position: 'relative', display: 'inline-block', transition: 'background 0.2s' }}>
        <span style={{ position: 'absolute', top: 1, left: value ? 15 : 1, width: 16, height: 16, borderRadius: 8, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </span>
    </button>
  )
}

function HoursInput({ value, onChange }) {
  const init = (value && typeof value === 'object' && !Array.isArray(value)) ? value : DEFAULT_HOURS
  const [hours, setHours] = useState(init)

  useEffect(() => { onChange(hours) }, [])

  function updateDay(day, changes) {
    const next = { ...hours, [day]: { ...hours[day], ...changes } }
    setHours(next)
    onChange(next)
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
      {DAYS.map((day, i) => {
        const d = hours[day]
        return (
          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderBottom: i < DAYS.length - 1 ? '1px solid var(--border)' : 'none', background: d.closed ? 'var(--surface-1)' : '#fff' }}>
            <span style={{ width: 30, fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-secondary)', flexShrink: 0 }}>{day}</span>
            <Toggle value={!d.closed} onChange={open => updateDay(day, { closed: !open, open: open ? '08:00' : '', close: open ? '18:00' : '' })} />
            <span style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', width: 38, flexShrink: 0 }}>{d.closed ? 'Closed' : 'Open'}</span>
            {!d.closed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="time" value={d.open} onChange={e => updateDay(day, { open: e.target.value })} style={timeInput(false)} />
                <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-body)' }}>–</span>
                <input type="time" value={d.close} onChange={e => updateDay(day, { close: e.target.value })} style={timeInput(false)} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SectionBlock({ id, title, description, children }) {
  return (
    <section id={id} style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
      {description && <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', marginBottom: 20 }}>{description}</div>}
      {children}
    </section>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
      {hint && <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function AgentEditor({
  template, brandFields, onChange, onSaveDraft, onPublish,
  isSaving, isPublishing, onBack, isEdit, onGoToTest, testCompleted,
}) {
  const navigate = useNavigate()
  const { state } = useApp()
  const scrollRef = useRef(null)
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const [scriptOverrides, setScriptOverrides] = useState({})
  const [brandFieldOverrides, setBrandFieldOverrides] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPublishWarning, setShowPublishWarning] = useState(false)

  const tf = template?.fields || {}
  const selectedBrand = state.brands.find(b => b.id === brandFields.brandId)

  // Scroll spy
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const handler = () => {
      const offsets = SECTIONS.map(s => {
        const el = container.querySelector(`#${s.id}`)
        return el ? { id: s.id, top: el.getBoundingClientRect().top } : null
      }).filter(Boolean)
      const current = offsets.filter(o => o.top <= 120).at(-1)
      if (current) setActiveSection(current.id)
    }
    container.addEventListener('scroll', handler, { passive: true })
    return () => container.removeEventListener('scroll', handler)
  }, [])

  function scrollToSection(id) {
    const el = scrollRef.current?.querySelector(`#${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Section status ─────────────────────────────────────────────────────────
  function sectionStatus(sectionId) {
    const has = k => (brandFields[k] || '').trim() !== ''
    const hasObj = k => brandFields[k] && typeof brandFields[k] === 'object' && Object.values(brandFields[k]).some(d => !d.closed)

    if (sectionId === 'section-brand') {
      return brandFields.brandId ? 'complete' : 'empty'
    }
    if (sectionId === 'section-config') {
      return hasObj('hoursOfOperation') ? 'complete' : 'empty'
    }
    if (sectionId === 'section-scripts') return 'complete'
    return 'empty'
  }

  function allComplete() {
    return SECTIONS.filter(s => s.required).every(s => sectionStatus(s.id) === 'complete')
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  function handlePublishClick() {
    if (!testCompleted) {
      setShowPublishWarning(true)
    } else {
      handlePublishConfirm()
    }
  }

  async function handlePublishConfirm() {
    setShowPublishWarning(false)
    await onPublish()
    setShowSuccess(true)
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={28} style={{ color: 'var(--green-text)' }} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Agent live</div>
          <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>
            <strong>{brandFields.brandName}</strong> is now live and ready to take calls.
          </div>
        </div>
        <button onClick={() => navigate('/agents')} style={{ marginTop: 8, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 'var(--fs-body)', fontWeight: 500, cursor: 'pointer' }}>
          View all agents
        </button>
      </div>
    )
  }

  function dotColor(status) {
    if (status === 'complete') return 'var(--green-dot, #16A34A)'
    if (status === 'partial')  return 'var(--accent)'
    return 'var(--border)'
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left nav */}
        <div style={{ width: 160, flexShrink: 0, borderRight: '1px solid var(--border)', padding: '20px 12px', background: 'var(--surface-1)', overflowY: 'auto' }}>
          <div style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, paddingLeft: 8 }}>
            Sections
          </div>
          {SECTIONS.map(s => {
            const isActive = activeSection === s.id
            const status = sectionStatus(s.id)
            return (
              <button key={s.id} onClick={() => scrollToSection(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '6px 8px',
                background: isActive ? 'var(--surface-2)' : 'transparent',
                border: 'none', borderRadius: 5, cursor: 'pointer', textAlign: 'left',
                fontSize: 'var(--fs-body)', fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                marginBottom: 2, transition: 'all 0.1s',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: dotColor(status), opacity: isActive ? 1 : 0.7, transition: 'background 0.1s' }} />
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>

          {/* ── Brand ── */}
          <SectionBlock id="section-brand" title="Brand" description="Select the brand this agent represents. Brand details are inherited from the brand record.">
            <Field label="Brand" required>
              <BrandSearchSelect
                value={brandFields.brandId || ''}
                brands={state.brands}
                onChange={brand => {
                  setBrandFieldOverrides({})
                  if (brand) {
                    onChange('brandId', brand.id)
                    onChange('brandName', brand.name)
                    onChange('region', brand.region)
                  } else {
                    onChange('brandId', '')
                    onChange('brandName', '')
                    onChange('region', '')
                  }
                }}
              />
              <div style={{ marginTop: 5, fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)' }}>
                Don't see your brand? <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/brands/new')}>Add it in Brand Management.</span>
              </div>
            </Field>

            {selectedBrand && (
              <div style={{ marginTop: 8 }}>
                {[
                  { key: 'region',                   label: 'Region',                         type: 'text' },
                  { key: 'zipCodes',                  label: 'Service area (zip codes)',        type: 'text' },
                  { key: 'serviceTitanInstanceId',    label: 'ServiceTitan instance ID',        type: 'text' },
                  { key: 'dispatchRule',              label: 'Dispatch rule',                   type: 'select', options: ['Auto-dispatch', 'Hold for review'] },
                  { key: 'bookingConfirmationMethod', label: 'Booking confirmation method',     type: 'select', options: ['SMS', 'Email', 'Both'] },
                  { key: 'primaryEscalationContact',  label: 'Primary escalation contact',     type: 'text' },
                  { key: 'emergencyOverridePhone',    label: 'Emergency override phone',        type: 'text' },
                ].map(f => (
                  <OverridableBrandField
                    key={f.key}
                    fieldKey={f.key}
                    label={f.label}
                    brandValue={selectedBrand[f.key]}
                    brandFields={brandFields}
                    onChange={onChange}
                    overrides={brandFieldOverrides}
                    setOverrides={setBrandFieldOverrides}
                    type={f.type}
                    options={f.options}
                  />
                ))}
              </div>
            )}
          </SectionBlock>

          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 40 }} />

          {/* ── Configuration ── */}
          <SectionBlock id="section-config" title="Configuration" description="Agent-specific settings that override or extend the brand defaults.">
            <Field label="Hours of operation" required>
              <HoursInput value={brandFields.hoursOfOperation} onChange={val => onChange('hoursOfOperation', val)} />
            </Field>

            {/* Inherited escalation behaviors from template */}
            <InheritedField label="When escalation contact is unavailable" value={tf.unavailableEscalationBehavior?.value || '—'} templateName={template?.name} />
            <InheritedField label="When emergency job and no one is available" value={tf.emergencyUnavailableBehavior?.value || '—'} templateName={template?.name} />
          </SectionBlock>

          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 40 }} />

          {/* ── Scripts ── */}
          <SectionBlock id="section-scripts" title="Scripts" description="Inherit the template's scripts or customize individual fields for this brand.">
            {SCRIPT_FIELDS.map(sf => {
              const isOverriding = !!scriptOverrides[sf.key]
              const templateVal = tf[sf.key]?.value
              const currentVal = isOverriding ? (brandFields[sf.key] !== undefined ? brandFields[sf.key] : templateVal) : templateVal
              const displayVal = sf.key === 'introScript' && !isOverriding
                ? (typeof currentVal === 'string' ? currentVal.replace(/\[Brand Name\]/g, brandFields.brandName || '[Brand Name]') : currentVal)
                : currentVal

              return (
                <div key={sf.key} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <label style={{ fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)' }}>{sf.label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {!isOverriding && (
                        <span style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 4 }}>
                          Inherited · {template?.name}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (isOverriding) {
                            setScriptOverrides(prev => ({ ...prev, [sf.key]: false }))
                            onChange(sf.key, undefined)
                          } else {
                            setScriptOverrides(prev => ({ ...prev, [sf.key]: true }))
                            onChange(sf.key, sf.type === 'textarea' ? (typeof templateVal === 'string' ? templateVal : '') : (Array.isArray(templateVal) ? [...templateVal] : []))
                          }
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 9px', fontSize: 'var(--fs-label)', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 500 }}
                      >
                        {isOverriding ? <><RotateCcw size={11} /> Reset</> : <><Pencil size={11} /> Edit</>}
                      </button>
                    </div>
                  </div>

                  {sf.type === 'questions' ? (
                    isOverriding ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(brandFields[sf.key] || []).map((q, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', width: 16, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
                            <input type="text" value={q} onChange={e => { const next = [...(brandFields[sf.key] || [])]; next[i] = e.target.value; onChange(sf.key, next) }} style={{ ...input(false), flex: 1 }} />
                            <button onClick={() => onChange(sf.key, (brandFields[sf.key] || []).filter((_, j) => j !== i))} disabled={(brandFields[sf.key] || []).length <= 1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'none', border: 'none', borderRadius: 4, cursor: (brandFields[sf.key] || []).length <= 1 ? 'not-allowed' : 'pointer', color: (brandFields[sf.key] || []).length <= 1 ? 'var(--border)' : 'var(--text-tertiary)', padding: 0 }}>
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => onChange(sf.key, [...(brandFields[sf.key] || []), ''])} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: '4px 0 0', fontSize: 'var(--fs-body)', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit' }}>
                          <Plus size={13} /> Add question
                        </button>
                      </div>
                    ) : (
                      <div style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface-2)' }}>
                        {(Array.isArray(displayVal) ? displayVal : []).map((q, i) => (
                          <div key={i} style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)', marginBottom: i < displayVal.length - 1 ? 4 : 0 }}>{i + 1}. {q}</div>
                        ))}
                      </div>
                    )
                  ) : (
                    isOverriding ? (
                      <textarea value={brandFields[sf.key] || ''} onChange={e => onChange(sf.key, e.target.value)} rows={sf.key === 'objectionHandling' ? 4 : 3} style={{ ...input(false), resize: 'vertical' }} />
                    ) : (
                      <div style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface-2)', fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {displayVal}
                      </div>
                    )
                  )}
                </div>
              )
            })}
          </SectionBlock>

          <div style={{ height: 80 }} />
        </div>
      </div>

      {/* Publish warning bar */}
      {showPublishWarning && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', background: '#FEF9C3', borderTop: '1px solid #FDE68A', flexShrink: 0 }}>
          <span style={{ fontSize: 'var(--fs-body)', color: '#854D0E' }}>You haven't tested this agent yet. Are you sure you want to publish?</span>
          <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
            <button onClick={handlePublishConfirm} disabled={isPublishing} style={{ background: 'none', border: 'none', padding: 0, fontSize: 'var(--fs-body)', fontWeight: 600, color: '#DC2626', cursor: 'pointer' }}>
              {isPublishing ? 'Publishing…' : 'Publish anyway'}
            </button>
            <button onClick={() => { setShowPublishWarning(false); onGoToTest?.() }} style={{ background: 'none', border: 'none', padding: 0, fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}>
              Test first
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 55, borderTop: '1px solid var(--border)', background: '#fff', flexShrink: 0 }}>
        <div>
          {!isEdit && onBack && (
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              ← Back
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onSaveDraft} disabled={isSaving || isPublishing} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 16px', fontSize: 'var(--fs-body)', fontWeight: 500, cursor: (isSaving || isPublishing) ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', opacity: (isSaving || isPublishing) ? 0.6 : 1 }}>
            {isSaving ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</> : 'Save as draft'}
          </button>
          {onGoToTest && (
            <button onClick={onGoToTest} disabled={isSaving || isPublishing} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 16px', fontSize: 'var(--fs-body)', fontWeight: 500, cursor: (isSaving || isPublishing) ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', opacity: (isSaving || isPublishing) ? 0.6 : 1 }}>
              Test agent
            </button>
          )}
          <button onClick={handlePublishClick} disabled={!allComplete() || isPublishing || isSaving} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 'var(--fs-body)', fontWeight: 500, cursor: (!allComplete() || isPublishing || isSaving) ? 'not-allowed' : 'pointer', color: '#fff', opacity: (!allComplete() || isPublishing || isSaving) ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            {isPublishing ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Publishing…</> : 'Publish'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
