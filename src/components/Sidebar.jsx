import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Bot, LayoutTemplate, Activity, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const NAV = [
  { to: '/agents',     label: 'Agents',     Icon: Bot },
  { to: '/templates',  label: 'Templates',  Icon: LayoutTemplate },
  { to: '/monitoring', label: 'Monitoring', Icon: Activity },
]

export default function Sidebar() {
  const [open, setOpen] = useState(true)

  return (
    <aside
      style={{
        width: open ? 200 : 48,
        minWidth: open ? 200 : 48,
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        transition: 'width 0.2s ease, min-width 0.2s ease',
      }}
    >
      {/* Logo row */}
      <div
        style={{
          height: 55,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: open ? '0 10px 0 16px' : '0',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {open && (
          <div style={{ overflow: 'hidden', flexShrink: 1 }}>
            <img
              src="https://www.avoca.ai/avoca-logo.svg"
              alt="Avoca"
              style={{ height: 22, display: 'block' }}
              onError={e => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <span
              style={{
                display: 'none',
                fontWeight: 700,
                fontSize: 15,
                color: 'var(--text-primary)',
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap',
              }}
            >
              Avoca
            </span>
          </div>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          title={open ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
            flexShrink: 0,
            margin: open ? '0' : 'auto',
            transition: 'color 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          {open ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ padding: '8px 6px', flex: 1 }}>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={open ? undefined : label}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: open ? 'flex-start' : 'center',
              gap: 8,
              padding: open ? '6px 10px' : '7px',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 'var(--fs-body)',
              fontWeight: isActive ? 500 : 400,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--surface-2)' : 'transparent',
              marginBottom: 2,
              transition: 'background 0.1s, color 0.1s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            })}
          >
            <Icon size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            {open && label}
          </NavLink>
        ))}
      </nav>

      {/* Footer label */}
      {open && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            fontSize: 'var(--fs-label)',
            color: 'var(--text-tertiary)',
            whiteSpace: 'nowrap',
          }}
        >
          Operator Platform
        </div>
      )}
    </aside>
  )
}
