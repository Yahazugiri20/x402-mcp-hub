import axios from "axios";
import { createX402PaymentHeader } from "./x402PayClient.js";

export async function executeService(service, input) {
  if (!service) {
    return {
      ok: false,
      error: "no matching MCP, HTTP, or x402 service found"
    };
  }

  const payment = service.type === "x402" || service.price > 0
    ? {
        required: true,
        protocol: "x402",
        amount: service.price,
        asset: "USDC",
        status: "not_paid_yet"
      }
    : {
        required: false,
        status: "free_service"
      };

  if (service.endpoint.startsWith("http")) {
    try {
      const response = await axios.post(service.endpoint, {
        input,
        calledBy: "x402-mcp-hub",
        serviceId: service.id
      });

      return {
        ok: true,
        service: service.id,
        payment,
        result: response.data.result || "real service called successfully",
        upstream: response.data
      };
    } catch (error) {
      if (error.response && error.response.status === 402) {
        const paymentRequirements = error.response.data;

        if (!process.env.PRIVATE_KEY) {
          return {
            ok: false,
            service: service.id,
            payment: {
              required: true,
              protocol: "x402",
              status: "payment_required",
              requirements: paymentRequirements
            },
            error: "x402 payment required, but PRIVATE_KEY is missing"
          };
        }

        try {
          const paymentHeader = await createX402PaymentHeader(paymentRequirements);

          const paidResponse = await axios.post(
            service.endpoint,
            {
              input,
              calledBy: "x402-mcp-hub",
              serviceId: service.id
            },
            {
              headers: {
                "Content-Type": "application/json",
                "X-PAYMENT": paymentHeader
              }
            }
          );

          return {
            ok: true,
            service: service.id,
            payment: {
              required: true,
              protocol: "x402",
              status: "paid_with_x402_client",
              response: paidResponse.headers["x-payment-response"] || null
            },
            result: paidResponse.data.result,
            upstream: paidResponse.data
          };
        } catch (paymentError) {
          return {
            ok: false,
            service: service.id,
            payment: {
              required: true,
              protocol: "x402",
              status: "payment_attempt_failed",
              requirements: paymentRequirements
            },
            error: paymentError.message
          };
        }
      }

      return {
        ok: false,
        service: service.id,
        payment,
        error: error.message
      };
    }
  }

  if (service.endpoint === "mock://crypto") {
    return {
      ok: true,
      service: service.id,
      payment,
      result: `base token analysis generated for: ${input}`
    };
  }

  return {
    ok: false,
    error: "executor not implemented"
  };
}
