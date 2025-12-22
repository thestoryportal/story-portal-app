#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

case "${1:-}" in
  dev)
    CHOKIDAR_USEPOLLING=1 pnpm --reporter=append-only dev -- --port 5173 --strictPort --clearScreen=false
    ;;
  kill)
    for p in $(seq 5173 5185); do
      pid=$(lsof -tiTCP:$p -sTCP:LISTEN 2>/dev/null || true)
      if [ -n "${pid:-}" ]; then
        echo "Killing port $p (pid $pid)"
        kill -9 $pid || true
      fi
    done
    ;;
  cap)
    # Usage: ./sp cap smoke|buttons|newtopics|menu-open|menu-close
    MODE="${2:-smoke}"
    node tools/ai/capture/run.mjs --mode "$MODE" --label "$MODE"
    ;;
  *)
    echo "Usage:"
    echo "  ./sp dev"
    echo "  ./sp kill"
    echo "  ./sp cap smoke|buttons|newtopics|menu-open|menu-close"
    exit 1
    ;;
esac
