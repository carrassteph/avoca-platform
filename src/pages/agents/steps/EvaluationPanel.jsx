import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react'

// ─── Scenario definitions ─────────────────────────────────────────────────────

const SCENARIOS = [
  { id: 'happy-path',            label: 'Happy path' },
  { id: 'out-of-area',           label: 'Out of service area' },
  { id: 'no-slots',              label: 'No available slots' },
  { id: 'caller-hangs-up',       label: 'Caller hangs up' },
  { id: 'caller-requests-human', label: 'Caller requests human' },
  { id: 'price-objection',       label: 'Price objection' },
]

const SCENARIO_SCORES = {
  'happy-path':            { result: 'pass',    score: 100 },
  'out-of-area':           { result: 'pass',    score: 100 },
  'no-slots':              { result: 'warning', score: 65  },
  'caller-hangs-up':       { result: 'warning', score: 60  },
  'caller-requests-human': { result: 'pass',    score: 100 },
  'price-objection':       { result: 'pass',    score: 95  },
}

const SCENARIO_METRICS = {
  'happy-path':            { task: true,  quality: true,  guardrails: true  },
  'out-of-area':           { task: true,  quality: true,  guardrails: true  },
  'no-slots':              { task: false, quality: true,  guardrails: true  },
  'caller-hangs-up':       { task: false, quality: false, guardrails: true  },
  'caller-requests-human': { task: true,  quality: true,  guardrails: true  },
  'price-objection':       { task: true,  quality: true,  guardrails: true  },
}

function buildTranscripts(brandName, zipCode) {
  const bn = brandName || 'your brand'
  const zip = zipCode || '02116'

  return {
    'happy-path': [
      { speaker: 'agent',  text: `Hi, you've reached ${bn}. How can I help you today?` },
      { speaker: 'caller', text: "Hi, my AC stopped working this morning." },
      { speaker: 'agent',  text: `I'm sorry to hear that. Can I get your zip code to confirm you're in our service area?` },
      { speaker: 'caller', text: `Sure, it's ${zip}.` },
      { speaker: 'agent',  text: "Great, you're in our service area. What type of problem are you experiencing?" },
      { speaker: 'caller', text: "It's making a loud noise and not cooling at all — I think the compressor went out." },
      { speaker: 'agent',  text: "Got it. I have availability tomorrow at 9am or 11am — which works better?" },
      { speaker: 'caller', text: "9am is perfect." },
      { speaker: 'agent',  text: "I've booked an HVAC repair for tomorrow at 9:00 AM. You'll receive a confirmation shortly. Anything else I can help with?" },
      { speaker: 'caller', text: "No, that's great. Thank you so much!" },
      { speaker: 'agent',  text: "Have a great day!" },
    ],
    'out-of-area': [
      { speaker: 'agent',  text: `Hi, you've reached ${bn}. How can I help you today?` },
      { speaker: 'caller', text: "I need someone to look at my furnace." },
      { speaker: 'agent',  text: "I'd be happy to help. Could I get your zip code first?" },
      { speaker: 'caller', text: "Sure, 77001." },
      { speaker: 'agent',  text: "I'm sorry — that zip code is outside our current service area." },
      { speaker: 'caller', text: "Oh, is there anything you can do?" },
      { speaker: 'agent',  text: "Unfortunately we don't service that area at this time. I'd recommend reaching out to a local provider." },
      { speaker: 'caller', text: "Okay, thanks anyway." },
      { speaker: 'agent',  text: "Of course. I hope you find the help you need. Is there anything else?" },
      { speaker: 'caller', text: "No, that's all." },
      { speaker: 'agent',  text: "Have a great day!" },
    ],
    'no-slots': [
      { speaker: 'agent',  text: `Hi, you've reached ${bn}. How can I help you today?` },
      { speaker: 'caller', text: "I have a leaking pipe — it's pretty urgent." },
      { speaker: 'agent',  text: "I understand. Can I get your zip code?" },
      { speaker: 'caller', text: `${zip}.` },
      { speaker: 'agent',  text: "You're in our service area. How soon do you need service?" },
      { speaker: 'caller', text: "Today if at all possible." },
      { speaker: 'agent',  text: "Unfortunately we don't have any available slots today. Our next opening is tomorrow morning at 8am.", flagged: true, annotation: "Agent did not offer a callback or urgent alternative before defaulting to next-day" },
      { speaker: 'caller', text: "That's not ideal... can I get on a cancellation list?" },
      { speaker: 'agent',  text: "Absolutely. I've put you on the list and scheduled you for tomorrow at 8am. You'll hear from us if anything opens today." },
      { speaker: 'caller', text: "Okay, I appreciate it." },
      { speaker: 'agent',  text: "We'll see you tomorrow. You'll receive a confirmation shortly." },
    ],
    'caller-hangs-up': [
      { speaker: 'agent',  text: `Hi, you've reached ${bn}. How can I help you today?` },
      { speaker: 'caller', text: "Hi, I need someone to check my AC unit." },
      { speaker: 'agent',  text: "Sure! Can I get your zip code?" },
      { speaker: 'caller', text: `It's ${zip}.` },
      { speaker: 'agent',  text: "Great, you're in our service area. What type of problem are you having?" },
      { speaker: 'caller', text: "It's making a loud noise and not cooling properly." },
      { speaker: 'agent',  text: "I can schedule an HVAC repair. Are mornings or afternoons better for you?" },
      { speaker: 'caller', text: "Hold on, let me check my calendar...", flagged: true, annotation: "Call at risk — agent gave no holding acknowledgment before the pause" },
      { speaker: 'caller', text: "[Call disconnected]", flagged: true, annotation: "Call ended without resolution or follow-up scheduled" },
    ],
    'caller-requests-human': [
      { speaker: 'agent',  text: `Hi, you've reached ${bn}. How can I help you today?` },
      { speaker: 'caller', text: "I need to speak to a real person, not a bot." },
      { speaker: 'agent',  text: "Of course — I'm connecting you to one of our team members right now." },
      { speaker: 'caller', text: "Thank you." },
      { speaker: 'agent',  text: "Just to help them assist you faster — can I ask what you're calling about?" },
      { speaker: 'caller', text: "I had a technician out last week and I have a question about my bill." },
      { speaker: 'agent',  text: "Got it. I'm transferring you now. Please hold for just a moment." },
      { speaker: 'caller', text: "Okay." },
      { speaker: 'agent',  text: "You're being connected to our billing team. Have a great day!" },
    ],
    'price-objection': [
      { speaker: 'agent',  text: `Hi, you've reached ${bn}. How can I help you today?` },
      { speaker: 'caller', text: "I need AC repair, but first — how much does it cost?" },
      { speaker: 'agent',  text: "Our technician will provide a full estimate before any work begins." },
      { speaker: 'caller', text: "Can you give me a rough ballpark?" },
      { speaker: 'agent',  text: "Pricing varies depending on what the issue turns out to be. Our tech will walk you through all costs upfront — nothing gets done without your approval." },
      { speaker: 'caller', text: "Okay, that's fair. Can I schedule a visit?" },
      { speaker: 'agent',  text: "Absolutely. What's your zip code?" },
      { speaker: 'caller', text: `${zip}.` },
      { speaker: 'agent',  text: "You're in our service area. I have tomorrow at 10am or 2pm. Which works for you?" },
      { speaker: 'caller', text: "10am please." },
      { speaker: 'agent',  text: "Booked! You'll receive a confirmation shortly. Have a great day!" },
    ],
  }
}

// ─── Summary generation ───────────────────────────────────────────────────────

function generateSummary(results) {
  const passed  = results.filter(r => r.result === 'pass')
  const warned  = results.filter(r => r.result === 'warning')
  const failed  = results.filter(r => r.result === 'fail')
  const name    = r => SCENARIOS.find(s => s.id === r.id)?.label
  const list    = arr => arr.map(name).join(', ')
  const andList = arr => arr.map(name).join(' and ')

  let text = ''
  if (passed.length)  text += `The agent handled ${list(passed)} correctly. `
  if (warned.length)  text += `Warnings were found in ${andList(warned)} — the agent did not reach a clean resolution in ${warned.length === 1 ? 'this case' : 'either case'}. `
  if (failed.length)  text += `${andList(failed)} failed entirely and should be reviewed before publishing. `
  text += (warned.length || failed.length)
    ? 'Review the closing script and resolution handling before publishing.'
    : 'All scenarios passed — the agent is ready to publish.'
  return text
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResultBadge({ result }) {
  const cfg = {
    pass:    { bg: 'var(--green-bg)', color: 'var(--green-text)', label: 'Pass' },
    warning: { bg: 'var(--amber-bg)', color: 'var(--amber-text)', label: 'Warning' },
    fail:    { bg: 'var(--red-bg)',   color: 'var(--red-text)',   label: 'Fail' },
  }[result] || { bg: 'var(--surface-2)', color: 'var(--text-secondary)', label: result }
  return (
    <span style={{ fontSize: 'var(--fs-label)', fontWeight: 600, background: cfg.bg, color: cfg.color, padding: '2px 8px', borderRadius: 4 }}>
      {cfg.label}
    </span>
  )
}


function ScenarioMultiselect({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const allSelected = selected.length === SCENARIOS.length
  const label = allSelected
    ? 'All scenarios'
    : selected.length === 1
      ? SCENARIOS.find(s => s.id === selected[0])?.label
      : `${selected.length} scenarios selected`

  function toggle(id) {
    if (id === 'all') {
      // If all selected, deselect all; otherwise select all
      onChange(allSelected ? [] : SCENARIOS.map(s => s.id))
    } else {
      const next = selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]
      onChange(next)
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6,
          background: '#fff', cursor: 'pointer', fontSize: 'var(--fs-body)',
          color: 'var(--text-primary)', fontFamily: 'inherit',
        }}
      >
        <span>{label}</span>
        <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid var(--border)', borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 50, overflow: 'hidden',
        }}>
          {[{ id: 'all', label: 'All scenarios' }, ...SCENARIOS].map((s, i) => {
            const checked = s.id === 'all' ? allSelected : selected.includes(s.id)

            return (
              <label key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', cursor: 'pointer',
                borderBottom: i < SCENARIOS.length ? '1px solid var(--border)' : 'none',
                fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
                background: checked ? 'var(--surface-1)' : '#fff',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                onMouseLeave={e => e.currentTarget.style.background = checked ? 'var(--surface-1)' : '#fff'}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(s.id)}
                  style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                {s.label}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function EvaluationPanel({
  template, brandFields, onPublish, isPublishing, onTestComplete, onSkip, postTestButtons,
}) {
  const navigate = useNavigate()
  const transcriptRef = useRef(null)

  const [phase, setPhase] = useState('idle')
  const [phone, setPhone] = useState('')
  const [selectedScenarios, setSelectedScenarios] = useState(SCENARIOS.map(s => s.id))
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleLineCount, setVisibleLineCount] = useState(0)
  const [completedResults, setCompletedResults] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [showSkipWarning, setShowSkipWarning] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const brandName = brandFields?.brandName || ''
  const zipCode = (brandFields?.zipCodes || '').split(',')[0]?.trim()
  const transcripts = buildTranscripts(brandName, zipCode)

  const scenariosToRun = SCENARIOS.filter(s => selectedScenarios.includes(s.id))

  const totalScenarios = scenariosToRun.length
  const activeScenario = scenariosToRun[activeIndex]
  const activeLines = activeScenario ? transcripts[activeScenario.id] || [] : []

  // Score
  const overallScore = completedResults.length === 0
    ? 0
    : Math.round(completedResults.reduce((sum, r) => sum + r.score, 0) / completedResults.length)
  const scoreColor = overallScore >= 80 ? 'var(--green-text)' : overallScore >= 50 ? 'var(--amber-text)' : 'var(--red-text)'
  const scoreBg = overallScore >= 80 ? 'var(--green-bg)' : overallScore >= 50 ? 'var(--amber-bg)' : 'var(--red-bg)'
  const scoreLabel = overallScore >= 80 ? 'Ready to publish' : overallScore >= 50 ? 'Review before publishing' : 'Issues found'

  // Scroll transcript to bottom
  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
  }, [visibleLineCount])

  // Running logic
  useEffect(() => {
    if (phase !== 'running') return
    if (!activeScenario) return

    let cancelled = false
    setVisibleLineCount(0)
    const interval = setInterval(() => {
      setVisibleLineCount(prev => {
        const next = prev + 1
        if (next >= activeLines.length) {
          clearInterval(interval)
          setTimeout(() => {
            if (cancelled) return
            setCompletedResults(prev => {
              if (prev.length > activeIndex) return prev // guard: result already pushed for this index
              return [...prev, { ...SCENARIO_SCORES[activeScenario.id], id: activeScenario.id }]
            })
            const nextIndex = activeIndex + 1
            if (nextIndex >= totalScenarios) {
              setPhase('complete')
              onTestComplete?.()
            } else {
              setActiveIndex(nextIndex)
            }
          }, 500)
        }
        return next
      })
    }, 750)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [phase, activeIndex])

  async function handleRun() {
    setCompletedResults([])
    setActiveIndex(0)
    setVisibleLineCount(0)
    setExpandedId(null)
    setPhase('running')
  }

  async function handlePublishConfirm() {
    await onPublish()
    setShowSuccess(true)
  }

  function handleRunAgain() {
    setPhase('idle')
    setCompletedResults([])
    setActiveIndex(0)
    setVisibleLineCount(0)
    setExpandedId(null)
  }

  if (showSuccess) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={28} style={{ color: 'var(--green-text)' }} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Agent live</div>
          <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>
            <strong>{brandName || 'Your agent'}</strong> is now live and ready to take calls.
          </div>
        </div>
        <button onClick={() => navigate('/agents')} style={{ marginTop: 8, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 'var(--fs-body)', fontWeight: 500, cursor: 'pointer' }}>
          View all agents
        </button>
      </div>
    )
  }

  const summary = phase === 'complete' ? generateSummary(completedResults) : ''

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Left panel ── */}
        <div style={{ width: 280, flexShrink: 0, border: '1px solid var(--border)', borderRadius: 10, padding: 20, background: '#fff' }}>
          <div style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            Evaluation
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Evaluate your agent</div>
          <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>
            Run simulated scenarios to validate behavior before going live.
          </div>

          {/* Scenario selector */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 5 }}>Scenarios</label>
            <ScenarioMultiselect
              selected={selectedScenarios}
              onChange={setSelectedScenarios}
            />
          </div>

          {/* Phone input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 5 }}>
              Test phone number <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              disabled={phase === 'running'}
              style={{
                width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6,
                fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
                background: phase === 'running' ? 'var(--surface-2)' : '#fff',
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
            <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginTop: 4 }}>
              Leave blank for a fully simulated run
            </div>
          </div>

          {/* Running status / progress */}
          {phase === 'running' && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--surface-1)', borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--accent)' }} />
                {phone ? `Calling ${phone}…` : `Running scenario ${activeIndex + 1} of ${totalScenarios}:`}
              </div>
              {activeScenario && (
                <div style={{ fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {activeScenario.label}
                </div>
              )}
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: 'var(--accent)',
                  width: `${(completedResults.length / totalScenarios) * 100}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                {completedResults.length} of {totalScenarios} complete
              </div>
            </div>
          )}

          {/* Run button */}
          {phase !== 'running' && (
            <button
              onClick={phase === 'complete' ? handleRunAgain : handleRun}
              style={{
                width: '100%', padding: '9px', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 6, fontSize: 'var(--fs-body)', fontWeight: 500,
                cursor: 'pointer', marginBottom: 12,
              }}
            >
              {phase === 'complete' ? 'Run again' : 'Run evaluation'}
            </button>
          )}

          {/* Skip link / warning */}
          {phase !== 'running' && !showSkipWarning && (
            <button onClick={() => setShowSkipWarning(true)} style={{ background: 'none', border: 'none', padding: 0, fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', cursor: 'pointer', textDecoration: 'underline' }}>
              Skip and publish without testing
            </button>
          )}
          {showSkipWarning && (
            <div style={{ background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontSize: 'var(--fs-label)', color: '#854D0E', marginBottom: 8, lineHeight: 1.5 }}>
                You haven't evaluated this agent yet. Are you sure?
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handlePublishConfirm} disabled={isPublishing} style={{ background: 'none', border: 'none', padding: 0, fontSize: 'var(--fs-label)', fontWeight: 600, color: '#DC2626', cursor: 'pointer' }}>
                  {isPublishing ? 'Publishing…' : 'Publish anyway'}
                </button>
                <button onClick={() => setShowSkipWarning(false)} style={{ background: 'none', border: 'none', padding: 0, fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Idle empty state */}
          {phase === 'idle' && (
            <div style={{ border: '1px dashed var(--border)', borderRadius: 10, padding: '48px 24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--fs-body)', lineHeight: 1.7 }}>
              Configure your scenarios on the left and click "Run evaluation" to start.<br />
              Results and transcripts will appear here.
            </div>
          )}

          {/* Running: live transcript */}
          {phase === 'running' && activeScenario && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'var(--surface-1)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {activeScenario.label}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--fs-label)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <span style={{ color: '#166534', fontWeight: 500 }}>Running</span>
                </span>
              </div>
              <div ref={transcriptRef} style={{ padding: 16, maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeLines.slice(0, visibleLineCount).map((line, i) => {
                  const isAgent = line.speaker === 'agent'
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, flexDirection: isAgent ? 'row' : 'row-reverse', animation: 'fadeIn 0.3s ease' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: isAgent ? '#CCFBF1' : 'var(--surface-2)', color: isAgent ? '#0F766E' : 'var(--text-secondary)' }}>
                        {isAgent ? 'A' : 'C'}
                      </div>
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginBottom: 3, textAlign: isAgent ? 'left' : 'right' }}>
                          {isAgent ? 'Agent' : 'Caller'}
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: 8, fontSize: 'var(--fs-body)', lineHeight: 1.5, background: isAgent ? '#F0FDF4' : 'var(--surface-1)', color: 'var(--text-primary)', border: `1px solid ${isAgent ? '#BBF7D0' : 'var(--border)'}` }}>
                          {line.text}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {visibleLineCount < activeLines.length && (
                  <div style={{ display: 'flex', gap: 5, paddingLeft: 38 }}>
                    {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--text-tertiary)', animation: `dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Complete: results */}
          {phase === 'complete' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Section 1: Score + summary */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  {/* Score circle */}
                  <div style={{ width: 72, height: 72, borderRadius: 36, background: scoreBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: scoreColor }}>{overallScore}</span>
                  </div>
                  {/* Label + stats */}
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{scoreLabel}</div>
                    <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>
                      {completedResults.filter(r => r.result === 'pass').length} passed · {completedResults.filter(r => r.result === 'warning').length} warnings · {completedResults.filter(r => r.result === 'fail').length} failed
                    </div>
                  </div>
                </div>
                {/* Qualitative summary */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {summary}
                </div>
              </div>

              {/* Section 2: Scenario results table */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', background: 'var(--surface-1)', borderBottom: '1px solid var(--border)', fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Scenario results
                </div>
                {completedResults.map((r, i) => {
                  const scenario = SCENARIOS.find(s => s.id === r.id)
                  const isExpanded = expandedId === r.id
                  const lines = transcripts[r.id] || []
                  const m = SCENARIO_METRICS[r.id] || { task: true, quality: true, guardrails: true }

                  const MetricDot = ({ pass, title }) => (
                    <span
                      title={title}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 18, height: 18, borderRadius: 9, flexShrink: 0,
                        background: pass ? 'var(--green-bg)' : 'var(--red-bg)',
                        fontSize: 10, fontWeight: 700,
                        color: pass ? 'var(--green-text)' : 'var(--red-text)',
                      }}
                    >
                      {pass ? '✓' : '✗'}
                    </span>
                  )

                  return (
                    <div key={r.id}>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                        style={{
                          display: 'flex', alignItems: 'center', width: '100%',
                          padding: '10px 16px', background: 'none', border: 'none',
                          borderBottom: (isExpanded || i < completedResults.length - 1) ? '1px solid var(--border)' : 'none',
                          cursor: 'pointer', gap: 10, textAlign: 'left',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <ChevronRight size={14} style={{ color: 'var(--text-tertiary)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)' }}>{scenario?.label}</span>
                        <div style={{ display: 'flex', gap: 4, marginRight: 10 }}>
                          <MetricDot pass={m.task}       title="Task completion" />
                          <MetricDot pass={m.quality}    title="Conversation quality" />
                          <MetricDot pass={m.guardrails} title="Guardrails" />
                        </div>
                        <ResultBadge result={r.result} />
                      </button>
                      {isExpanded && (
                        <div style={{ padding: '12px 16px', borderBottom: i < completedResults.length - 1 ? '1px solid var(--border)' : 'none', background: 'var(--surface-1)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {lines.map((line, j) => {
                            const isAgent = line.speaker === 'agent'
                            return (
                              <div key={j}>
                                <div style={{ display: 'flex', gap: 8, background: line.flagged ? '#FFFBEB' : 'transparent', padding: line.flagged ? '6px 8px' : '0', borderRadius: line.flagged ? 4 : 0, border: line.flagged ? '1px solid #FDE68A' : 'none' }}>
                                  <span style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: isAgent ? '#0F766E' : 'var(--text-secondary)', flexShrink: 0, width: 40 }}>
                                    {isAgent ? 'Agent' : 'Caller'}
                                  </span>
                                  <span style={{ fontSize: 'var(--fs-body)', color: 'var(--text-primary)', lineHeight: 1.5 }}>{line.text}</span>
                                  {line.flagged && <span style={{ marginLeft: 'auto', fontSize: 'var(--fs-label)', color: '#92400E', flexShrink: 0 }}>⚑</span>}
                                </div>
                                {line.flagged && line.annotation && (
                                  <div style={{ marginTop: 4, marginLeft: 48, fontSize: 'var(--fs-label)', color: '#92400E', fontStyle: 'italic' }}>
                                    {line.annotation}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dot { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>

    {/* Fixed publish footer — wizard context only */}
    {phase === 'complete' && !postTestButtons && (
      <div style={{
        borderTop: '1px solid var(--border)', padding: '0 24px', height: 55,
        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        flexShrink: 0,
      }}>
        <button
          onClick={handlePublishConfirm}
          disabled={isPublishing}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6,
            padding: '7px 16px', fontSize: 'var(--fs-body)', fontWeight: 500,
            cursor: isPublishing ? 'not-allowed' : 'pointer', opacity: isPublishing ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {isPublishing
            ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Publishing…</>
            : overallScore >= 80 ? 'Publish agent' : 'Publish anyway'
          }
        </button>
      </div>
    )}
    </div>
  )
}
