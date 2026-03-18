import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

/* Interactive letter component — FOREST-style hover effect */
const letters = ['P', 'R', 'A', 'E', 'S', 'I', 'D', 'I', 'O']

function InteractiveTitle() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        userSelect: 'none',
      }}
    >
      {letters.map((letter, i) => (
        <div
          key={i}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{
            position: 'relative',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            padding: '0 2px',
          }}
        >
          <span
            style={{
              fontFamily: "'Clash Display', Montserrat, sans-serif",
              fontSize: 'clamp(52px, 12vw, 120px)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: hoveredIndex === i ? '#fff' : 'transparent',
              WebkitTextStroke: hoveredIndex === i ? '2px transparent' : '2px rgba(255,255,255,0.5)',
              textShadow: hoveredIndex === i ? '0 10px 30px rgba(124, 91, 240, 0.5)' : '0 10px 25px rgba(0,0,0,0.3)',
              transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: hoveredIndex === i ? 'scale(1.15)' : 'scale(1)',
              display: 'inline-block',
            }}
          >
            {letter}
          </span>
        </div>
      ))}
    </div>
  )
}

export function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Video background — scaled up to crop Veo watermark */}
      <div
        style={{
          position: 'absolute',
          inset: '-10%',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(8,8,12,0.8) 0%, rgba(8,8,12,0.7) 40%, rgba(8,8,12,0.75) 80%, rgba(8,8,12,0.95) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(8,8,12,0.7) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div className="hero-stagger" style={{ position: 'relative', zIndex: 2 }}>
        {/* Interactive PRAESIDIO title */}
        <InteractiveTitle />

        {/* Tagline */}
        <p
          style={{
            fontSize: 22,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.85)',
            maxWidth: 520,
            margin: '32px auto 0',
            fontWeight: 400,
            letterSpacing: '0.01em',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          Runtime security for AI agents.
        </p>

        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            maxWidth: 400,
            margin: '12px auto 0',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.05em',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          Offline &middot; Zero-trust &middot; OWASP compliant
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        className="hero-stagger"
        style={{
          position: 'absolute',
          bottom: 40,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <ChevronDown
          size={18}
          style={{
            color: 'rgba(255,255,255,0.2)',
            animation: 'scrollBounce 2s ease-in-out infinite',
          }}
        />
      </div>
    </section>
  )
}
