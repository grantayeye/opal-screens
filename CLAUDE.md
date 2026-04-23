# Opal Screens — Claude Code Instructions

## CRITICAL: LinkedIn & Content Voice Rule

> **NON-NEGOTIABLE:** Bradd Konert / Gamma Tech Services is an **authorized dealer and integrator** of Opal Screens products. Bradd is NOT the owner, CEO, president, or founder of Opal Screens. ALL external content — LinkedIn posts, blog articles, outreach emails, social media — MUST be written from the perspective of a dealer who sells, installs, and recommends Opal products. Never imply Bradd runs or founded Opal Screens.

This rule applies to every piece of content generated in this repo or related to Opal Screens anywhere.

## Overview

Opal Screens is a MicroLED video wall brand. The manufacturer is M-Shine (Shenzhen) using the UT-COB Series (flip-chip COB). Gamma Tech Services (Naples, FL) is the US-based authorized dealer/integrator.

- **Site:** opalscreens.com — static HTML, dark theme, Space Grotesk + Inter fonts
- **Repo:** `grantayeye/opal-screens` on GitHub
- **Local working copy also at:** `~/clawd/projects/opal-screens/`
- **Contact form backend:** `POST atools-api.gamma.tech/functions/opalContact` → Resend → sales@gamma.tech
- **Shared mailbox:** info@opalscreens.com (M365, Graph API accessible)

## Git Workflow

- **Single branch:** `main` — all commits go directly here
- **Auto-deploy:** GitHub Pages deploys from `main` branch automatically
- No PR workflow, no staging branch — commit and push to deploy

## Hosting & DNS

- **Hosting:** GitHub Pages (repo `grantayeye/opal-screens`, branch `main`)
- **Domain:** opalscreens.com registered at GoDaddy (account: `gammatechav`)
- **Nameservers:** ns29.domaincontrol.com / ns30.domaincontrol.com (GoDaddy defaults)
- **DNS records:**
  - 4× A records → GitHub Pages IPs (185.199.108-111.153)
  - www CNAME → grantayeye.github.io (301 redirects to non-www)
  - GitHub verification TXT: `_github-pages-challenge-grantayeye`
  - M365 MX, autodiscover CNAME, SPF TXT for email
- **SSL:** GitHub Pages auto-provisions Let's Encrypt cert

## Product Line

| Series | Pixel Pitch | Brightness | Refresh | Key Tech | Use Case |
|--------|-------------|------------|---------|----------|----------|
| **Onyx** | 0.7mm (0.625mm actual) | 600 nits | 3,840Hz / 60Hz | BlackFire + NanoPix | Close-viewing, art display, study |
| **Boulder** | 0.9mm | 1,000 nits | 15,360Hz / 240Hz | BlackFire + SilkStream | Home theater (go-to recommendation) |
| **Crystal** | 0.9mm & 1.2mm | 600 nits | 3,840Hz / 60Hz | BlackFire | Media rooms, living rooms, commercial |
| **Doublet** | 1.2mm & 1.5mm | 600 nits | 3,840Hz / 60Hz | *(none)* | Budget-friendly, large format |
| **Water** | 1.2 / 1.5 / 1.875mm | 4,000 nits | TBD | IP65 outdoor | Outdoor installations |

### Proprietary Tech Branding

- **BlackFire:** Anti-glare matte nano-coating. All series EXCEPT Doublet.
- **NanoPix:** Pixel-level calibration/uniformity correction. Onyx only (0.7mm).
- **SilkStream:** Panel refresh >15,000Hz enabling 240Hz source support. Boulder only.
- **CONSTRAINT:** SilkStream 240Hz does NOT exist at 0.7mm pitch — never combine SilkStream with Onyx.
- **CONSTRAINT:** BlackFire is NOT on Doublet — don't claim it is.
- **Never mention COB publicly** — always say "BlackFire" instead.
- **Never reveal manufacturer details** (M-Shine, Novastar, MTC, etc.) in public content.

### Common Indoor Specs

- Cabinet: 600×337.5×39.75mm, 4kg/panel
- Module: 150×168.75mm (8 modules/cabinet)
- Contrast: 100,000:1, 100% front access, magnetic modules
- Surface: Dustproof, moisture-proof, 4H hardness, scrubbable
- Certs: CE/CB/FCC/ETL/ROHS
- Technology: Flip-chip COB

## Spec Sheets

- **Location in repo:** `spec-sheets/`
- **Source:** HTML files edited directly, then rendered to PDF via Puppeteer
- **Current sheets:**
  - `crystal-series.html` → `opal-crystal-series-spec-sheet.pdf`
  - `boulder-series.html` → `opal-boulder-series-spec-sheet.pdf`
  - `doublet-series.html` → `opal-doublet-series-spec-sheet.pdf`
- **Still needed:** Onyx, Water
- **Re-render command:**
  ```bash
  cd spec-sheets && node -e "const p=require('puppeteer'),path=require('path');(async()=>{const b=await p.launch({headless:true,args:['--no-sandbox']});for(const[h,o]of[['crystal-series.html','opal-crystal-series-spec-sheet.pdf'],['boulder-series.html','opal-boulder-series-spec-sheet.pdf'],['doublet-series.html','opal-doublet-series-spec-sheet.pdf']]){const pg=await b.newPage();await pg.goto('file://'+path.resolve(h),{waitUntil:'networkidle0'});await pg.pdf({path:o,format:'Letter',printBackground:true,margin:{top:0,bottom:0,left:0,right:0}});await pg.close();}await b.close();})();"
  ```
- **Brand assets:** `assets/` (opal-logo.png, blackfire-logo.png, nanopix-logo.png). No SilkStream logo file — rendered as styled text.

## Blog

- **Index:** `/blog/` with grid listing, newest first
- **Shared stylesheet:** `blog/blog.css` (dark theme matching main site)
- **Each article has:** SEO meta tags, og:tags, BlogPosting JSON-LD, related articles section, CTA to `/#contact`
- **Sitemap:** `sitemap.xml` includes all blog URLs and landing pages
- **Blog cron:** `opal-blog-topics` (ID: 7eb6c89e) runs Mondays 10am ET via OpenClaw — proposes 3 topics, auto-picks after 24h if no response, writes article, commits, pushes
- **Pending topics file:** `blog/pending-topic.json`

### Blog Writing Rules (from `~/clawd/memory/topics/opal-blog-writing-rules.md`)

- Complete sentences only — no fragments for dramatic effect
- No one-word sentences ("Ever." "Period." etc.)
- Minimal em dashes (AI tell)
- No incomplete attention-grabber sentences
- Compare Opal vs. industry, NEVER series vs. series (don't cannibalize own products)
- Frame SilkStream as "available first in Boulder Series" (implies future expansion)
- Never mention COB, manufacturer names, or internal component details publicly

## SEO

- **Schema:** `Brand` type (not Organization) for Opal Screens structured data
- **Product schemas:** All 5 series with specs, `price: "0"` (dealer channel, no public MSRP)
- **FAQPage:** Structured data + visible accordion on homepage
- **H1:** "Premium MicroLED Video Walls" (not the tagline "Seeing is Believing")
- **Landing pages:**
  - `/solutions/home-theater/`
  - `/solutions/commercial/`
  - `/solutions/houses-of-worship/`
  - `/dealers/` (Gamma Tech as featured dealer)
- **Google Search Console:** Set up for opalscreens.com, sitemap submitted
- **Known issue:** Google chose `www.opalscreens.com` as canonical despite 301 + canonical tag pointing to non-www

## Cloudflare & DNS

- opalscreens.com is NOT in Gamma Tech's Cloudflare account — DNS is at GoDaddy
- **If ever moving to Cloudflare:** Use DNS-only mode (grey cloud), NEVER orange cloud (proxy)
- Orange cloud / Cloudflare proxy blocks HTTP-01 certificate challenges that GitHub Pages and Railway need
- This applies to any origin that issues its own SSL cert (Let's Encrypt, GitHub Pages, etc.)

## Contact Form & Anti-Spam

- **Spam protection:** Cloudflare Turnstile (invisible CAPTCHA)
  - Site key: `0x4AAAAAACrv1aEHwg0l1gPY`
  - Secret key: `TURNSTILE_SECRET_KEY` env var in Railway production
- **Backend route:** `opalContact` function in A Tools API (`atools-api.gamma.tech`)
  - Registered in `api/src/routes/functions.ts` (unauthenticated, webhookLimiter)
  - Also has honeypot field + in-memory rate limiter (5/hr per IP)
- **On submit:** Redirects to `/thanks.html` (branded thank you page)
- **CORS:** `opalscreens.com` and `www.opalscreens.com` allowed in A Tools CORS config

## Critical Gotchas

### GitHub Pages SSL Cert Stuck

When cert is stuck at `authorization_created`:
1. **DO NOT** cycle custom domain via API — this corrupts cert state
2. **DO NOT** repeatedly trigger builds
3. **DO:** Remove custom domain via Settings UI → Click "Unpublish site" via Settings UI → Wait 2 min → Refresh (Pages re-enables from branch config) → Cert re-provisions in ~60 seconds → Enable HTTPS enforcement

The UI path uses different backend logic than the API for cert provisioning. (Source: `~/clawd/memory/2026-03-12.md`)

### Cloudflare Proxy Blocks Certs

Cloudflare proxy ON (orange cloud) blocks HTTP-01 challenges. Always use DNS-only (grey cloud) when origin issues its own cert. This burned us during A Tools migration (Feb 2026) and applies to GitHub Pages, Railway, any Let's Encrypt origin.

### SilkStream Constraint

SilkStream 240Hz does NOT exist at 0.7mm pixel pitch (Onyx). The technology currently only works at 0.9mm (Boulder). Never combine SilkStream specs with Onyx in any content, spec sheet, or product description.

### BlackFire Exclusion

BlackFire anti-glare coating is NOT on the Doublet series. Don't include it in Doublet specs or marketing.

### No Ball-Impact Applications

NEVER write content positioning MicroLED for applications where the screen takes direct physical impact: golf simulators, batting cages, pitching machines, tennis ball machines, or any projectile-based sport sim. MicroLED panels are rigid and cannot absorb 150+ mph ball impact the way a projection impact screen does. Projection dominates those categories for a physical reason. Do NOT propose these as blog topics. Do NOT include them in marketing or solutions pages.

### Manufacturer Confidentiality

Never publicly mention: M-Shine, Molly, MTC, Novastar ICs, COB (say "BlackFire" instead), scan ratios, or any manufacturer-level details. These are confidential.

## What NOT To Do

- **Never imply Bradd owns/runs Opal Screens** — he's a dealer (see top of file)
- **Never mention manufacturer details publicly** — M-Shine, Novastar, COB, scan ratios
- **Never combine SilkStream with Onyx** — 240Hz doesn't exist at 0.7mm
- **Never put BlackFire on Doublet** — it doesn't have the coating
- **Never compare Opal series against each other** in marketing — compare Opal vs. industry
- **Never use `Organization` schema** for Opal — use `Brand`
- **Never set Cloudflare to orange cloud** for this domain — breaks SSL
- **Never cycle GitHub Pages domain via API** when SSL is stuck — use UI
- **Never commit to a branch other than `main`** — there's only one branch
- **Never create files outside this repo** for Opal work during Claude Code sessions
- **Never use fragment sentences or one-word dramatic sentences** in blog posts (AI tell)
- **Never reveal pricing** — dealer channel only, no public MSRP
