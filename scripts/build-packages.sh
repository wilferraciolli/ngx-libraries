#!/usr/bin/env bash
# Builds every package in dependency order. `dist/` is gitignored, so on a fresh clone nothing is
# built yet — ngx-region-settings, ngx-calendar and ngx-organization depend on ngx-api-client/ngx-auth/
# ngx-forms/ngx-modals via "file:../x/dist" (see root CLAUDE.md's "Inter-package deps"), and that's a
# dangling reference until those four are built first. A plain `for d in packages/*/` loop only worked by accident (alphabetical directory
# order happened to put api-client/auth/forms before region-settings) — this makes the real
# requirement explicit instead of relying on that.
set -e

foundation=(packages/api-client packages/auth packages/forms packages/modals)

for d in "${foundation[@]}"; do
  npm run build --workspace="$d" --if-present
done

for d in packages/*/; do
  d="${d%/}"
  skip=false
  for f in "${foundation[@]}"; do
    [ "$d" = "$f" ] && skip=true
  done
  $skip || npm run build --workspace="$d" --if-present
done
