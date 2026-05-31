import express from "express";
import cors from "cors";
import { services, registerService } from "./registry.js";
import { detectIntent, chooseService } from "./router.js";
import { executeService } from "./executor.js";
import { searchMarketplace } from "./marketplace.js";
import { addLog, getLogs } from "./logs.js";
import { checkServiceHealth } from "./health.js";
import { probeMcpServer } from "./mcpClient.js";
import { registerProvider, getProviders, syncProviders } from "./providers.js";
import { rankServices } from "./scoring.js";
import { getAnalytics } from "./analytics.js";

const app = express();
app.use(cors());
app.use(express.json());

const mentions = [];

app.get("/", (req, res) => {
  res.json({
    name: "x402 MCP Hub",
    status: "online",
    idea: "agents discover MCP servers and invoke x402 services through one routing layer",
    routes: ["/services", "/marketplace/search", "/invoke", "/x/mention", "/x/mentions", "/logs"]
  });
});


app.post("/mcp/probe", async (req, res) => {
  const endpoint = req.body.endpoint;

  if (!endpoint) {
    return res.status(400).json({
      ok: false,
      error: "endpoint is required"
    });
  }

  try {
    const token = req.body.token || "";
    const result = await probeMcpServer(endpoint, token);
    res.json({
      ok: true,
      endpoint,
      result
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      endpoint,
      error: error.response?.data || error.message
    });
  }
});


app.get("/providers", (req, res) => {
  res.json({ providers: getProviders() });
});


app.post("/providers/sync", async (req, res) => {
  try {
    const results = await syncProviders();
    res.json({
      ok: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.post("/providers/register", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      ok: false,
      error: "url is required"
    });
  }

  try {
    const result = await registerProvider(url);
    res.json({
      ok: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.get("/services", (req, res) => {
  res.json({ services: rankServices(services) });
});



app.get("/services/:id", (req, res) => {
  const service = services.find(s => s.id === req.params.id);

  if (!service) {
    return res.status(404).json({
      ok: false,
      error: "service not found"
    });
  }

  const ranked = rankServices([service])[0];

  res.json({
    ok: true,
    service: ranked
  });
});

app.post("/services/register", (req, res) => {
  const service = req.body;

  if (!service.id || !service.type || !service.endpoint || !Array.isArray(service.tags)) {
    return res.status(400).json({
      ok: false,
      error: "service must include id, type, endpoint, and tags array"
    });
  }

  const registered = registerService({
    id: service.id,
    type: service.type,
    tags: service.tags,
    price: Number(service.price || 0),
    latency: Number(service.latency || 500),
    reputation: Number(service.reputation || 80),
    endpoint: service.endpoint
  });

  res.json({
    ok: true,
    registered
  });
});


app.get("/marketplace/search", (req, res) => {
  const query = req.query.q || "";
  const results = searchMarketplace(query);
  res.json({ query, results });
});

app.post("/invoke", async (req, res) => {
  const text = req.body.text || "";

  const intent = detectIntent(text);
  const selectedService = await chooseService(intent);
  const execution = await executeService(selectedService, text);

  const log = addLog({
    source: "api",
    input: text,
    intent,
    service: selectedService?.id || null,
    serviceType: selectedService?.type || null,
    payment: execution.payment || null,
    ok: execution.ok,
    result: execution.result || execution.error
  });

  res.json({
    input: text,
    detectedIntent: intent,
    selectedService,
    execution,
    logId: log.id
  });
});

app.post("/x/mention", async (req, res) => {
  const text = req.body.text || "";
  const intent = detectIntent(text);
  const selectedService = await chooseService(intent);
  const execution = await executeService(selectedService, text);

  const mention = {
    id: mentions.length + 1,
    source: "fake_x",
    text,
    intent,
    selectedService,
    execution,
    reply: execution.ok
      ? `@user ${execution.result}`
      : `@user sorry, no matching service found`
  };

  mentions.push(mention);

  const log = addLog({
    source: "fake_x",
    input: text,
    intent,
    service: selectedService?.id || null,
    serviceType: selectedService?.type || null,
    payment: execution.payment || null,
    ok: execution.ok,
    result: execution.result || execution.error,
    reply: mention.reply
  });

  res.json({ ...mention, logId: log.id });
});

app.get("/x/mentions", (req, res) => {
  res.json({ mentions });
});


app.get("/analytics", (req, res) => {
  res.json({
    ok: true,
    analytics: getAnalytics()
  });
});

app.get("/logs", (req, res) => {
  res.json({ logs: getLogs() });
});


app.post("/providers/import-tools", async (req, res) => {
  const providerUrl = req.body.providerUrl;

  if (!providerUrl) {
    return res.status(400).json({
      ok: false,
      error: "providerUrl is required"
    });
  }

  try {
    const response = await fetch(`${providerUrl}/mcp/tools`);
    const data = await response.json();

    const imported = [];

    for (const tool of data.tools || []) {
      const service = registerService({
        id: `${data.provider}-${tool.name}`,
        type: tool.type,
        tags: tool.tags || [tool.name],
        price: Number(tool.price || 0),
        latency: 300,
        reputation: 90,
        endpoint: tool.endpoint
      });

      imported.push(service);
    }

    res.json({
      ok: true,
      provider: data.provider,
      imported
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});




app.post("/providers/import-tools", async (req, res) => {
  const providerUrl = req.body.providerUrl;

  if (!providerUrl) {
    return res.status(400).json({
      ok: false,
      error: "providerUrl is required"
    });
  }

  try {
    const response = await fetch(`${providerUrl}/mcp/tools`);
    const data = await response.json();

    const imported = [];

    for (const tool of data.tools || []) {
      const service = registerService({
        id: `${data.provider}-${tool.name}`,
        type: tool.type,
        tags: tool.tags || [tool.name],
        price: Number(tool.price || 0),
        latency: 300,
        reputation: 90,
        endpoint: tool.endpoint
      });

      imported.push(service);
    }

    res.json({
      ok: true,
      provider: data.provider,
      imported
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.get("/health/services", async (req, res) => {
  const results = [];

  for (const service of services) {
    results.push(await checkServiceHealth(service));
  }

  res.json({ results });
});


app.listen(3001, () => {
  console.log("");
  console.log("x402 MCP Hub running");
  console.log("API: http://localhost:3001");
  console.log("");
});
