const OPTIONS = [
  { value: 'locked',     label: 'Locked' },
  { value: 'overridable',label: 'Overridable' },
  { value: 'required',   label: 'Required at brand' },
]

export default function LockToggle({ value, onChange, disabled = false }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        border: '1px solid var(--border)',
        borderRadius: 6,
        overflow: 'hidden',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {OPTIONS.map(opt => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => !disabled && onChange(opt.value)}
            type="button"
            style={{
              background: isActive ? '#111827' : '#fff',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRight: '1px solid var(--border)',
              padding: '3px 10px',
              fontSize: 'var(--fs-label)',
              fontWeight: isActive ? 500 : 400,
              cursor: disabled ? 'default' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.1s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
