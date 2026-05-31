#!/bin/bash

echo "starting x402 MCP Hub product stack..."

pkill -f "node src/index.js" 2>/dev/null
pkill -f "node src/provider-x402.js" 2>/dev/null
pkill -f vite 2>/dev/null

npm run dev > hub.log 2>&1 &
sleep 2

npm run provider:x402 > provider-x402.log 2>&1 &
sleep 2

npm run web > web.log 2>&1 &
sleep 2

echo ""
echo "hub:      http://localhost:3001"
echo "provider: http://localhost:5000"
echo "web:      http://localhost:5173"
echo ""
echo "ready."
