import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { state, dispatch } = useApp()
  const { toast } = state

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000)
    return () => clearTimeout(t)
  }, [toast, dispatch])

  if (!toast) return null

  const isSuccess = toast.variant === 'success'

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxWidth: 360,
        animation: 'slideIn 0.15s ease',
      }}
    >
      {isSuccess
        ? <CheckCircle size={16} style={{ color: 'var(--green-text)', flexShrink: 0 }} />
        : <XCircle size={16} style={{ color: 'var(--red-text)', flexShrink: 0 }} />
      }
      <span style={{ fontSize: 'var(--fs-body)', color: 'var(--text-primary)', flex: 1 }}>
        {toast.message}
      </span>
      <button
        onClick={() => dispatch({ type: 'HIDE_TOAST' })}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-tertiary)' }}
      >
        <X size={14} />
      </button>
    </div>
  )
}
