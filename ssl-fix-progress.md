# Opal Screens SSL Fix — Progress Tracker
## Started: 2026-03-12 04:30 EDT | RESOLVED: 2026-03-12 08:17 EDT

## Problem
- opalscreens.com shows SSL error in browser
- GitHub Pages serving `*.github.io` wildcard cert instead of custom domain cert
- `https_certificate.state: "authorization_created"` — Let's Encrypt challenge stuck
- `https_enforced: false`

## DNS Status (verified working)
- A records: 185.199.108/109/110/111.153 ✅
- www CNAME → grantayeye.github.io ✅
- No CAA records blocking cert issuance ✅
- HTTP (port 80) returns 200 OK from GitHub Pages ✅

## Root Cause Analysis
The Let's Encrypt authorization was created but never completed validation.
Possible causes:
1. Domain not verified in GitHub account settings (TXT record needed)
2. Stale cert request — needs to be cycled (remove/re-add custom domain)
3. GitHub Pages might need `https_enforced` toggled after cert issues

## GitHub Pages Health Check (from API)
- Domain: opalscreens.com — is_valid: true, is_pointed_to_github_pages_ip: true
- WWW: www.opalscreens.com — is_valid: true, is_cname_to_github_user_domain: true
- is_https_eligible: true, caa_error: null
- https_error: "peer_failed_verification" (serving *.github.io cert, not custom domain cert)

## Fix Attempts

### Attempt 1: Cycle custom domain (remove → re-add) — DONE 04:33 EDT
- Removed CNAME via Contents API → Pages got disabled
- Re-enabled Pages via POST API
- Re-added CNAME file
- Triggered pages build
- Result: Cert state back to `authorization_created` — still provisioning

### Attempt 2: Cron monitoring every 15 min — ACTIVE
- Cron job "opal-ssl-monitor" (cd37c3eb-fcc0-4ea9-82f2-a77523dac0f7)
- Runs every 15 min, isolated session
- Will trigger builds, cycle domain if stuck 2+ hours
- Auto-notifies Bradd on fix

### Escalation plan (if not fixed by ~06:30 EDT)
- Cycle CNAME again (remove/re-add via API)
- If still stuck: may need to verify domain in GitHub account settings (requires browser)
- Last resort: try Cloudflare Pages instead of GitHub Pages

## Timeline
- [x] 04:30 — Started investigation, identified cert stuck at authorization_created
- [x] 04:33 — Cycled custom domain (remove → re-add), triggered build
- [x] 04:35 — Set up cron monitoring every 15 min
- [ ] Monitoring cert provisioning...
- [ ] SSL working → notify Bradd
[2026-03-12 04:38:23 EDT] Cert state: authorization_created | HTTPS enforced: False
[2026-03-12 04:38:23 EDT] ⏳ Still waiting for cert authorization to complete
[2026-03-12 04:38:23 EDT] Triggered fresh pages build
[2026-03-12 04:53:20 EDT] Cert state: authorization_created | HTTPS enforced: False
[2026-03-12 04:53:20 EDT] ⏳ Still waiting for cert authorization to complete
[2026-03-12 04:53:20 EDT] Triggered fresh pages build
[2026-03-12 04:53 EDT] Cron check #3: still authorization_created, build triggered. 23 min elapsed — escalation at ~06:30 if no progress.
[2026-03-12 05:08:18 EDT] Cert state: authorization_created | HTTPS enforced: False
[2026-03-12 05:08:18 EDT] ⏳ Still waiting for cert authorization to complete
[2026-03-12 05:08:18 EDT] Triggered fresh pages build
[2026-03-12 05:08 EDT] Cron check #4: still authorization_created, build triggered. ~38 min elapsed — will escalate (CNAME cycle) at ~06:30 if no progress.
[2026-03-12 05:23:20 EDT] Cert state: authorization_created | HTTPS enforced: False
[2026-03-12 05:23:20 EDT] ⏳ Still waiting for cert authorization to complete
[2026-03-12 05:23:20 EDT] Triggered fresh pages build
[2026-03-12 05:23 EDT] Cron check #5: still authorization_created, build triggered. ~53 min elapsed — escalation (CNAME cycle) at ~06:30 if no progress.
[2026-03-12 05:38:20 EDT] Cert state: authorization_created | HTTPS enforced: False
[2026-03-12 05:38:20 EDT] ⏳ Still waiting for cert authorization to complete
[2026-03-12 05:38:20 EDT] Triggered fresh pages build
[2026-03-12 05:38 EDT] Cron check #6: still authorization_created, build triggered. ~68 min elapsed — CNAME cycle escalation at ~06:30 if no progress.
[2026-03-12 05:53:40 EDT] Cert state: authorization_created | HTTPS enforced: False
[2026-03-12 05:53:40 EDT] ⏳ Still waiting for cert authorization to complete
[2026-03-12 05:53:40 EDT] Triggered fresh pages build
[2026-03-12 05:53 EDT] Cron check #7: still authorization_created, build triggered. ~83 min elapsed — CNAME cycle escalation at next check (~06:08) if still stuck (will be ~98 min, close enough to 2hr).
[2026-03-12 06:08:40 EDT] Cert state: authorization_created | HTTPS enforced: False
[2026-03-12 06:08:40 EDT] ⏳ Still waiting for cert authorization to complete
[2026-03-12 06:08:40 EDT] Triggered fresh pages build
[2026-03-12 06:09 EDT] **ESCALATION: CNAME cycle #2** — ~98 min stuck. Removed CNAME, waited 30s, re-added, triggered build. Fresh cert request should start. If still stuck after another hour, may need GitHub domain verification (TXT record) or Cloudflare alternative.
[2026-03-12 06:23:42 EDT] Cert state: authorization_created | HTTPS enforced: False
[2026-03-12 06:23:42 EDT] ⏳ Still waiting for cert authorization to complete
[2026-03-12 06:23:42 EDT] Triggered fresh pages build
[2026-03-12 06:38:40 EDT] Cert state: authorization_created | HTTPS enforced: False
[2026-03-12 06:38:40 EDT] ⏳ Still waiting for cert authorization to complete
[2026-03-12 06:38:40 EDT] Triggered fresh pages build
[2026-03-12 06:53:39 EDT] Cert state: authorization_created | HTTPS enforced: False
[2026-03-12 06:53:39 EDT] ⏳ Still waiting for cert authorization to complete
[2026-03-12 06:53:39 EDT] Triggered fresh pages build
[2026-03-12 07:10:40 EDT] Cert state: authorization_created | HTTPS enforced: False
[2026-03-12 07:10:40 EDT] ⏳ Still waiting for cert authorization to complete
[2026-03-12 07:10:40 EDT] Triggered fresh pages build
[2026-03-12 08:12:41 EDT] Cert state: authorization_created | HTTPS enforced: False
[2026-03-12 08:12:41 EDT] ⏳ Still waiting for cert authorization to complete
[2026-03-12 08:12:41 EDT] Triggered fresh pages build
