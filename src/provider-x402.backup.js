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
      }
    }
  )
);

async function registerToHub() {
  const service = {
    id: "real-x402-summarizer",
    type: "x402",
    tags: ["summarize", "summary", "url", "article"],
    price: 0.01,
    latency: 180,
    reputation: 98,
    endpoint: "http://localhost:5000/summarize"
  };

  try {
    await axios.post("http://localhost:3001/services/register", service);
    console.log("registered to hub:", service.id);
  } catch (error) {
    console.log("hub registration failed:", error.message);
  }
}

app.get("/", (req, res) => {
  res.json({
    name: "real x402 provider",
    status: "online",
    payTo: PAY_TO,
    routes: ["/summarize"]
  });
});

app.get("/mcp/tools", (req, res) => {
  res.json({
    provider: "real-x402-provider",
    tools: [
      {
        name: "summarize",
        description: "Summarize a URL or text through real x402-express middleware",
        endpoint: "http://localhost:5000/summarize",
        type: "x402",
        price: 0.01,
        tags: ["summarize", "summary", "url", "article"]
      }
    ]
  });
});

app.post("/summarize", (req, res) => {
  const { input } = req.body;

  res.json({
    ok: true,
    provider: "real-x402-provider",
    tool: "summarize",
    result: `real x402 protected summarizer received: ${input}`
  });
});

app.listen(5000, async () => {
  console.log("real x402 provider running on http://localhost:5000");
  await registerToHub();
});
