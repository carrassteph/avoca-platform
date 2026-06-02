import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { REGIONS } from '../../data/mockData'

const SECTIONS = [
  { id: 'section-details', label: 'Brand details' },
  { id: 'section-service', label: 'Service area' },
  { id: 'section-crm',     label: 'CRM setup' },
]

const input = (disabled = false) => ({
  width: '100%', padding: '7px 10px',
  border: '1px solid var(--border)', borderRadius: 6,
  fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
  background: disabled ? 'var(--surface-2)' : '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
})

const selectSt = (disabled = false) => ({
  width: '100%', padding: '7px 10px',
  border: '1px solid var(--border)', borderRadius: 6,
  fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
  background: disabled ? 'var(--surface-2)' : '#fff',
  outline: 'none', cursor: disabled ? 'default' : 'pointer',
})

function Field({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginTop: 4 }}>{hint}</div>}
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

export default function BrandEditor() {
  const { id } = useParams()
  const { state, dispatch, showToast } = useApp()
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const isNew = !id
  const existing = id ? state.brands.find(b => b.id === id) : null

  const [fields, setFields] = useState({
    name: existing?.name || '',
    region: existing?.region || '',
    zipCodes: existing?.zipCodes || '',
    serviceTitanInstanceId: existing?.serviceTitanInstanceId || '',
    dispatchRule: existing?.dispatchRule || 'Auto-dispatch',
    bookingConfirmationMethod: existing?.bookingConfirmationMethod || 'SMS',
    primaryEscalationContact: existing?.primaryEscalationContact || '',
    emergencyOverridePhone: existing?.emergencyOverridePhone || '',
  })

  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)

  function set(key, value) {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  function canSave() {
    return fields.name.trim() && fields.region && fields.zipCodes.trim() && fields.serviceTitanInstanceId.trim() && fields.primaryEscalationContact.trim() && fields.emergencyOverridePhone.trim()
  }

  function handleSave() {
    const payload = { ...fields }
    if (isNew) {
      dispatch({ type: 'CREATE_BRAND', payload })
      showToast(`"${fields.name}" added`)
    } else {
      dispatch({ type: 'UPDATE_BRAND', payload: { id, ...payload } })
      showToast(`"${fields.name}" updated`)
    }
    navigate('/brands')
  }

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

  function scrollToSection(sectionId) {
    const el = scrollRef.current?.querySelector(`#${sectionId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 24px', height: 55, borderBottom: '1px solid var(--border)',
        background: '#fff', flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/brands')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-body)', padding: 0 }}
        >
          <ChevronLeft size={14} /> Brands
        </button>
        <span style={{ color: 'var(--text-tertiary)' }}>/</span>
        <span style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-primary)' }}>
          {isNew ? 'New brand' : (existing?.name || 'Edit brand')}
        </span>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left nav */}
        <div style={{
          width: 180, flexShrink: 0, borderRight: '1px solid var(--border)',
          padding: '20px 12px', background: 'var(--surface-1)', overflowY: 'auto',
        }}>
          <div style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, paddingLeft: 8 }}>
            Sections
          </div>
          {SECTIONS.map(s => {
            const isActive = activeSection === s.id
            return (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '6px 8px',
                  background: isActive ? 'var(--surface-2)' : 'transparent',
                  border: 'none', borderRadius: 5, cursor: 'pointer', textAlign: 'left',
                  fontSize: 'var(--fs-body)', fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  marginBottom: 2, transition: 'all 0.1s',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: isActive ? 'var(--accent)' : 'var(--border)', transition: 'background 0.1s' }} />
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>

          <SectionBlock id="section-details" title="Brand details" description="Basic information about this brand.">
            <Field label="Brand name" required>
              <input type="text" value={fields.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Yost and Campbell" style={input()} />
            </Field>
            <Field label="Region" required>
              <select value={fields.region} onChange={e => set('region', e.target.value)} style={selectSt()}>
                <option value="">Select a region…</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Primary escalation contact" required>
              <input type="text" value={fields.primaryEscalationContact} onChange={e => set('primaryEscalationContact', e.target.value)} placeholder="e.g. Mike Yost — 617-555-0190" style={input()} />
            </Field>
            <Field label="Emergency override phone number" required>
              <input type="text" value={fields.emergencyOverridePhone} onChange={e => set('emergencyOverridePhone', e.target.value)} placeholder="e.g. 617-555-0142" style={input()} />
            </Field>
          </SectionBlock>

          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 40 }} />

          <SectionBlock id="section-service" title="Service area" description="Zip codes this brand serves.">
            <Field label="Zip codes" required hint="Enter comma-separated zip codes.">
              <textarea
                value={fields.zipCodes}
                onChange={e => set('zipCodes', e.target.value)}
                rows={3}
                placeholder="e.g. 02101, 02116, 02134"
                style={{ ...input(), resize: 'vertical' }}
              />
            </Field>
          </SectionBlock>

          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 40 }} />

          <SectionBlock id="section-crm" title="CRM setup" description="ServiceTitan configuration for this brand.">
            <Field label="ServiceTitan instance ID" required>
              <input type="text" value={fields.serviceTitanInstanceId} onChange={e => set('serviceTitanInstanceId', e.target.value)} placeholder="e.g. ST-YC-NE-001" style={input()} />
            </Field>

            <Field label="Dispatch rule">
              <select value={fields.dispatchRule} onChange={e => set('dispatchRule', e.target.value)} style={selectSt()}>
                <option>Auto-dispatch</option>
                <option>Hold for review</option>
              </select>
            </Field>

            <Field label="Booking confirmation method">
              <select value={fields.bookingConfirmationMethod} onChange={e => set('bookingConfirmationMethod', e.target.value)} style={selectSt()}>
                <option>SMS</option>
                <option>Email</option>
                <option>Both</option>
              </select>
            </Field>
          </SectionBlock>

          <div style={{ height: 80 }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
        padding: '0 24px', height: 55, borderTop: '1px solid var(--border)',
        background: '#fff', flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/brands')}
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 6,
            padding: '7px 16px', fontSize: 'var(--fs-body)', fontWeight: 500,
            cursor: 'pointer', color: 'var(--text-primary)',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave()}
          style={{
            background: canSave() ? 'var(--accent)' : 'var(--surface-2)',
            border: 'none', borderRadius: 6,
            padding: '7px 16px', fontSize: 'var(--fs-body)', fontWeight: 500,
            cursor: canSave() ? 'pointer' : 'not-allowed',
            color: canSave() ? '#fff' : 'var(--text-tertiary)',
          }}
        >
          Save brand
        </button>
      </div>
    </div>
  )
}
