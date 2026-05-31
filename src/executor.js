import axios from "axios";

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
        const paymentRequest = error.response.data;

        const paidResponse = await axios.post(
          service.endpoint,
          {
            input,
            calledBy: "x402-mcp-hub",
            serviceId: service.id
          },
          {
            headers: {
              "X-Payment": JSON.stringify({
                protocol: "x402",
                amount: paymentRequest.amount,
                asset: paymentRequest.asset,
                payTo: paymentRequest.payTo,
                network: paymentRequest.network,
                txHash: "0xsimulatedpayment"
              })
            }
          }
        );

        return {
          ok: true,
          service: service.id,
          payment: {
            required: true,
            protocol: "x402",
            amount: paymentRequest.amount,
            asset: paymentRequest.asset,
            network: paymentRequest.network,
            status: "paid_after_402_retry",
            txHash: "0xsimulatedpayment"
          },
          result: paidResponse.data.result,
          upstream: paidResponse.data
        };
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
