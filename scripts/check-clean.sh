#!/usr/bin/env bash
# Quick pre-commit sanity check for TrustTap AI.
# Fails loudly if build artifacts, env files, or secret-like patterns are staged.

set -euo pipefail

STAGED=$(git diff --cached --name-only)

if [ -z "$STAGED" ]; then
  echo "Nothing staged."
  exit 0
fi

BAD=()
for path in $STAGED; do
  case "$path" in
    .next/*|.next|node_modules/*|/node_modules|build/*|.pnp*|coverage/*|.vercel/*|*.tsbuildinfo)
      BAD+=("DO NOT COMMIT BUILD/OUTPUT: $path")
      ;;
    .env*|*.pem)
      BAD+=("DO NOT COMMIT SECRETS/ENV: $path")
      ;;
  esac
done

if [ ${#BAD[@]} -gt 0 ]; then
  printf '%s\n' "Blocked staged paths:" "${BAD[@]}"
  exit 1
fi

echo "Sanity check passed. Staged: $(echo "$STAGED" | wc -l | tr -d ' ') paths."
