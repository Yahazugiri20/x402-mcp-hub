#!/bin/bash

echo "starting x402 mcp hub stack..."

pkill -f "node src/provider.js" 2>/dev/null
pkill -f "node src/index.js" 2>/dev/null

npm run dev > hub.log 2>&1 &
HUB_PID=$!

sleep 2

npm run provider > provider.log 2>&1 &
PROVIDER_PID=$!

sleep 2

echo ""
echo "hub pid: $HUB_PID"
echo "provider pid: $PROVIDER_PID"
echo ""
echo "hub: http://localhost:3001"
echo "provider: http://localhost:4001"
echo ""
echo "testing demo..."
echo ""

./demo.sh
