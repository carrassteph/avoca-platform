import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import EvaluationPanel from './steps/EvaluationPanel'

export default function AgentTest() {
  const { id } = useParams()
  const { state, dispatch, showToast } = useApp()
  const navigate = useNavigate()

  const agent = state.agents.find(a => a.id === id)
  const template = state.templates.find(t => t.id === agent?.templateId)

  const [testKey, setTestKey] = useState(0)
  const [isPublishing, setIsPublishing] = useState(false)

  const isDraft = agent?.status === 'draft'

  async function handlePublish() {
    if (!agent) return
    setIsPublishing(true)
    await new Promise(r => setTimeout(r, 900))
    dispatch({ type: 'UPDATE_AGENT', payload: { id, status: 'live' } })
    setIsPublishing(false)
    showToast(`"${agent.brandName}" is now live`)
    navigate('/agents')
  }

  const btnStyle = (primary) => ({
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    background: primary ? 'var(--accent)' : 'none',
    color: primary ? '#fff' : 'var(--text-secondary)',
    border: primary ? 'none' : '1px solid var(--border)',
    borderRadius: 6, padding: '9px 16px',
    fontSize: 'var(--fs-body)', fontWeight: 500,
    cursor: isPublishing ? 'not-allowed' : 'pointer',
    opacity: isPublishing ? 0.7 : 1,
  })

  const postTestButtons = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button onClick={() => setTestKey(k => k + 1)} style={btnStyle(false)}>
        Retest
      </button>
      <button onClick={() => navigate('/agents')} style={btnStyle(false)}>
        Back to agents
      </button>
      {isDraft && (
        <button onClick={handlePublish} disabled={isPublishing} style={btnStyle(true)}>
          {isPublishing
            ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Publishing…</>
            : 'Publish agent'
          }
        </button>
      )}
    </div>
  )

  if (!agent) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontSize: 'var(--fs-body)' }}>
        Agent not found.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 24px', height: 55,
        borderBottom: '1px solid var(--border)', background: '#fff', flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/agents')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-body)', padding: 0 }}
        >
          <ChevronLeft size={14} /> Agents
        </button>
        <span style={{ color: 'var(--text-tertiary)' }}>/</span>
        <span style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>{agent.brandName}</span>
        <span style={{ color: 'var(--text-tertiary)' }}>/</span>
        <span style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-primary)' }}>Test</span>
      </div>

      {/* TestCall */}
      <EvaluationPanel
        key={testKey}
        template={template}
        brandFields={agent.fields}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        onTestComplete={() => {}}
        onSkip={() => navigate('/agents')}
        postTestButtons={postTestButtons}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
