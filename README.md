# x402 MCP Hub

A routing layer where AI agents can discover MCP servers and x402 services, select the best tool, handle payment-gated requests, and return results from a simple mention-style command.

## What it does

x402 MCP Hub lets an agent receive a command like:

@hub summarize https://example.com

Then it:

1. detects the intent
2. searches the service registry
3. selects the best MCP or x402 service
4. calls the provider
5. handles 402 payment required flow
6. retries with payment proof
7. returns the result

## Demo flow

User command:

@hub summarize https://example.com

Hub output:

- intent: summarize
- selected service: local-x402-summarizer
- payment: paid_after_402_retry
- network: base-sepolia
- result: paid provider summarized this request

## Run

Terminal 1:

npm run provider

Terminal 2:

npm run dev

Terminal 3:

curl -X POST http://localhost:3001/invoke \
-H "Content-Type: application/json" \
-d '{"text":"@hub summarize https://example.com"}'

## Core idea

Agents should not need to know every endpoint, API, MCP server, or payment flow.

They should just ask for a task.

The hub handles discovery, routing, payment, execution, and response.
