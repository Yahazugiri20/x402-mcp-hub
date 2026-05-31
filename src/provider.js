import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

function requireX402(req, res, next) {
  const paymentHeader = req.headers["x-payment"];

  if (!paymentHeader) {
    return res.status(402).json({
      error: "payment required",
      protocol: "x402",
      amount: 0.01,
      asset: "USDC",
      payTo: "0xYourWalletAddress",
      network: "base-sepolia"
    });
  }

  next();
}

async function registerToHub() {
  const services = [
    {
      id: "auto-x402-summarizer",
      type: "x402",
      tags: ["summarize", "summary", "url", "article"],
      price: 0.01,
      latency: 180,
      reputation: 97,
      endpoint: "http://localhost:4001/summarize"
    },
    {
      id: "auto-mcp-researcher",
      type: "mcp",
      tags: ["research", "search", "docs"],
      price: 0,
      latency: 320,
      reputation: 93,
      endpoint: "http://localhost:4001/research"
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
    name: "sample x402 MCP provider",
    status: "online",
    routes: ["/summarize", "/research"]
  });
});

app.post("/summarize", requireX402, (req, res) => {
  const { input } = req.body;

  res.json({
    ok: true,
    provider: "auto-x402-provider",
    tool: "summarize",
    paymentVerified: true,
    result: `paid provider summarized this request: ${input}`
  });
});

app.post("/research", (req, res) => {
  const { input } = req.body;

  res.json({
    ok: true,
    provider: "auto-mcp-provider",
    tool: "research",
    result: `free provider researched this request: ${input}`
  });
});

app.listen(4001, async () => {
  console.log("provider running on http://localhost:4001");
  await registerToHub();
});
