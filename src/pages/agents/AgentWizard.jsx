import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import TemplateSelection from './steps/TemplateSelection'
import TestCall from './steps/TestCall'
import AgentEditor from './AgentEditor'

export default function AgentWizard() {
  const { id } = useParams()
  const { state, dispatch, showToast } = useApp()
  const navigate = useNavigate()
  const isEdit = !!id
  const existing = isEdit ? state.agents.find(a => a.id === id) : null

  const publishedTemplates = state.templates.filter(t => t.status === 'published')

  const [step, setStep] = useState(isEdit ? 2 : 1)
  const [selectedTemplateId, setSelectedTemplateId] = useState(existing?.templateId || null)
  const [brandFields, setBrandFields] = useState(existing?.fields || {})
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)

  const selectedTemplate = state.templates.find(t => t.id === selectedTemplateId)

  function handleBrandFieldChange(key, value) {
    setBrandFields(prev => ({ ...prev, [key]: value }))
  }

  function allRequiredFilled() {
    const textFields = ['brandName', 'zipCodes', 'serviceTitanInstanceId', 'emergencyOverridePhone', 'primaryEscalationContact']
    const textOk = textFields.every(k => (brandFields[k] || '').trim() !== '')
    const hours = brandFields.hoursOfOperation
    const hoursOk = hours && typeof hours === 'object' && Object.values(hours).some(d => !d.closed)
    return textOk && hoursOk
  }

  async function handleSaveDraft() {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 800))
    const payload = {
      brandName: brandFields.brandName || 'Unnamed brand',
      region: brandFields.region || '',
      status: 'draft',
      templateId: selectedTemplateId,
      templateName: selectedTemplate?.name || '',
      fields: brandFields,
    }
    if (isEdit) {
      dispatch({ type: 'UPDATE_AGENT', payload: { id, ...payload } })
    } else {
      dispatch({ type: 'CREATE_AGENT', payload })
    }
    setIsSaving(false)
    showToast(`"${payload.brandName}" saved as draft`)
    navigate('/agents')
  }

  async function handlePublish() {
    if (!allRequiredFilled()) return
    setIsPublishing(true)
    await new Promise(r => setTimeout(r, 900))
    const payload = {
      brandName: brandFields.brandName || 'Unnamed brand',
      region: brandFields.region || '',
      status: 'live',
      templateId: selectedTemplateId,
      templateName: selectedTemplate?.name || '',
      fields: brandFields,
    }
    if (isEdit) {
      dispatch({ type: 'UPDATE_AGENT', payload: { id, ...payload } })
    } else {
      dispatch({ type: 'CREATE_AGENT', payload })
    }
    setIsPublishing(false)
    showToast(`"${payload.brandName}" is now live`)
    // No navigate — AgentEditor / TestCall handles success state
  }

  const stepLabels = ['Select template', 'Brand details', 'Test · Publish']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 24px', height: 55, borderBottom: '1px solid var(--border)',
        background: '#fff', flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/agents')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-body)', padding: 0 }}
        >
          <ChevronLeft size={14} /> Agents
        </button>
        <span style={{ color: 'var(--text-tertiary)' }}>/</span>
        <span style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-primary)' }}>
          {isEdit ? (existing?.brandName || 'Edit agent') : 'New agent'}
        </span>
        {!isEdit && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {stepLabels.map((label, i) => {
              const stepNum = i + 1
              const isCurrent = step === stepNum
              const isDone = step > stepNum
              const isStep3Complete = stepNum === 3 && testCompleted

              const badgeBg = isCurrent
                ? 'var(--accent)'
                : (isDone || isStep3Complete)
                  ? 'var(--green-bg)'
                  : 'var(--surface-2)'
              const badgeColor = isCurrent
                ? '#fff'
                : (isDone || isStep3Complete)
                  ? 'var(--green-text)'
                  : 'var(--text-tertiary)'
              const badgeLabel = isCurrent
                ? stepNum
                : (isDone || isStep3Complete)
                  ? '✓'
                  : stepNum

              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {i > 0 && <span style={{ color: 'var(--border)', fontSize: 16 }}>›</span>}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 'var(--fs-label)', fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? 'var(--text-primary)' : (isDone || isStep3Complete) ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                      background: badgeBg, color: badgeColor,
                    }}>
                      {badgeLabel}
                    </span>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Step 1 */}
      {step === 1 && !isEdit && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', maxWidth: 720 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Select a template</div>
            <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', marginBottom: 24 }}>
              Choose the base configuration for this agent. You'll customize brand-specific details in the next step.
            </div>
            <TemplateSelection
              templates={publishedTemplates}
              selectedId={selectedTemplateId}
              onSelect={setSelectedTemplateId}
            />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            padding: '0 24px', height: 55, borderTop: '1px solid var(--border)',
            background: '#fff', flexShrink: 0,
          }}>
            <button
              onClick={() => setStep(2)}
              disabled={!selectedTemplateId}
              style={{
                background: selectedTemplateId ? 'var(--accent)' : 'var(--surface-2)',
                border: 'none', borderRadius: 6,
                padding: '7px 16px', fontSize: 'var(--fs-body)', fontWeight: 500,
                cursor: selectedTemplateId ? 'pointer' : 'not-allowed',
                color: selectedTemplateId ? '#fff' : 'var(--text-tertiary)',
              }}
            >
              Continue
            </button>
          </div>
        </>
      )}

      {/* Step 2 / Edit */}
      {(step === 2 || isEdit) && (
        <AgentEditor
          template={selectedTemplate}
          brandFields={brandFields}
          onChange={handleBrandFieldChange}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          isSaving={isSaving}
          isPublishing={isPublishing}
          onBack={!isEdit ? () => setStep(1) : null}
          isEdit={isEdit}
          onGoToTest={!isEdit ? () => setStep(3) : undefined}
          testCompleted={testCompleted}
        />
      )}

      {/* Step 3 */}
      {step === 3 && !isEdit && (
        <TestCall
          template={selectedTemplate}
          brandFields={brandFields}
          onPublish={handlePublish}
          isPublishing={isPublishing}
          onTestComplete={() => setTestCompleted(true)}
          onSkip={handlePublish}
        />
      )}
    </div>
  )
}
