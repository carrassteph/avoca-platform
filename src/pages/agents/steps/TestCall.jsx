import { useState, useEffect, useRef } from 'react'
import { Phone, Loader2, CheckCircle2 } from 'lucide-react'

const TRANSCRIPT_LINES = [
  { speaker: 'agent',  text: "Hi, you've reached [Brand Name]. How can I help you today?" },
  { speaker: 'caller', text: "Hi, my air conditioner stopped working this morning." },
  { speaker: 'agent',  text: "I'm sorry to hear that. Can I get your zip code to check if you're in our service area?" },
  { speaker: 'caller', text: "Sure, it's 02116." },
  { speaker: 'agent',  text: "Great, you're in our service area. What's a good time for you?" },
  { speaker: 'caller', text: "Tomorrow morning if possible." },
  { speaker: 'agent',  text: "I have 9am or 11am available tomorrow — which works better?" },
  { speaker: 'caller', text: "9am works perfectly." },
  { speaker: 'agent',  text: "I've booked an HVAC repair for tomorrow at 9:00 AM. You'll receive a confirmation shortly. Anything else I can help with?" },
  { speaker: 'caller', text: "No, that's all. Thank you!" },
  { speaker: 'agent',  text: "Have a great day!" },
]

const RESULT_CARDS = [
  { label: 'Job type identified', value: 'HVAC Repair' },
  { label: 'Booking created',     value: 'Tomorrow at 9:00 AM' },
  { label: 'Service area verified', value: '02116 — in area' },
  { label: 'Call score',          value: '96 / 100' },
]

// States: idle → dialing → in-call → completed
export default function TestCall({
  template, brandFields, onPublish, isPublishing, onTestComplete, onSkip, postTestButtons,
}) {
  const [phone, setPhone] = useState('')
  const [callState, setCallState] = useState('idle') // idle | dialing | in-call | completed
  const [visibleLines, setVisibleLines] = useState(0)
  const [showSkipWarning, setShowSkipWarning] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const transcriptRef = useRef(null)

  const brandName = brandFields?.brandName || template?.name || 'your brand'

  function resolveText(text) {
    return text.replace(/\[Brand Name\]/g, brandName)
  }

  function handleStartCall() {
    if (!phone.trim()) return
    setCallState('dialing')
    setVisibleLines(0)
    setTimeout(() => setCallState('in-call'), 1200)
  }

  useEffect(() => {
    if (callState !== 'in-call') return
    const interval = setInterval(() => {
      setVisibleLines(prev => {
        const next = prev + 1
        if (next >= TRANSCRIPT_LINES.length) {
          clearInterval(interval)
          setTimeout(() => {
            setCallState('completed')
            onTestComplete?.()
          }, 600)
        }
        return next
      })
    }, 950)
    return () => clearInterval(interval)
  }, [callState])

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [visibleLines])

  async function handlePublishAfterTest() {
    await onPublish()
    setShowSuccess(true)
  }

  async function handlePublishAnyway() {
    await onSkip()
    setShowSuccess(true)
  }

  function handleRunAnother() {
    setCallState('idle')
    setVisibleLines(0)
    setShowSkipWarning(false)
  }

  if (showSuccess) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: 40, textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 28,
          background: 'var(--green-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle2 size={28} style={{ color: 'var(--green-text)' }} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Agent live</div>
          <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>
            <strong>{brandName}</strong> is now live and ready to take calls.
          </div>
        </div>
      </div>
    )
  }

  const isActive = callState === 'in-call' || callState === 'dialing'
  const isDone = callState === 'completed'

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Test your agent</div>
        <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>
          Make a test call to hear how the agent responds before going live.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Left: call control ───────────────────────────── */}
        <div style={{
          width: 300, flexShrink: 0,
          border: '1px solid var(--border)', borderRadius: 10,
          padding: 20, background: '#fff',
        }}>
          <div style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            Call setup
          </div>

          {/* Phone input */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 5 }}>
              Test phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              disabled={isActive || isDone}
              style={{
                width: '100%', padding: '7px 10px',
                border: '1px solid var(--border)', borderRadius: 6,
                fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
                background: (isActive || isDone) ? 'var(--surface-2)' : '#fff',
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Call button */}
          {!isDone && (
            <button
              onClick={handleStartCall}
              disabled={!phone.trim() || isActive}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: isActive ? 'var(--surface-2)' : (!phone.trim() ? 'var(--surface-2)' : 'var(--accent)'),
                color: isActive ? 'var(--text-tertiary)' : (!phone.trim() ? 'var(--text-tertiary)' : '#fff'),
                border: 'none', borderRadius: 6, padding: '9px 16px',
                fontSize: 'var(--fs-body)', fontWeight: 500,
                cursor: (!phone.trim() || isActive) ? 'not-allowed' : 'pointer',
                marginBottom: 12,
              }}
            >
              {callState === 'dialing'
                ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Calling…</>
                : callState === 'in-call'
                  ? <><Phone size={14} /> In call…</>
                  : <><Phone size={14} /> Start test call</>
              }
            </button>
          )}

          {/* Completed state buttons */}
          {isDone && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginBottom: 4 }}>
                Call ended · 1m 24s
              </div>
              {postTestButtons || (
                <>
                  <button
                    onClick={handlePublishAfterTest}
                    disabled={isPublishing}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      background: 'var(--accent)', color: '#fff',
                      border: 'none', borderRadius: 6, padding: '9px 16px',
                      fontSize: 'var(--fs-body)', fontWeight: 500,
                      cursor: isPublishing ? 'not-allowed' : 'pointer',
                      opacity: isPublishing ? 0.7 : 1,
                    }}
                  >
                    {isPublishing
                      ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Publishing…</>
                      : 'Publish agent'
                    }
                  </button>
                  <button
                    onClick={handleRunAnother}
                    style={{
                      width: '100%', background: 'none', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '8px 16px',
                      fontSize: 'var(--fs-body)', fontWeight: 500,
                      cursor: 'pointer', color: 'var(--text-secondary)',
                    }}
                  >
                    Run another test
                  </button>
                </>
              )}
            </div>
          )}

          {/* Skip link / warning */}
          {!isDone && !showSkipWarning && (
            <button
              onClick={() => setShowSkipWarning(true)}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)',
                cursor: 'pointer', textDecoration: 'underline',
              }}
            >
              Skip and publish without testing
            </button>
          )}

          {showSkipWarning && !isDone && (
            <div style={{
              background: '#FEF9C3', border: '1px solid #FDE68A',
              borderRadius: 6, padding: '10px 12px', marginTop: 4,
            }}>
              <div style={{ fontSize: 'var(--fs-label)', color: '#854D0E', marginBottom: 8, lineHeight: 1.5 }}>
                You haven't tested this agent yet. Are you sure you want to publish?
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handlePublishAnyway}
                  disabled={isPublishing}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    fontSize: 'var(--fs-label)', fontWeight: 600,
                    color: '#DC2626', cursor: 'pointer',
                  }}
                >
                  {isPublishing ? 'Publishing…' : 'Publish anyway'}
                </button>
                <button
                  onClick={() => setShowSkipWarning(false)}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    fontSize: 'var(--fs-label)', fontWeight: 600,
                    color: 'var(--accent)', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: transcript + results ──────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {callState === 'idle' && (
            <div style={{
              border: '1px dashed var(--border)', borderRadius: 10,
              padding: '40px 24px', textAlign: 'center', color: 'var(--text-tertiary)',
              fontSize: 'var(--fs-body)',
            }}>
              Enter a phone number and start a test call to see the transcript here.
            </div>
          )}

          {(isActive || isDone) && (
            <div style={{
              border: '1px solid var(--border)', borderRadius: 10, background: '#fff', overflow: 'hidden',
            }}>
              {/* Transcript header */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface-1)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Transcript
                </span>
                {callState === 'dialing' && (
                  <span style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> Connecting…
                  </span>
                )}
                {callState === 'in-call' && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--fs-label)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <span style={{ color: '#166534', fontWeight: 500 }}>Live</span>
                  </span>
                )}
                {isDone && (
                  <span style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)' }}>Completed · 1m 24s</span>
                )}
              </div>

              {/* Transcript lines */}
              <div
                ref={transcriptRef}
                style={{ padding: '16px', maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {TRANSCRIPT_LINES.slice(0, visibleLines).map((line, i) => {
                  const isAgent = line.speaker === 'agent'
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex', gap: 10,
                        flexDirection: isAgent ? 'row' : 'row-reverse',
                        animation: 'fadeIn 0.3s ease',
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                        background: isAgent ? '#CCFBF1' : 'var(--surface-2)',
                        color: isAgent ? '#0F766E' : 'var(--text-secondary)',
                      }}>
                        {isAgent ? 'A' : 'C'}
                      </div>
                      {/* Bubble */}
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{
                          fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)',
                          marginBottom: 3,
                          textAlign: isAgent ? 'left' : 'right',
                        }}>
                          {isAgent ? 'Agent' : 'Caller'}
                        </div>
                        <div style={{
                          padding: '8px 12px', borderRadius: 8,
                          fontSize: 'var(--fs-body)', lineHeight: 1.5,
                          background: isAgent ? '#F0FDF4' : 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: `1px solid ${isAgent ? '#BBF7D0' : 'var(--border)'}`,
                        }}>
                          {resolveText(line.text)}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {callState === 'in-call' && visibleLines < TRANSCRIPT_LINES.length && (
                  <div style={{ display: 'flex', gap: 6, paddingLeft: 38 }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: 6, height: 6, borderRadius: 3,
                        background: 'var(--text-tertiary)',
                        animation: `dot 1.2s ${i * 0.2}s ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result cards */}
          {isDone && (
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {RESULT_CARDS.map(card => (
                <div key={card.label} style={{
                  border: '1px solid var(--border)', borderRadius: 8,
                  padding: '14px 16px', background: '#fff',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                  <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginBottom: 3 }}>
                      {card.label}
                    </div>
                    <div style={{ fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {card.value}
                    </div>
                  </div>
                </div>
              ))}
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
  )
}
