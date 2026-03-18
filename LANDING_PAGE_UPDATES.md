# Landing Page Updates — Pre-Launch Configuration

## ✅ Changes Applied (March 18, 2026)

### 1. Hero Section
**Before:** "View Dashboard" button linking to `/app`
**After:** "Star on GitHub" button linking to `https://github.com/Godatcode/Praesidio`

- Added GitHub icon (SVG)
- Opens in new tab (`target="_blank"`)
- Removed React Router Link, using plain `<a>` tag

---

### 2. Routing
**Before:** `/app` route with full dashboard (Overview, Servers, Threats, etc.)
**After:** All routes redirect to landing page

Changes in `App.tsx`:
- ✅ Removed all dashboard page imports
- ✅ Removed Layout component
- ✅ Removed all `/app/*` routes
- ✅ Added redirect: `/app/*` → `/`
- ✅ Added catch-all: `*` → `/`

**Result:** Only landing page is accessible. Any attempt to visit `/app` or other routes redirects to `/`.

---

### 3. Navbar
**Before:** "Dashboard" button linking to `/app`
**After:** "GitHub" button linking to `https://github.com/Godatcode/Praesidio`

- Added GitHub icon (SVG)
- Opens in new tab
- Removed React Router Link import

---

### 4. CTA Section
**No changes** — Email waitlist signup kept as-is.

---

## 🎯 Current Site Structure

```
praesidio.live/
├── /              → Landing page ✅
├── /app/*         → Redirects to / ✅
└── /*             → Redirects to / ✅
```

---

## 📱 Call-to-Actions Now Available

1. **Get Early Access** (Hero) → Scrolls to email signup
2. **Star on GitHub** (Hero) → Opens GitHub repo in new tab
3. **Get Early Access** (CTA section) → Email input for waitlist
4. **GitHub** (Navbar) → Opens GitHub repo in new tab

---

## 🚀 Pre-Launch Checklist

### Before Deploying to praesidio.live:

- [ ] **Create GitHub repo** at `https://github.com/Godatcode/Praesidio`
  - [ ] Add README.md
  - [ ] Add LICENSE
  - [ ] Add installation instructions
  - [ ] Add demo screenshot/GIF

- [ ] **Social share image** (optional but recommended)
  - Create `public/og-image.png` (1200x630px)
  - Shows preview when shared on Twitter/LinkedIn

- [ ] **Email signup backend** (optional)
  - Currently form just prevents default
  - Consider: Mailchimp, ConvertKit, or simple backend
  - Or connect to Vercel Edge Function

- [ ] **Analytics** (optional)
  - Google Analytics
  - Plausible (privacy-focused)
  - PostHog (open source)

---

## 🧪 Test Locally

1. Start dev server:
   ```bash
   cd dashboard
   npm run dev
   ```

2. Test at `http://localhost:3000`:
   - [ ] Landing page loads
   - [ ] "Star on GitHub" button works (new tab)
   - [ ] Navbar "GitHub" button works (new tab)
   - [ ] Navigate to `/app` → redirects to `/`
   - [ ] All animations work
   - [ ] Email form shows "You're on the list" message

---

## 📦 Production Build

Test the production build:
```bash
cd dashboard
npm run build
npm run preview
```

Visit `http://localhost:4173` to see production version.

---

## 🚀 Ready to Deploy

When ready:
```bash
# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

Then configure DNS for praesidio.live! 🎉

---

## 🔗 Links

- **Landing Page**: https://praesidio.live (after deployment)
- **GitHub Repo**: https://github.com/Godatcode/Praesidio
- **Domain**: praesidio.live (purchased ✅)

---

## ✨ Next Steps

You're now ready for pre-launch! Consider:

1. **Create GitHub repo** (if not done)
2. **Build production version** (`npm run build`)
3. **Deploy to Vercel/Netlify**
4. **Point domain DNS**
5. **Share on Twitter/LinkedIn/Reddit**
6. **Add to Product Hunt** (optional)

The landing page is now a **waitlist/teaser** site pointing to GitHub. Perfect for building early interest! 🚀
