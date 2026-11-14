# Opal Screens Instructions

Use this file for work in this repo. It overrides the workspace defaults.

## Non-Negotiable Voice Rule

Bradd Konert / Gamma Tech Services is an authorized dealer and integrator of Opal Screens products.

- Never imply Bradd owns, founded, or runs Opal Screens.
- All external content must be written from the perspective of a dealer who sells, installs, and recommends Opal products.

## Product Context

Opal Screens is a MicroLED video wall brand. Gamma Tech Services is the US-based authorized dealer/integrator.

## Git And Deploy

- Single branch: `main`
- Commit directly to `main`
- GitHub Pages auto-deploys from `main`
- No staging branch or PR workflow

## Public Messaging Constraints

- Never mention manufacturer details publicly.
- Never mention `COB` publicly. Use `BlackFire` instead where applicable.
- Never reveal pricing publicly.
- Never compare Opal series against each other in marketing. Compare Opal against the broader category or industry.
- Never position MicroLED for direct ball-impact applications like golf simulators or similar projectile use.

## Product Constraints

- `SilkStream` 240Hz is Boulder-only. Never combine it with Onyx.
- `BlackFire` is not on Doublet. Never claim it is.
- `NanoPix` is Onyx-only.

## SEO And Site Rules

- Use `Brand` schema, not `Organization`, for Opal Screens.
- Main H1 is `Premium MicroLED Video Walls`.
- Keep canonical and deployment behavior aligned with the existing GitHub Pages setup.

## Hosting And DNS

- Hosting is GitHub Pages on `main`
- If Cloudflare is ever involved, use DNS-only mode, never orange-cloud proxy
- Do not cycle GitHub Pages custom domain via API when SSL is stuck; use the UI flow

## Contact Flow

- Contact form posts to the ATools API `opalContact` route
- Preserve Turnstile, honeypot, and rate-limit protections when touching form behavior

## Source Reference

For full background and product specifics, consult `./CLAUDE.md` as read-only source material.
