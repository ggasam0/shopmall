#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
VENV_BIN="$BACKEND_DIR/.venv/bin"
PID_FILE="$ROOT_DIR/run/backend.pid"
LOG_DIR="$ROOT_DIR/logs"
LOG_FILE="$LOG_DIR/backend.log"

mkdir -p "$ROOT_DIR/run" "$LOG_DIR"

is_running() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid=$(cat "$PID_FILE")
    if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
      return 0
    fi
  fi
  return 1
}

start() {
  if [[ ! -x "$VENV_BIN/uvicorn" ]]; then
    echo "未找到虚拟环境，请先在 $BACKEND_DIR 创建 .venv 并安装依赖。"
    exit 1
  fi

  if is_running; then
    echo "后端已在运行，PID: $(cat "$PID_FILE")"
    exit 0
  fi

  echo "启动后端..."
  nohup "$VENV_BIN/uvicorn" app.main:app --host 0.0.0.0 --port 8000 \
    >"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
  echo "已启动，PID: $(cat "$PID_FILE")"
}

stop() {
  if ! is_running; then
    echo "后端未运行。"
    rm -f "$PID_FILE"
    exit 0
  fi

  local pid
  pid=$(cat "$PID_FILE")
  echo "停止后端，PID: $pid"
  kill "$pid"
  for _ in {1..10}; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      sleep 1
    else
      break
    fi
  done

  if kill -0 "$pid" >/dev/null 2>&1; then
    echo "进程未退出，执行强制停止。"
    kill -9 "$pid"
  fi

  rm -f "$PID_FILE"
  echo "已停止。"
}

status() {
  if is_running; then
    echo "后端运行中，PID: $(cat "$PID_FILE")"
  else
    echo "后端未运行。"
  fi
}

restart() {
  stop
  start
}

case "${1:-}" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  status)
    status
    ;;
  restart)
    restart
    ;;
  *)
    echo "用法: $0 {start|stop|status|restart}"
    exit 1
    ;;
esac
