#!/usr/bin/env bash
# Publish all @iamthamanic/autoguide-* packages to npm (dependency order).
# npm prompts for your 2FA code interactively on each publish (auth-and-writes).
# Usage: ./scripts/publish-npm.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "npm will ask for your authenticator OTP when each package is published."
echo "Keep your authenticator app ready."
echo

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
  (cd "$dir" && pnpm publish --access public --no-git-checks)
done

echo "Done. Verify:"
echo "  npm view @iamthamanic/autoguide-react version"
echo "  npm view @iamthamanic/autoguide-cli version"
