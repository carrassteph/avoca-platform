const CONFIG = {
  system: { label: 'System', bg: 'var(--blue-bg)',  color: 'var(--blue-text)'  },
  custom: { label: 'Custom', bg: 'var(--gray-bg)',  color: 'var(--gray-text)'  },
}

export default function TypeBadge({ type }) {
  const cfg = CONFIG[type] || CONFIG.custom
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        fontSize: 'var(--fs-label)',
        padding: '2px 8px',
        borderRadius: 999,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}
