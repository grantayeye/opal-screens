#!/bin/bash
# Opal Screens SSL monitoring script
# Checks if opalscreens.com has a valid SSL cert and reports progress

PROGRESS_FILE="$(dirname "$0")/ssl-fix-progress.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')

log() {
  echo "[$TIMESTAMP] $1" >> "$PROGRESS_FILE"
  echo "$1"
}

# Check GitHub Pages cert status
CERT_STATE=$(gh api repos/grantayeye/opal-screens/pages 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('https_certificate',{}).get('state','unknown'))" 2>/dev/null)
HTTPS_ENFORCED=$(gh api repos/grantayeye/opal-screens/pages 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('https_enforced',False))" 2>/dev/null)

log "Cert state: $CERT_STATE | HTTPS enforced: $HTTPS_ENFORCED"

# Check actual SSL connection
SSL_CN=$(curl -sI --max-time 10 https://opalscreens.com 2>&1 | grep -i "HTTP/" | head -1)
SSL_CERT=$(curl -s --max-time 10 -vI https://opalscreens.com 2>&1 | grep "subject:" | head -1)

if echo "$SSL_CERT" | grep -q "opalscreens.com"; then
  log "✅ SSL FIXED! Cert has opalscreens.com CN"
  
  # Enable HTTPS enforcement if not already
  if [ "$HTTPS_ENFORCED" != "True" ]; then
    gh api repos/grantayeye/opal-screens/pages -X PUT --input - <<'APEOF' 2>/dev/null
{"https_enforced": true}
APEOF
    log "Enabled HTTPS enforcement"
  fi
  
  # Notify via openclaw
  echo "FIXED" > "$(dirname "$0")/.ssl-status"
  exit 0
elif [ "$CERT_STATE" = "issued" ] || [ "$CERT_STATE" = "dns_changed" ]; then
  log "🔄 Cert state changed to: $CERT_STATE — progress!"
  
  # Try enabling HTTPS
  gh api repos/grantayeye/opal-screens/pages -X PUT --input - <<'APEOF' 2>/dev/null
{"https_enforced": true}
APEOF
  
  echo "PROGRESSING" > "$(dirname "$0")/.ssl-status"
  exit 0
elif [ "$CERT_STATE" = "authorization_created" ]; then
  log "⏳ Still waiting for cert authorization to complete"
  
  # Trigger a fresh build to nudge the process
  gh api repos/grantayeye/opal-screens/pages/builds -X POST 2>/dev/null
  log "Triggered fresh pages build"
  
  echo "WAITING" > "$(dirname "$0")/.ssl-status"
  exit 1
elif [ "$CERT_STATE" = "errored" ]; then
  log "❌ Cert errored — may need to cycle domain again"
  echo "ERRORED" > "$(dirname "$0")/.ssl-status"
  exit 2
else
  log "❓ Unknown cert state: $CERT_STATE"
  log "SSL cert info: $SSL_CERT"
  echo "UNKNOWN" > "$(dirname "$0")/.ssl-status"
  exit 1
fi
