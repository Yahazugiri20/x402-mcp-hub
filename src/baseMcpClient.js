import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export async function probeBaseMcp({ token = "" } = {}) {
  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const transport = new StreamableHTTPClientTransport(
    new URL("https://mcp.base.org"),
    {
      requestInit: {
        headers
      }
    }
  );

  const client = new Client({
    name: "x402-mcp-hub",
    version: "0.1.0"
  });

  await client.connect(transport);

  const tools = await client.listTools();

  await client.close();

  return tools;
}
