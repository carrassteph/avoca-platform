import { useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { REGIONS } from '../../../data/mockData'

const BRAND_FIELDS = [
  { key: 'zipCodes',                 label: 'Service area (zip codes)',        type: 'textarea', placeholder: 'e.g. 02101, 02116, 02134 — comma separated' },
  { key: 'hoursOfOperation',         label: 'Hours of operation',              type: 'text',     placeholder: 'e.g. Mon–Fri 7am–7pm, Sat 8am–4pm' },
  { key: 'serviceTitanInstanceId',   label: 'ServiceTitan instance ID',        type: 'text',     placeholder: 'e.g. ST-YC-NE-001' },
  { key: 'emergencyOverridePhone',   label: 'Emergency override phone number', type: 'text',     placeholder: 'e.g. 617-555-0142' },
  { key: 'primaryEscalationContact', label: 'Primary escalation contact',      type: 'text',     placeholder: 'e.g. Mike Yost — 617-555-0190' },
]


const inputStyle = {
  width: '100%', padding: '7px 10px',
  border: '1px solid var(--border)', borderRadius: 6,
  fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}

function SearchableSelect({ value, onChange }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const blurTimer = useRef(null)

  const filtered = BRANDS.filter(b =>
    b.toLowerCase().includes(query.toLowerCase())
  )

  function handleSelect(brand) {
    setQuery(brand)
    onChange(brand)
    setOpen(false)
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => {
      setOpen(false)
      if (!BRANDS.includes(query)) {
        setQuery(value || '')
      }
    }, 150)
  }

  function handleFocus() {
    clearTimeout(blurTimer.current)
    setOpen(true)
  }

  function handleChange(e) {
    setQuery(e.target.value)
    onChange('')
    setOpen(true)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search brands…"
          style={{ ...inputStyle, paddingRight: 32 }}
        />
        <ChevronDown
          size={14}
          style={{
            position: 'absolute', right: 10, top: '50%',
            transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
            color: 'var(--text-tertiary)', pointerEvents: 'none',
            transition: 'transform 0.15s',
          }}
        />
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          zIndex: 50, maxHeight: 220, overflowY: 'auto',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)' }}>
              No brands match
            </div>
          ) : (
            filtered.map(brand => (
              <button
                key={brand}
                onMouseDown={() => handleSelect(brand)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', border: 'none', background: 'none',
                  fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {brand}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function BrandContext({ template, brandFields, onBrandFieldChange }) {
  if (!template) return null

  return (
    <div>
      <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginBottom: 20 }}>
        Template: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{template.name}</span>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
        Brand details
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Brand — searchable select */}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 5 }}>
            Brand <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <SearchableSelect
            value={brandFields.brandName || ''}
            onChange={val => onBrandFieldChange('brandName', val)}
          />
          <div style={{ marginTop: 5, fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)' }}>
            Don't see your brand? Add it in Brand Management.
          </div>
        </div>

        {/* Region — select */}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 5 }}>
            Region
          </label>
          <select
            value={brandFields.region || ''}
            onChange={e => onBrandFieldChange('region', e.target.value)}
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">Select a region…</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Required brand-specific fields */}
        {BRAND_FIELDS.map(field => {
          const value = brandFields[field.key] || ''
          return (
            <div key={field.key}>
              <label style={{
                display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500,
                color: 'var(--text-primary)', marginBottom: 5,
              }}>
                {field.label} <span style={{ color: '#DC2626' }}>*</span>
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={value}
                  onChange={e => onBrandFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={e => onBrandFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={inputStyle}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
