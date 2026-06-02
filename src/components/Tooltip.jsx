import { useState } from 'react'

export default function Tooltip({ children, text }) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1F2937',
            color: '#fff',
            fontSize: 'var(--fs-label)',
            padding: '5px 9px',
            borderRadius: 5,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {text}
          <span
            style={{
              position: 'absolute',
              top: '100%', left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: 4,
              borderStyle: 'solid',
              borderColor: '#1F2937 transparent transparent transparent',
            }}
          />
        </span>
      )}
    </span>
  )
}
