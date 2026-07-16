#!/usr/bin/env bash
# Publish all @iamthamanic/autoguide-* packages to npm (dependency order).
# npm prompts for your 2FA code interactively on each publish (auth-and-writes).
# Usage:
#   ./scripts/publish-npm.sh
#   NPM_OTP=123456 ./scripts/publish-npm.sh   # pass 2FA once for the whole run
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! npm whoami >/dev/null 2>&1; then
  echo "ERROR: Not logged in to npm (or token expired)." >&2
  echo "Run: npm login" >&2
  echo "Then retry. npm often returns 404 (not 401) when publish auth is missing." >&2
  exit 1
fi

NPM_USER="$(npm whoami)"
echo "npm user: ${NPM_USER}"
echo "npm will ask for your authenticator OTP when each package is published."
echo "Tip: export NPM_OTP=<code> to pass 2FA non-interactively for this run."
echo

PUBLISH_ARGS=(--access public --no-git-checks)
if [[ -n "${NPM_OTP:-}" ]]; then
  PUBLISH_ARGS+=(--otp "$NPM_OTP")
fi

PACKAGES=(
  packages/core
  packages/ui
  packages/runtime
  packages/config
  packages/storage
  packages/export
  packages/ai
  packages/scanner
  packages/playwright
  packages/client
  plugins/react
  plugins/vite
  packages/cli
)

for dir in "${PACKAGES[@]}"; do
  echo "==> Publishing ${dir}..."
  if ! (cd "$dir" && pnpm publish "${PUBLISH_ARGS[@]}"); then
    echo "ERROR: publish failed for ${dir}" >&2
    echo "If you see 404: run 'npm login' as a maintainer (raccoova), then retry." >&2
    exit 1
  fi
done

echo "Done. Verify:"
echo "  npm view @iamthamanic/autoguide-react version"
echo "  npm view @iamthamanic/autoguide-cli version"
