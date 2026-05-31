import axios from "axios";
import { services } from "./registry.js";
import { rankServices } from "./scoring.js";

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
    if (!service.endpoint.startsWith("http")) return true;

    const url = new URL(service.endpoint);
    const baseUrl = `${url.protocol}//${url.host}`;
    await axios.get(baseUrl, { timeout: 1500 });
    return true;
  } catch {
    return false;
  }
}

export async function getCandidateServices(intent) {
  const candidates = services.filter(service =>
    service.tags.includes(intent)
  );

  const onlineCandidates = [];

  for (const service of candidates) {
    const online = await isOnline(service);
    if (online) onlineCandidates.push(service);
  }

  return rankServices(onlineCandidates);
}

export async function chooseService(intent) {
  const ranked = await getCandidateServices(intent);
  return ranked[0] || null;
}
