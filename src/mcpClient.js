import axios from "axios";

export async function mcpPost(endpoint, payload, token = "") {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post(endpoint, payload, {
    headers,
    timeout: 10000
  });

  return response.data;
}

export async function probeMcpServer(endpoint, token = "") {
  const init = await mcpPost(endpoint, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-03-26",
      capabilities: { tools: {} },
      clientInfo: {
        name: "x402-mcp-hub",
        version: "0.1.0"
      }
    }
  }, token);

  try {
    await mcpPost(endpoint, {
      jsonrpc: "2.0",
      method: "notifications/initialized"
    }, token);
  } catch {}

  const tools = await mcpPost(endpoint, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  }, token);

  return {
    initialize: init,
    tools
  };
}
