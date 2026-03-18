import { useCallback, useRef } from 'react'
import { useLandingReveal } from '../hooks/useLandingReveal'
import { ArrowRight } from 'lucide-react'

/* Brand SVG icons */
const brandLogos: { name: string; svg: string }[] = [
  { name: 'Anthropic', svg: '<path d="M17.307 3.107L24 20.893h-3.18l-6.693-17.786h3.18zm-7.434 0L3.18 20.893H0l6.693-17.786h3.18zm1.024 11.794h5.206l-2.603-6.89-2.603 6.89z" fill="currentColor"/>' },
  { name: 'Cursor', svg: '<path d="M5.6 2.4L21.6 12L5.6 21.6V2.4z" fill="currentColor"/>' },
  { name: 'OpenAI', svg: '<path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.042 6.042 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" fill="currentColor"/>' },
  { name: 'Vercel', svg: '<path d="M12 1L24 22H0L12 1z" fill="currentColor"/>' },
  { name: 'Stripe', svg: '<path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" fill="currentColor"/>' },
  { name: 'GitHub', svg: '<path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="currentColor"/>' },
  { name: 'Cloudflare', svg: '<path d="M16.509 16.516l.37-1.28c.112-.39.054-.748-.164-1.01-.2-.24-.508-.383-.87-.404l-8.89-.126a.168.168 0 0 1-.144-.084.177.177 0 0 1-.013-.167c.026-.06.08-.102.143-.111l8.976-.127c.853-.04 1.778-.72 2.112-1.556l.424-1.058a.323.323 0 0 0 .018-.163 6.2 6.2 0 0 0-11.92-.852 3.47 3.47 0 0 0-5.476 3.049c0 .088.003.176.01.264A4.946 4.946 0 0 0 5.002 17.5h11.228c.09 0 .17-.053.206-.136l.073-.152z" fill="currentColor"/><path d="M19.348 13.012a.094.094 0 0 0-.093.005.094.094 0 0 0-.046.072l-.18 1.233c-.112.39-.054.748.163 1.01.2.24.509.383.871.404l1.94.127c.063.004.12.037.144.084a.177.177 0 0 1 .013.167.166.166 0 0 1-.143.111l-2.025.127c-.858.04-1.783.72-2.117 1.557l-.12.295a.09.09 0 0 0 .08.126h5.762A4.67 4.67 0 0 0 24 13.634a4.64 4.64 0 0 0-.3-1.641 3.18 3.18 0 0 0-4.352 1.019z" fill="currentColor"/>' },
  { name: 'Linear', svg: '<path d="M1.16 18.27l4.57 4.57A11.966 11.966 0 0 1 1.16 18.27zM.26 14.13l9.61 9.61a12.054 12.054 0 0 1-3.66-1.02L.26 16.78c-.41-1.16-.63-2.41-.63-3.66l.63 1.01zm-.01-5.33l15.04 15.04c-1.18.44-2.45.69-3.78.73L.02 13.08a12.08 12.08 0 0 1 .23-4.28zm1.11-3.85L17.69 21.38a12.1 12.1 0 0 1-2.95 1.82L.65 7.58a12.1 12.1 0 0 1 .71-2.63zm2.12-3.11l18.5 18.5a12.06 12.06 0 0 1-2.13 2.13L1.35 4.07A12.06 12.06 0 0 1 3.48 1.94zm3.1-1.52L23.2 17.04a12.1 12.1 0 0 1-1.82 2.95L4.05.65c.81-.3 1.7-.51 2.53-.63v.4zm4.81-1.19l12.28 12.28c-.04 1.33-.29 2.6-.73 3.78L6.9.17c1.36-.12 2.78-.03 4.09.06h.4zm5.36 1.01l5.88 5.88c.41 1.16.63 2.41.63 3.66l-8.82-8.82c.72.05 1.53-.2 2.31-.72zm3.66 3.03l1.32 1.32A11.966 11.966 0 0 1 20.41 3.27z" fill="currentColor"/>' },
]

function LogoMarquee() {
  const items = [...brandLogos, ...brandLogos, ...brandLogos]
  return (
    <div className="marquee-container" style={{ overflow: 'hidden', width: '100%', marginTop: 60 }}>
      <div
        style={{
          display: 'flex',
          gap: 56,
          animation: 'marquee 35s linear infinite',
          width: 'max-content',
          alignItems: 'center',
        }}
      >
        {items.map((brand, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              color: 'rgba(255,255,255,0.15)',
              whiteSpace: 'nowrap',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0, opacity: 0.8 }} dangerouslySetInnerHTML={{ __html: brand.svg }} />
            <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.02em' }}>{brand.name}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function Showcase() {
  const sectionRef = useLandingReveal({ y: 40 })
  const previewRef = useLandingReveal({ y: 50, delay: 0.2, scale: 0.97 })
  const tiltRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const el = tiltRef.current
    if (!el) return
    el.style.transition = 'transform 0.5s ease'
    el.style.transform = 'rotateX(4deg) rotateY(0deg)'
    setTimeout(() => { if (el) el.style.transition = 'transform 0.1s ease' }, 500)
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        padding: '100px 40px 80px',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <div ref={sectionRef} style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Headline */}
        <h2
          style={{
            fontFamily: "'Clash Display', sans-serif",
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: '-0.03em',
            color: '#f0f0f2',
            lineHeight: 1.15,
            marginBottom: 12,
          }}
        >
          Stop trusting your{' '}
          <span className="text-shimmer">AI agents</span>{' '}
          blindly.
        </h2>
        <p
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.45)',
            maxWidth: 500,
            margin: '0 auto',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          30+ MCP CVEs in 60 days &middot; 437K compromised downloads
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginTop: 36,
          }}
        >
          <a
            href="#cta"
            className="landing-cta-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 32px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #7c5bf0 0%, #4a8bf5 100%)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Get Early Access <ArrowRight size={15} />
          </a>
          <a
            href="#how-it-works"
            className="landing-cta-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 32px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            See How It Works
          </a>
        </div>

        {/* Dashboard preview with 3D mouse-tilt */}
        <div ref={previewRef} className="preview-3d" style={{ marginTop: 60 }}>
          <div
            ref={tiltRef}
            className="preview-3d-inner"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                background: '#111113',
                position: 'relative',
              }}
            >
              {/* macOS chrome */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', opacity: 0.8 }} />
                <span style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono', monospace" }}>praesidio — dashboard</span>
              </div>
              {/* Metric cards */}
              <div style={{ padding: 32, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { label: 'SERVERS', value: '7' },
                  { label: 'TOOLS PINNED', value: '21' },
                  { label: 'THREATS BLOCKED', value: '3' },
                  { label: 'OWASP SCORE', value: '9/10' },
                ].map((card) => (
                  <div key={card.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>{card.label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 500, color: '#f0f0f2' }}>{card.value}</div>
                  </div>
                ))}
              </div>
              {/* Feed + chart */}
              <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, height: 160 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>EVENT FEED</div>
                  {[
                    { color: '#ef4444', text: 'Tool poisoning detected — sketchy-math.calculate' },
                    { color: '#ef4444', text: 'Credential leak blocked — github.read_file' },
                    { color: '#f59e0b', text: 'Sensitive path access — filesystem.read_file' },
                    { color: '#22c55e', text: 'Scan completed — clean' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.text}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, height: 160 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>THREAT TREND</div>
                  <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <path d="M0,80 Q30,70 60,65 T120,50 T180,55 T240,30 T300,40" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.6" />
                    <path d="M0,90 Q30,85 60,88 T120,80 T180,85 T240,75 T300,82" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
                    <path d="M0,95 Q30,93 60,95 T120,92 T180,95 T240,88 T300,95" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LogoMarquee />
      </div>
    </section>
  )
}
