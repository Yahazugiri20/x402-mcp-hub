#!/bin/bash

echo ""
echo "x402 MCP Hub demo"
echo ""

echo "1. paid x402-style summarize call"
curl -s -X POST http://localhost:3001/invoke \
-H "Content-Type: application/json" \
-d '{"text":"@hub summarize https://example.com"}' | jq

echo ""
echo "2. free MCP-style research call"
curl -s -X POST http://localhost:3001/invoke \
-H "Content-Type: application/json" \
-d '{"text":"@hub research vvvkernel docs"}' | jq

echo ""
echo "3. marketplace search"
curl -s "http://localhost:3001/marketplace/search?q=mcp" | jq
