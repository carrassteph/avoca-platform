import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Loader2, Info } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { defaultTemplateFields } from '../../data/mockData'
import IdentityPersona from './sections/IdentityPersona'
import Rules from './sections/Rules'
import ServiceAreas from './sections/ServiceAreas'
import Scripts from './sections/Scripts'
import CRMSetup from './sections/CRMSetup'

const SECTIONS = [
  { id: 'section-identity',     label: 'Identity and persona' },
  { id: 'section-rules',        label: 'Rules' },
  { id: 'section-service-areas',label: 'Service areas' },
  { id: 'section-scripts',      label: 'Scripts' },
  { id: 'section-crm',          label: 'CRM setup' },
]

export default function TemplateEditor() {
  const { id } = useParams()
  const { state, dispatch, showToast } = useApp()
  const navigate = useNavigate()
  const isNew = !id
  const scrollRef = useRef(null)

  const existing = id ? state.templates.find(t => t.id === id) : null
  const isSystem = existing?.type === 'system'

  const [name, setName] = useState(existing?.name || '')
  const [fields, setFields] = useState(existing ? { ...existing.fields } : { ...defaultTemplateFields })
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const [isPublishing, setIsPublishing] = useState(false)

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

  function handleFieldChange(key, newField) {
    setFields(prev => ({ ...prev, [key]: newField }))
  }

  function scrollToSection(sectionId) {
    const container = scrollRef.current
    const el = container?.querySelector(`#${sectionId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function canPublish() {
    return true
  }

  async function handleSaveDraft() {
    const payload = { name: name || 'Untitled template', fields, status: 'draft' }
    if (isNew) {
      dispatch({ type: 'CREATE_TEMPLATE', payload })
    } else {
      dispatch({ type: 'UPDATE_TEMPLATE', payload: { id, ...payload } })
    }
    showToast('Template saved as draft')
    navigate('/templates')
  }

  async function handlePublish() {
    if (!canPublish()) return
    setIsPublishing(true)
    await new Promise(r => setTimeout(r, 900))
    const payload = { name: name || 'Untitled template', fields, status: 'published' }
    if (isNew) {
      dispatch({ type: 'CREATE_TEMPLATE', payload: { ...payload, status: 'published' } })
    } else {
      dispatch({ type: 'PUBLISH_TEMPLATE', payload: { id, ...payload } })
    }
    setIsPublishing(false)
    showToast(`"${payload.name}" published`)
    navigate('/templates')
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
          onClick={() => navigate('/templates')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-body)', padding: 0 }}
        >
          <ChevronLeft size={14} /> Templates
        </button>
        <span style={{ color: 'var(--text-tertiary)' }}>/</span>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={isSystem}
          placeholder="Template name"
          style={{
            border: 'none', outline: 'none', fontSize: 14, fontWeight: 600,
            color: 'var(--text-primary)', background: 'transparent', flex: 1,
          }}
        />
        {existing && (
          <span style={{
            fontSize: 'var(--fs-label)', color: 'var(--text-secondary)',
            background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4,
          }}>
            {existing.status === 'published' ? 'Published' : 'Draft'}
          </span>
        )}
      </div>

      {/* System banner */}
      {isSystem && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 24px',
          background: 'var(--blue-bg)',
          borderBottom: '1px solid #BFDBFE',
          fontSize: 'var(--fs-body)', color: 'var(--blue-text)',
        }}>
          <Info size={14} />
          System template — fields are read-only. Duplicate this template to create a customizable version.
        </div>
      )}

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left nav */}
        <div style={{
          width: 180, flexShrink: 0,
          borderRight: '1px solid var(--border)',
          padding: '20px 12px',
          background: 'var(--surface-1)',
          overflowY: 'auto',
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
                  border: 'none', borderRadius: 5,
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: 'var(--fs-body)',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  marginBottom: 2,
                  transition: 'all 0.1s',
                }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: isActive ? 'var(--accent)' : 'var(--border)',
                  transition: 'background 0.1s',
                }} />
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Right form */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <IdentityPersona fields={fields} onChange={handleFieldChange} isSystem={isSystem} />
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 40 }} />
          <Rules fields={fields} onChange={handleFieldChange} isSystem={isSystem} />
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 40 }} />
          <ServiceAreas fields={fields} onChange={handleFieldChange} isSystem={isSystem} />
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 40 }} />
          <Scripts fields={fields} onChange={handleFieldChange} isSystem={isSystem} />
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 40 }} />
          <CRMSetup fields={fields} onChange={handleFieldChange} isSystem={isSystem} />
          <div style={{ height: 80 }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
        padding: '14px 24px',
        borderTop: '1px solid var(--border)',
        background: '#fff', flexShrink: 0,
      }}>
        {!isSystem && (
          <>
            <button
              onClick={handleSaveDraft}
              style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                padding: '7px 16px', fontSize: 'var(--fs-body)', fontWeight: 500,
                cursor: 'pointer', color: 'var(--text-primary)',
              }}
            >
              Save as draft
            </button>
            <button
              onClick={handlePublish}
              disabled={!canPublish() || isPublishing}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--accent)', border: 'none', borderRadius: 6,
                padding: '7px 16px', fontSize: 'var(--fs-body)', fontWeight: 500,
                cursor: (!canPublish() || isPublishing) ? 'not-allowed' : 'pointer',
                color: '#fff', opacity: (!canPublish() || isPublishing) ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {isPublishing ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Publishing…</> : 'Publish'}
            </button>
          </>
        )}
        {isSystem && (
          <button
            onClick={() => {
              dispatch({ type: 'DUPLICATE_TEMPLATE', payload: { id } })
              showToast(`"${existing.name}" duplicated as a custom draft`)
              navigate('/templates')
            }}
            style={{
              background: 'var(--accent)', border: 'none', borderRadius: 6,
              padding: '7px 16px', fontSize: 'var(--fs-body)', fontWeight: 500,
              cursor: 'pointer', color: '#fff',
            }}
          >
            Duplicate to customize
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
