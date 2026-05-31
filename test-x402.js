import express from "express";
import { paymentMiddleware } from "x402-express";

const app = express();

app.use(
  paymentMiddleware(
    "0x1111111111111111111111111111111111111111",
    {
      "/premium": {
        price: "$0.01",
        network: "base-sepolia"
      }
    }
  )
);

app.get("/premium", (req, res) => {
  res.json({
    ok: true,
    message: "real x402 protected endpoint"
  });
});

app.listen(5000, () => {
  console.log("x402 test server on http://localhost:5000");
});
