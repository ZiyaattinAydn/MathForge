#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_PID=""
WEB_PID=""

cleanup() {
  printf '\nMathForge sunucuları kapatılıyor...\n'

  if [ -n "$API_PID" ]; then
    kill "$API_PID" 2>/dev/null || true
  fi

  if [ -n "$WEB_PID" ]; then
    kill "$WEB_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

(
  cd "$ROOT_DIR/apps/api" || exit 1
  source .venv/Scripts/activate
  fastapi dev app/main.py
) &
API_PID=$!

(
  cd "$ROOT_DIR/apps/web" || exit 1
  npm run dev
) &
WEB_PID=$!

printf '\nMathForge başlatıldı:\n'
printf 'Frontend: http://localhost:3000\n'
printf 'API:      http://127.0.0.1:8000\n'
printf 'Docs:     http://127.0.0.1:8000/docs\n\n'
printf 'İki sunucuyu kapatmak için Ctrl+C kullan.\n\n'

wait -n "$API_PID" "$WEB_PID"
