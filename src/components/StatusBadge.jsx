const CONFIG = {
  live:      { label: 'Live',      bg: 'var(--green-bg)', color: 'var(--green-text)' },
  draft:     { label: 'Draft',     bg: 'var(--amber-bg)', color: 'var(--amber-text)' },
  paused:    { label: 'Paused',    bg: 'var(--gray-bg)',  color: 'var(--gray-text)'  },
  published: { label: 'Published', bg: 'var(--green-bg)', color: 'var(--green-text)' },
  archived:  { label: 'Archived',  bg: 'var(--gray-bg)',  color: 'var(--gray-text)'  },
}

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.draft
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
