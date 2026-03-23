import { Suspense, useCallback } from 'react'
import Spline from '@splinetool/react-spline'
import type { Application } from '@splinetool/runtime'

// Keywords for 3D objects we want to KEEP (cubes, particles, lights, camera)
const KEEP_KEYWORDS = ['cube', 'block', 'box', 'particle', 'light', 'camera', 'scene', 'environment', 'ambient', 'directional', 'point', 'spot', 'fog', 'grid', 'dot', 'star']

function hideUIObjects(app: Application) {
  const allObjects = app.getAllObjects()
  // Log all objects so we can debug if needed
  console.log('[Spline objects]', allObjects.map(o => ({ name: o.name, type: (o as any).type })))

  for (const obj of allObjects) {
    const name = (obj.name || '').toLowerCase()
    const type = ((obj as any).type || '').toLowerCase()

    // Keep 3D geometry, lights, cameras, and particles
    const isKeepable = KEEP_KEYWORDS.some(kw => name.includes(kw) || type.includes(kw))
    if (isKeepable) continue

    // Hide all 2D/UI elements: text, shapes, rectangles, buttons, icons, etc.
    const is2DType = ['text', 'rectangle', 'ellipse', 'shape', 'button', 'image', 'icon', 'svg', 'vector', 'frame', 'group'].some(t => type.includes(t))
    const isUIName = ['text', 'button', 'nav', 'menu', 'link', 'label', 'heading', 'title', 'paragraph', 'rectangle', 'shape', 'frame', 'container', 'card', 'icon', 'logo', 'pill', 'badge', 'cta', 'header', 'footer', 'circle', 'ellipse', 'border', 'outline', 'bg', 'background', 'contact', 'get', 'talk', 'home', 'cases', 'library', 'resources', 'plus', 'arrow'].some(kw => name.includes(kw))

    if (is2DType || isUIName) {
      obj.visible = false
    }
  }
}

export function Hero() {
  const onLoad = useCallback((app: Application) => {
    hideUIObjects(app)
  }, [])
  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* Spline 3D background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <Suspense
          fallback={
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#000',
              }}
            />
          }
        >
          <Spline scene="/scene.splinecode" onLoad={onLoad} />
        </Suspense>
      </div>

      {/* Brand name — bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '5%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <h1
          style={{
            fontFamily: "'Clash Display', Montserrat, sans-serif",
            fontSize: 'clamp(64px, 10vw, 140px)',
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            color: '#fff',
            margin: 0,
          }}
        >
          PRAESIDIO
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 16,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.05em',
          }}
        >
          Runtime security for AI agents.
        </p>
      </div>
    </section>
  )
}
