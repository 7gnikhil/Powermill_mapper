#!/usr/bin/env bash
# Direct Local Build & Run
set -e

cd "$(dirname "$0")"

echo "======================================================="
echo "  Direct Local Build & Run"
echo "======================================================="
echo ""

echo "[1/2] Installing dependencies..."
npm install

echo ""
echo "[2/2] Building project files..."
npm run build

echo ""
echo "[READY] Starting local server on http://localhost:3000..."
npm run dev
