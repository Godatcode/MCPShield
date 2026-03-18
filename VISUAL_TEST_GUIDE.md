# Visual Testing Guide — Landing Page Animations

## 🎬 WHAT YOU SHOULD SEE

### On Page Load (First 2 seconds)
```
Hero Section:
├─ Purple particles drift across background (ANIMATED)
├─ Large purple orb behind text pulses/breathes (ANIMATED)
├─ Badge appears first (0.1s delay)
├─ "Stop trusting your AI agents blindly" appears (0.25s delay)
├─ Subtitle appears (0.4s delay)
├─ Buttons appear (0.55s delay)
└─ Logo marquee scrolls infinitely (0.7s delay)
```

### When You Move Your Mouse Over Hero
```
Particles:
└─ Particles near cursor PUSH AWAY (repulsion effect)

Dashboard Preview:
└─ Image tilts in 3D following mouse position
```

### When You Scroll Down to "Problem" Section
```
1. Heading fades up from bottom
2. Three stat cards appear with stagger (left → middle → right)
3. Numbers COUNT UP from 0:
   ├─ 0 → 30+ (CVEs)
   ├─ 0 → 437K (downloads)
   └─ 0 → 400M+ (funding)
```

### When You Hover Over Stat Cards
```
Card:
├─ Lifts up 6px
├─ Purple glow appears around border
├─ Background gets slightly brighter
└─ Smooth cubic-bezier easing
```

### When You Scroll to "Features" Section
```
1. Heading fades up
2. 6 cards fade in with stagger (row by row)
3. Each card has:
   ├─ Colored icon in rounded square
   ├─ Title in Clash Display font
   └─ Description text
```

### When You Hover Over Feature Cards
```
Card:
├─ Lifts up 6px
├─ Purple glow + box shadow
├─ Border color shifts to purple
└─ Background lightens
```

### When You Scroll to "How It Works" Section
```
1. Heading + subtitle fade in
2. Three step circles (01, 02, 03) appear
3. Dotted connecting line draws between them
4. Three terminal windows fade in with stagger
5. Inside each terminal:
   ├─ Lines TYPE OUT character by character
   ├─ Blinking purple cursor follows text
   ├─ Green ✓ for success
   ├─ Red ✗ for errors
   └─ Amber ⚠ for warnings
```

### When You Scroll to "Comparison" Section
```
1. Heading fades in
2. Table fades in
3. Praesidio column has purple background
4. Hover any row → background highlights
```

### When You Scroll to "CTA" Section
```
1. Card fades in from bottom
2. Purple orb glows behind content
3. Input field and button appear
```

### When You Hover Over "Get Early Access" Button
```
Button:
├─ Purple gradient glow appears (halo effect)
├─ Lifts up 2px
├─ Scales to 1.02 (2% larger)
└─ Box shadow intensifies
```

### When You Click Button (Active State)
```
Button:
└─ Scales down to 0.98 (tactile press feedback)
```

### When You Scroll Past Top (60px)
```
Navbar:
├─ Background changes from transparent to dark glass
├─ Backdrop blur activates
├─ Bottom border appears
└─ Height reduces slightly
```

### When You Hover Over Nav Links
```
Link:
└─ Color changes from gray (#8a8a9a) to white (#f0f0f2)
```

---

## 🎨 COLOR REFERENCE

### Primary Colors
- **Purple**: `#7c5bf0` (main brand)
- **Blue**: `#4a8bf5` (gradient end)
- **Light Purple**: `#a78bfa` (hover glow)
- **Sky Blue**: `#818cf8` (gradient mid)
- **Cyan**: `#60a5fa` (gradient highlight)

### Semantic Colors
- **Green**: `#22c55e` (success, checkmarks)
- **Amber**: `#f59e0b` (warnings)
- **Red**: `#ef4444` (errors, blocked)

### Grayscale
- **White**: `#f0f0f2` (primary text)
- **Gray 50**: `rgba(255,255,255,0.5)` (secondary text)
- **Gray 40**: `rgba(255,255,255,0.4)` (tertiary text)
- **Gray 30**: `rgba(255,255,255,0.3)` (muted text)
- **Gray 15**: `rgba(255,255,255,0.15)` (very subtle)

### Backgrounds
- **Base**: `#08080c` (page background)
- **Card**: `rgba(255,255,255,0.05)` (subtle cards)
- **Card Hover**: `rgba(255,255,255,0.08)` (hover state)
- **Border**: `rgba(255,255,255,0.08)` (visible borders)
- **Border Hover**: `rgba(124,91,240,0.25)` (purple on hover)

---

## 🔧 DEBUGGING TIPS

### If Particles Don't Appear:
1. Open DevTools Console (F12)
2. Look for canvas errors
3. Check that canvas element exists in DOM
4. Verify `ParticleCanvas` is imported in Hero.tsx

### If Particles Don't React to Mouse:
1. Verify `pointerEvents: 'auto'` on canvas style
2. Check mouse event listeners are attached
3. Try refreshing the page

### If Cards Are Invisible:
1. Check background opacity is 0.05 or higher
2. Inspect element → Computed styles
3. Look for conflicting inline styles
4. Verify CSS loaded (check Network tab)

### If Animations Don't Trigger on Scroll:
1. Scroll slowly (animations have threshold)
2. Check browser supports IntersectionObserver (all modern browsers do)
3. Look for JavaScript errors in console
4. Verify elements have the reveal hooks applied

### If Numbers Don't Count Up:
1. Scroll to Problem section slowly
2. Check CountUp component is rendering
3. Look for `started.current` in React DevTools
4. Verify IntersectionObserver threshold (0.5)

### If Terminal Doesn't Type:
1. Scroll to How It Works section slowly
2. Wait ~300ms after scrolling (stagger delay)
3. Check TypewriterLine components are rendering
4. Verify text prop is not empty

### If Navbar Doesn't Change on Scroll:
1. Scroll past 60px from top
2. Check `window.scrollY` in console
3. Verify scroll event listener is attached
4. Look for `scrolled` state in React DevTools

### If Button Doesn't Glow on Hover:
1. Inspect element → check `::before` pseudo-element exists
2. Verify z-index stacking (button: relative, ::before: -1)
3. Check opacity transition on hover
4. Clear cache and hard reload (Cmd+Shift+R)

---

## 📱 RESPONSIVE NOTES

Current landing page is optimized for **desktop** (1100px max-width).

For mobile testing:
- Reduce font sizes
- Stack cards vertically
- Simplify particle count (60 instead of 120)
- Disable 3D tilt on touch devices
- Use single-column layout for features

---

## ⚡ PERFORMANCE EXPECTATIONS

- **Particle FPS**: 60fps on modern hardware
- **Page load time**: < 1s (no external deps)
- **Time to interactive**: < 0.5s
- **Lighthouse score**: 90+ (performance)
- **Animation jank**: None (hardware-accelerated transforms)

---

## ✅ FINAL CHECKLIST (ONE-MINUTE TEST)

1. ⏱️ **0:00 - Load page** → Hero animates in sequence
2. 🖱️ **0:05 - Move mouse** → Particles react
3. 🔄 **0:10 - Scroll down** → Numbers count up
4. 👆 **0:15 - Hover card** → Purple glow appears
5. 🔄 **0:20 - Keep scrolling** → Terminals type
6. 👆 **0:30 - Hover CTA button** → Button glows
7. 🔄 **0:40 - Scroll to top** → Navbar changes
8. 👆 **0:50 - Click nav link** → Smooth scroll
9. 🔄 **1:00 - Scroll to bottom** → All sections revealed

**If all 9 steps work → Landing page is ALIVE ✅**

---

## 🎉 EXPECTED RESULT

You should see a **premium, interactive, buttery-smooth** landing page that feels like:
- **Apple product page** (clean, spacious, confident)
- **Linear app** (subtle, purposeful animations)
- **Stripe marketing** (gradient glows, micro-interactions)
- **Vercel landing** (particle effects, glass morphism)

NOT like:
- ❌ Static PDF
- ❌ Template from 2015
- ❌ Janky animations
- ❌ Invisible elements

---

## 🚀 DEPLOYMENT READY

All animations use:
- ✅ Native browser APIs (no polyfills needed)
- ✅ CSS transforms (GPU-accelerated)
- ✅ IntersectionObserver (supported in all modern browsers)
- ✅ RequestAnimationFrame (optimal performance)
- ✅ Zero external animation libraries

**Compatible with:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Not compatible with:**
- IE11 (who cares)
- Opera Mini (no JS)
- Old Android browsers (< Chrome 90)
