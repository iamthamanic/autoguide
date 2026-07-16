#!/usr/bin/env bash
# Non-destructive preflight for @prepare-npm-release skill.
# Usage: ./.cursor/skills/prepare-npm-release/scripts/preflight.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}PASS${NC}  $*"; }
fail() { echo -e "${RED}FAIL${NC}  $*"; FAILURES=$((FAILURES + 1)); }
warn() { echo -e "${YELLOW}WARN${NC}  $*"; }

FAILURES=0

echo "=== AutoGuide npm release preflight ==="
echo "Root: $ROOT"
echo

# Git branch
BRANCH="$(git branch --show-current 2>/dev/null || echo unknown)"
if [[ "$BRANCH" == "main" ]]; then
  pass "Branch: main"
else
  fail "Branch: $BRANCH (expected main)"
fi

# Working tree
if git diff --quiet && git diff --cached --quiet; then
  pass "Working tree clean"
else
  warn "Working tree has uncommitted changes (may be OK if release will commit them)"
  git status --short | head -20
fi

# Sync with origin
git fetch origin --quiet 2>/dev/null || warn "Could not fetch origin"

if git rev-parse origin/main >/dev/null 2>&1; then
  AHEAD="$(git log origin/main..HEAD --oneline 2>/dev/null | wc -l | tr -d ' ')"
  BEHIND="$(git log HEAD..origin/main --oneline 2>/dev/null | wc -l | tr -d ' ')"
  if [[ "$AHEAD" == "0" && "$BEHIND" == "0" ]]; then
    pass "Synced with origin/main"
  else
    if [[ "$AHEAD" != "0" ]]; then
      fail "Ahead of origin/main by $AHEAD commit(s) — push required"
    fi
    if [[ "$BEHIND" != "0" ]]; then
      fail "Behind origin/main by $BEHIND commit(s) — pull required"
    fi
  fi
else
  warn "origin/main not found — skip sync check"
fi

# Version consistency across publish packages
PUBLISH_DIRS=(
  packages/core packages/ui packages/runtime packages/config
  packages/storage packages/export packages/ai packages/scanner
  packages/playwright packages/client plugins/react plugins/vite packages/cli
)

VERSIONS=()
for dir in "${PUBLISH_DIRS[@]}"; do
  if [[ -f "$dir/package.json" ]]; then
    v="$(node -p "require('./$dir/package.json').version" 2>/dev/null || echo missing)"
    VERSIONS+=("$v")
  else
    fail "Missing $dir/package.json"
  fi
done

UNIQUE="$(printf '%s\n' "${VERSIONS[@]}" | sort -u | wc -l | tr -d ' ')"
if [[ "$UNIQUE" == "1" ]]; then
  pass "All publish packages at version ${VERSIONS[0]}"
  LOCAL_VERSION="${VERSIONS[0]}"
else
  fail "Version mismatch across packages:"
  for dir in "${PUBLISH_DIRS[@]}"; do
    v="$(node -p "require('./$dir/package.json').version" 2>/dev/null || echo ?)"
    echo "       $dir → $v"
  done
  LOCAL_VERSION="${VERSIONS[0]}"
fi

# npm registry comparison (best effort)
if command -v npm >/dev/null 2>&1; then
  NPM_CLI="$(npm view @iamthamanic/autoguide-cli version 2>/dev/null || echo none)"
  NPM_REACT="$(npm view @iamthamanic/autoguide-react version 2>/dev/null || echo none)"
  echo
  echo "Registry: cli=$NPM_CLI  react=$NPM_REACT  local=$LOCAL_VERSION"
  if [[ "$NPM_CLI" == "$LOCAL_VERSION" ]]; then
    warn "npm already has cli@$LOCAL_VERSION — bump version before publish"
  elif git ls-remote --tags origin 2>/dev/null | grep -q "refs/tags/v${LOCAL_VERSION}\$"; then
    warn "Tag v${LOCAL_VERSION} on origin but npm is $NPM_CLI — RESUME PUBLISH (skip bump/tag)"
  else
    pass "Local version $LOCAL_VERSION not yet on npm (cli)"
  fi
else
  warn "npm not available — skip registry check"
fi

# GitHub CLI
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    pass "gh CLI authenticated"
    OPEN="$(gh pr list --state open --json number -q 'length' 2>/dev/null || echo ?)"
    echo "       Open PRs: $OPEN"
  else
    warn "gh not authenticated — GitHub release step will need auth"
  fi
else
  warn "gh CLI not found — install for automated GitHub releases"
fi

# Tag already exists locally/remotely
if [[ -n "${LOCAL_VERSION:-}" ]]; then
  TAG="v${LOCAL_VERSION}"
  if git rev-parse "$TAG" >/dev/null 2>&1; then
    warn "Local tag $TAG already exists"
  fi
  if git ls-remote --tags origin 2>/dev/null | grep -q "refs/tags/${TAG}\$"; then
    warn "Remote tag $TAG already exists on origin"
  fi
fi

echo
if [[ "$FAILURES" -gt 0 ]]; then
  echo -e "${RED}$FAILURES blocking issue(s) — fix before release prep${NC}"
  exit 1
fi

echo -e "${GREEN}Preflight OK — proceed with @prepare-npm-release phases${NC}"
