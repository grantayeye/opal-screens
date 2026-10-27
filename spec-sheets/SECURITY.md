# Spec-sheet rendering security

Puppeteer is the only direct dependency. It renders trusted, repository-owned
HTML and local image assets to PDF in a local Chrome process. The pages also
request the public Google Fonts stylesheet; this path has no user uploads,
authentication, secrets, database, or public endpoint.

The official `puppeteer` package is pinned exactly in the manifest and lockfile.
Reproducible dependency checks use `npm ci --ignore-scripts`. A controlled smoke
test permits Puppeteer's official browser installer so browser launch, local page
loading, font and image completion, and PDF output are exercised.

Trust boundaries are npm registry to lockfile, repository HTML to the browser,
and browser to Google Fonts. Lockfile integrity and Rafter SCA cover dependency
tampering; repository-owned inputs limit browser abuse and local-file disclosure.
The accepted residual risks are the official installer running package code and
the public font request. Generated PDFs are checked before publication.

## Collection-validation dependency

Puppeteer 25.13 uses an upstream BiDi package that supports Zod 4. The lockfile
pins patched Zod 4.6.7 without an override (CVE-2023-54404 / GHSA-mrhx-c7xc-m3w5).
The dependency belongs to local rendering and QA; the GitHub Pages site serves
static files and does not execute this Node dependency.

Run `npm test` here to check early rejection of oversized bounded arrays, sets,
and maps, ordinary element validation, and BiDi parser compatibility. The patch
does not impose limits on unbounded schemas or make untrusted rendering safe.
