import { Activity } from 'lucide-react'

export default function Monitoring() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', padding: 40, textAlign: 'center',
      minHeight: 400,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'var(--surface-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <Activity size={22} style={{ color: 'var(--text-tertiary)' }} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        Monitoring
      </div>
      <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', maxWidth: 340, lineHeight: 1.7 }}>
        Monitoring is available in Phase 2. Deploy your templates and agents first.
      </div>
    </div>
  )
}
