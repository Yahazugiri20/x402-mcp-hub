import express from "express";
import cors from "cors";
import axios from "axios";
import { paymentMiddleware } from "x402-express";

const app = express();
app.use(cors());
app.use(express.json());

const PAY_TO = process.env.PAY_TO || "0x1111111111111111111111111111111111111111";

app.use(
  paymentMiddleware(
    PAY_TO,
    {
      "/summarize": {
        price: "$0.01",
        network: "base-sepolia",
        config: {
          description: "Summarize text or URLs through x402 payment"
        }
      },
      "/write-tweet": {
        price: "$0.005",
        network: "base-sepolia",
        config: {
          description: "Write a short social post through x402 payment"
        }
      }
    }
  )
);

async function registerToHub() {
  const services = [
    {
      id: "real-x402-summarizer",
      type: "x402",
      tags: ["summarize", "summary", "url", "article"],
      price: 0.01,
      latency: 180,
      reputation: 98,
      endpoint: "http://localhost:5000/summarize"
    },
    {
      id: "free-mcp-researcher",
      type: "mcp",
      tags: ["research", "search", "docs"],
      price: 0,
      latency: 260,
      reputation: 94,
      endpoint: "http://localhost:5000/research"
    },
    {
      id: "paid-x402-tweet-writer",
      type: "x402",
      tags: ["write", "tweet", "post", "content"],
      price: 0.005,
      latency: 220,
      reputation: 95,
      endpoint: "http://localhost:5000/write-tweet"
    }
  ];

  for (const service of services) {
    try {
      await axios.post("http://localhost:3001/services/register", service);
      console.log("registered to hub:", service.id);
    } catch (error) {
      console.log("hub registration failed:", service.id, error.message);
    }
  }
}

app.get("/", (req, res) => {
  res.json({
    name: "multi-tool x402 MCP provider",
    status: "online",
    payTo: PAY_TO,
    routes: ["/summarize", "/research", "/write-tweet", "/mcp/tools"]
  });
});

app.get("/mcp/tools", (req, res) => {
  res.json({
    provider: "multi-tool-x402-provider",
    tools: [
      {
        id: "real-x402-summarizer",
        name: "summarize",
        description: "Summarize a URL or text through real x402-express middleware",
        endpoint: "http://localhost:5000/summarize",
        type: "x402",
        price: 0.01,
        latency: 180,
        reputation: 98,
        tags: ["summarize", "summary", "url", "article"]
      },
      {
        id: "free-mcp-researcher",
        name: "research",
        description: "Research docs, links, or topics for an agent",
        endpoint: "http://localhost:5000/research",
        type: "mcp",
        price: 0,
        latency: 260,
        reputation: 94,
        tags: ["research", "search", "docs"]
      },
      {
        id: "paid-x402-tweet-writer",
        name: "write-tweet",
        description: "Write a short post through real x402-express middleware",
        endpoint: "http://localhost:5000/write-tweet",
        type: "x402",
        price: 0.005,
        latency: 220,
        reputation: 95,
        tags: ["write", "tweet", "post", "content"]
      }
    ]
  });
});

app.post("/summarize", (req, res) => {
  const { input } = req.body;

  res.json({
    ok: true,
    provider: "multi-tool-x402-provider",
    tool: "summarize",
    result: `summary: ${input} is a request routed through a paid x402 service.`
  });
});

app.post("/research", (req, res) => {
  const { input } = req.body;

  res.json({
    ok: true,
    provider: "multi-tool-x402-provider",
    tool: "research",
    result: `research brief: ${input} points to an agent workflow using MCP discovery, service routing, and optional x402 payment.`
  });
});

app.post("/write-tweet", (req, res) => {
  const { input } = req.body;

  res.json({
    ok: true,
    provider: "multi-tool-x402-provider",
    tool: "write-tweet",
    result: `built an x402 mcp hub where agents discover tools, pay for calls, and execute services from simple commands`
  });
});

app.listen(5000, async () => {
  console.log("multi-tool x402 provider running on http://localhost:5000");
  await registerToHub();
});
