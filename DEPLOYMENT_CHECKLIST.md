# 🚀 Praesidio.live Deployment Checklist

## ✅ Step 1: Branding & Meta Tags (COMPLETED)

### Files Updated:
- ✅ `dashboard/index.html` — Full meta tags, Open Graph, Twitter cards
- ✅ `dashboard/package.json` — Updated name to "praesidio" + homepage URL
- ✅ `dashboard/public/robots.txt` — SEO crawling rules
- ✅ `dashboard/public/sitemap.xml` — Site structure for search engines
- ✅ `dashboard/public/favicon.svg` — Purple shield logo
- ✅ `dashboard/public/manifest.json` — PWA support

### What Changed:
1. **Meta Tags**
   - Title: "Praesidio — Runtime Security for AI Agents"
   - Description with key stats (30+ CVEs, 437K downloads)
   - Keywords for SEO
   - Canonical URL: https://praesidio.live

2. **Social Sharing**
   - Open Graph tags for Facebook/LinkedIn
   - Twitter Card tags for Twitter/X
   - OG image: `/og-image.png` (need to create this)

3. **SEO Files**
   - robots.txt allows all crawlers
   - Disallows /app/ (dashboard, may need auth)
   - Sitemap with landing + dashboard pages

4. **Favicon & PWA**
   - Purple shield SVG favicon
   - Web app manifest for mobile/PWA
   - Theme color: #08080c (dark)

---

## 📋 Step 2: Create Social Share Image (TODO)

You'll need an Open Graph image at:
- **Path**: `dashboard/public/og-image.png`
- **Size**: 1200x630px (recommended)
- **Content**:
  - Purple gradient background
  - "Praesidio" logo/text
  - Tagline: "Runtime Security for AI Agents"
  - Key stat: "30+ CVEs in 60 days"

**Tools to create it:**
- Figma (easiest)
- Canva
- Photoshop
- Or use https://og-image.vercel.app/ (auto-generate)

---

## 📋 Step 3: Deployment Setup (TODO)

### Option A: Vercel (Recommended — Fastest)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from dashboard folder
cd dashboard
vercel

# Add custom domain
vercel domains add praesidio.live
vercel domains add www.praesidio.live

# Set up redirects (www → apex)
# Add to vercel.json
```

### Option B: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
cd dashboard
netlify deploy --prod

# Add domain in Netlify dashboard
```

### Option C: Cloudflare Pages
- Push to GitHub
- Connect repo in Cloudflare Pages dashboard
- Build command: `npm run build`
- Output directory: `dist`

---

## 📋 Step 4: DNS Configuration (TODO)

### If using Vercel:
1. Go to your domain registrar (where you bought praesidio.live)
2. Add DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### If using Netlify:
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: [your-site].netlify.app
```

### If using Cloudflare Pages:
- DNS managed automatically by Cloudflare
- Just click "Add custom domain" in dashboard

---

## 📋 Step 5: Environment Variables (TODO)

Create `.env.production` in dashboard folder:
```bash
VITE_API_URL=https://api.praesidio.live
VITE_SITE_URL=https://praesidio.live
VITE_GA_ID=G-XXXXXXXXXX  # Google Analytics (optional)
```

---

## 📋 Step 6: Analytics & Monitoring (TODO)

### Google Analytics (Optional)
1. Create GA4 property at https://analytics.google.com
2. Get measurement ID (G-XXXXXXXXXX)
3. Add to index.html:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Error Tracking (Optional)
- Sentry (free tier)
- LogRocket
- Rollbar

---

## 📋 Step 7: Pre-Launch Checklist (TODO)

Before going live:
- [ ] Test on mobile (responsive design)
- [ ] Test on Safari, Chrome, Firefox
- [ ] Lighthouse score > 90 (performance, SEO, accessibility)
- [ ] All links work (no 404s)
- [ ] Forms work (CTA email signup)
- [ ] Social share preview looks good (Twitter, LinkedIn)
- [ ] SSL certificate active (https)
- [ ] Favicon shows in browser tab
- [ ] Page loads in < 2s

---

## 📋 Step 8: Post-Launch (TODO)

After deployment:
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Share on Twitter/X, LinkedIn, Reddit (r/MachineLearning, r/ArtificialIntelligence)
- [ ] Add to Product Hunt (if appropriate)
- [ ] Monitor analytics (traffic, conversions)
- [ ] Set up email (hello@praesidio.live, support@praesidio.live)

---

## 🎯 Current Status

**COMPLETED:**
- ✅ Step 1: Branding & Meta Tags

**NEXT UP:**
- 🔲 Step 2: Create OG image (og-image.png)
- 🔲 Step 3: Deploy to Vercel/Netlify
- 🔲 Step 4: Configure DNS
- 🔲 Step 5: Set environment variables
- 🔲 Step 6: Add analytics (optional)
- 🔲 Step 7: Pre-launch testing
- 🔲 Step 8: Go live!

---

## 📞 Need Help?

- **Vercel docs**: https://vercel.com/docs
- **Netlify docs**: https://docs.netlify.com
- **DNS guides**: https://support.cloudflare.com/hc/en-us/articles/360019093151

Ready for Step 2? 🎨
