#!/usr/bin/env bash
set -euo pipefail

current_sha="${VERCEL_GIT_COMMIT_SHA:-HEAD}"
previous_sha="${VERCEL_GIT_PREVIOUS_SHA:-}"

if [[ -z "$previous_sha" || "$previous_sha" =~ ^0+$ ]]; then
  previous_sha="HEAD^"
fi

relevant_paths=(
  "apps/web"
  "packages/api-client"
  "packages/contracts"
  "package.json"
  "pnpm-lock.yaml"
  "pnpm-workspace.yaml"
  "vercel.json"
)

if ! changed_files="$(git diff --name-only "$previous_sha" "$current_sha" -- "${relevant_paths[@]}" 2>/dev/null)"; then
  echo "Could not compare $previous_sha..$current_sha; running Vercel build."
  exit 1
fi

if [[ -n "$changed_files" ]]; then
  echo "Frontend-related changes detected; running Vercel build:"
  echo "$changed_files"
  exit 1
fi

echo "No frontend-related changes detected; skipping Vercel build."
exit 0
