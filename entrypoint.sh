#!/bin/sh
set -e
echo "Initializing frontend volume..."
mkdir -p /frontend-build
rsync -a --delete /app/build/ /frontend-build/

mkdir -p /app/storage
if [ "$(stat -c %u /app/storage)" != "10001" ]; then
  chown -R appuser:appuser /app/storage
fi
mkdir -p /app
if [ "$(stat -c %u /app)" != "10001" ]; then
  chown -R appuser:appuser /app
fi

echo "Running setup..."
gosu appuser python main.py --setup

echo "Starting app..."
exec gosu appuser "$@"