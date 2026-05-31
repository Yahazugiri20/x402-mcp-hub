import axios from "axios";

export async function checkServiceHealth(service) {
  try {
    const url = new URL(service.endpoint);
    const baseUrl = `${url.protocol}//${url.host}`;

    const start = Date.now();
    await axios.get(baseUrl, { timeout: 3000 });
    const latencyMs = Date.now() - start;

    return {
      id: service.id,
      ok: true,
      status: "online",
      latencyMs
    };
  } catch (error) {
    return {
      id: service.id,
      ok: false,
      status: "offline",
      error: error.message
    };
  }
}
