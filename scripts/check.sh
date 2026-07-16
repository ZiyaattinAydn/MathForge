#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

printf '\n===== BACKEND =====\n'

cd "$ROOT_DIR/apps/api"
source .venv/Scripts/activate

python -m ruff check .
python -m pytest

printf '\n===== FRONTEND =====\n'

cd "$ROOT_DIR/apps/web"

npm run lint
npm run build

printf '\nMATHFORGE_CHECKS_OK\n'
