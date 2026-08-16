# Spec-sheet dependency security

Puppeteer is the only direct dependency and remains on major version 24. The
lockfile is updated without running install scripts, and validation uses
`npm ci --ignore-scripts` before loading the pinned Puppeteer module.

Patch and minor transitive updates remediate the currently reported issues in
`basic-ftp`, `ip-address`, `js-yaml`, and `ws`. The remaining `extract-zip`
advisory has no compatible patched release in Puppeteer 24; resolving it would
require a Puppeteer major upgrade and must be validated separately.
