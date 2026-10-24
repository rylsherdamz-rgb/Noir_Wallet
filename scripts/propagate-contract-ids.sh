#!/usr/bin/env bash
#
# propagate-contract-ids.sh — After a redeploy, replace the previous deploy's
# contract IDs and WASM hashes with the new ones across the repo. Prints the
# files it changed, one per line, on stdout.
#
# It only swaps values. Prose around them (deploy dates, "see <evidence file>",
# status notes) still needs a human pass — the workflow's PR says so.
#
# Usage:
#   ./scripts/propagate-contract-ids.sh deploy-evidence/deploy-testnet-<ts>.md
#
# The previous deploy is the one frontend/eas.json points at (the EAS build
# reads its contract IDs from there). Records of past runs keep their old
# values: deploy-evidence/, docs/Evidence/ (captures taken against the old
# contracts), docs/walkthrough.md + docs/evidence-package.md (tx links from
# live runs) and the Noir/Session - *.md logs.
#
set -euo pipefail

NEW_EVIDENCE="${1:?usage: $0 <new deploy-evidence file>}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

die() { printf '✗ %s\n' "$*" >&2; exit 1; }
[ -f "$NEW_EVIDENCE" ] || die "evidence file not found: $NEW_EVIDENCE"

is_id()   { [[ "$1" =~ ^C[A-Z2-7]{55}$ ]]; }
is_hash() { [[ "$1" =~ ^[0-9a-f]{64}$ ]]; }

# $1 = evidence file, $2 = EXPO_PUBLIC_* key
env_id() { grep -m1 "^$2=" "$1" | cut -d= -f2 || true; }
# $1 = evidence file, $2 = wasm name (e.g. device_registry)
wasm_hash() { grep -m1 "^| $2.wasm |" "$1" | grep -oE '[0-9a-f]{64}' || true; }

KEYS=(EXPO_PUBLIC_DEVICE_REGISTRY_CONTRACT EXPO_PUBLIC_AGENT_REGISTRY_CONTRACT EXPO_PUBLIC_PAYMENT_ESCROW_CONTRACT)
WASMS=(device_registry agent_registry payment_escrow)

OLD_IDS=() NEW_IDS=()
for k in "${KEYS[@]}"; do
  old="$(jq -r ".build.base.env.$k // empty" frontend/eas.json)"
  new="$(env_id "$NEW_EVIDENCE" "$k")"
  is_id "$old" || die "frontend/eas.json: $k is not a contract ID: '$old'"
  is_id "$new" || die "$NEW_EVIDENCE: $k is not a contract ID: '$new'"
  [ "$old" != "$new" ] || die "$k is unchanged ($new) — nothing to propagate"
  OLD_IDS+=("$old") NEW_IDS+=("$new")
done

# The previous deploy's evidence file is the one that lists its device ID.
OLD_EVIDENCE="$(grep -l "^${KEYS[0]}=${OLD_IDS[0]}$" deploy-evidence/deploy-*.md | grep -vF "$NEW_EVIDENCE" | head -1 || true)"
[ -n "$OLD_EVIDENCE" ] || die "no deploy-evidence file lists the current IDs from frontend/eas.json"

FROM=() TO=()
for i in 0 1 2; do
  FROM+=("${OLD_IDS[$i]}") TO+=("${NEW_IDS[$i]}")
  old="$(wasm_hash "$OLD_EVIDENCE" "${WASMS[$i]}")"
  new="$(wasm_hash "$NEW_EVIDENCE" "${WASMS[$i]}")"
  is_hash "$old" || die "$OLD_EVIDENCE: no SHA-256 for ${WASMS[$i]}.wasm"
  is_hash "$new" || die "$NEW_EVIDENCE: no SHA-256 for ${WASMS[$i]}.wasm"
  # Docs show hashes in full and shortened as first8…last6.
  FROM+=("$old" "${old:0:8}…${old: -6}") TO+=("$new" "${new:0:8}…${new: -6}")
done

CHANGED=()
for i in "${!FROM[@]}"; do
  while IFS= read -r f; do
    sed -i "s|${FROM[$i]}|${TO[$i]}|g" "$f"
    CHANGED+=("$f")
  done < <(git grep -lF "${FROM[$i]}" -- . \
             ':!deploy-evidence/' ':!docs/Evidence/' ':!docs/walkthrough.md' \
             ':!docs/evidence-package.md' ':!Noir/Session - *' || true)
done

[ "${#CHANGED[@]}" -gt 0 ] || die "no files referenced the previous deploy"
printf '%s\n' "${CHANGED[@]}" | sort -u
