#!/usr/bin/env bash
# 로컬 개발 환경을 한 번에 띄운다.
#
#   ./dev.sh                 관리자(admin)로 로그인 — 역할 변경까지 되는 최고 권한
#   ./dev.sh executive       임원진 (역할 변경은 403)
#   ./dev.sh student         재학생
#   ./dev.sh alumni          졸업생
#   ./dev.sh guest           외부인
#
# 하는 일
#   1) 백엔드(uvicorn 8000)를 백그라운드로 띄우고 뜰 때까지 기다린다
#   2) dev_login.py 로 토큰을 발급해 '브라우저 콘솔에 붙여넣을 한 줄'을 출력한다
#   3) 프론트(next dev 3000)를 앞에서 띄운다
#   Ctrl+C 를 누르면 백엔드까지 같이 정리한다.
set -uo pipefail

FRONT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACK_DIR="$(cd "$FRONT_DIR/../uplp_back/uplp_back" 2>/dev/null && pwd)"
PRESET="${1:-admin}"
BACK_LOG="/tmp/uplp-back.log"

if [ -z "${BACK_DIR:-}" ]; then
  echo "✗ 백엔드 폴더를 찾을 수 없습니다: $FRONT_DIR/../uplp_back/uplp_back"
  exit 1
fi

# venv 를 만든 뒤 폴더를 옮겨서 venv/bin/* 스크립트의 shebang 이 옛 경로를 가리킨다.
# venv/bin/python 자체는 심볼릭 링크라 멀쩡하므로 항상 `python -m` 으로 실행한다.
PY="$BACK_DIR/venv/bin/python"
if [ ! -x "$PY" ]; then
  echo "✗ venv 가 없습니다: $PY"
  echo "  cd $BACK_DIR && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt"
  exit 1
fi

# 프론트가 로컬 백엔드를 보고 있는지 확인만 한다(고치지는 않는다 — 운영 서버를 보려고
# 일부러 바꿔둔 것일 수 있다).
if ! grep -q "localhost:8000" "$FRONT_DIR/.env.local" 2>/dev/null; then
  echo "⚠️  .env.local 이 localhost:8000 을 가리키지 않습니다."
  echo "   현재: $(grep API_URL "$FRONT_DIR/.env.local" 2>/dev/null || echo '(없음)')"
  echo "   로컬 백엔드로 테스트하려면 NEXT_PUBLIC_API_URL=http://localhost:8000 로 두세요."
  echo
fi

cleanup() {
  echo
  echo "▸ 백엔드 종료 중…"
  [ -n "${BACK_PID:-}" ] && kill "$BACK_PID" 2>/dev/null
  exit 0
}
trap cleanup INT TERM

# ── 1. 백엔드 ────────────────────────────────────────────────
if lsof -ti:8000 >/dev/null 2>&1; then
  echo "▸ 8000 포트에 이미 떠 있는 서버를 그대로 씁니다."
else
  echo "▸ 백엔드 기동… (로그: $BACK_LOG)"
  (cd "$BACK_DIR" && "$PY" -m uvicorn main:app --reload --port 8000 >"$BACK_LOG" 2>&1) &
  BACK_PID=$!

  for _ in $(seq 1 40); do
    curl -sf http://localhost:8000/ >/dev/null 2>&1 && break
    sleep 0.5
  done

  if ! curl -sf http://localhost:8000/ >/dev/null 2>&1; then
    echo "✗ 백엔드가 뜨지 않았습니다. 로그 마지막 부분:"
    tail -20 "$BACK_LOG"
    cleanup
  fi
fi
echo "  ✓ http://localhost:8000/docs"

# ── 2. 로그인 토큰 ───────────────────────────────────────────
echo
echo "────────── 로그인 ($PRESET) ──────────"
(cd "$BACK_DIR" && "$PY" dev_login.py "$PRESET")
echo "──────────────────────────────────────"
echo "  위 localStorage 한 줄을 http://localhost:3000 의 개발자도구 Console 에 붙여넣으세요."
echo

# ── 3. 프론트 ────────────────────────────────────────────────
cd "$FRONT_DIR" && npm run dev
cleanup
