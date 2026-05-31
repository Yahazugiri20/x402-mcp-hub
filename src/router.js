import axios from "axios";
import { services } from "./registry.js";

export function detectIntent(text = "") {
  const lower = text.toLowerCase();

  if (lower.includes("echo") || lower.includes("test http")) return "echo";
  if (lower.includes("summarize") || lower.includes("summary")) return "summarize";
  if (lower.includes("research") || lower.includes("docs") || lower.includes("search")) return "research";
  if (lower.includes("write") || lower.includes("tweet") || lower.includes("post")) return "write";
  if (lower.includes("scan") || lower.includes("analyze") || lower.includes("token")) return "scan";

  return "unknown";
}

async function isOnline(service) {
  try {
    const url = new URL(service.endpoint);
    const baseUrl = `${url.protocol}//${url.host}`;
    await axios.get(baseUrl, { timeout: 1500 });
    return true;
  } catch {
    return false;
  }
}

export async function chooseService(intent) {
  const candidates = services.filter(service =>
    service.tags.includes(intent)
  );

  if (!candidates.length) return null;

  const onlineCandidates = [];

  for (const service of candidates) {
    const online = await isOnline(service);
    if (online) onlineCandidates.push(service);
  }

  if (!onlineCandidates.length) return null;

  return onlineCandidates.sort((a, b) => {
    const scoreA = a.reputation - a.price * 100 - a.latency / 100;
    const scoreB = b.reputation - b.price * 100 - b.latency / 100;
    return scoreB - scoreA;
  })[0];
}
