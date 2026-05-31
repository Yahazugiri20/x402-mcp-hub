import fs from "fs";
import path from "path";
import axios from "axios";
import { registerService } from "./registry.js";

const filePath = path.join(process.cwd(), "data", "providers.json");

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
  }
}

export function getProviders() {
  ensureFile();
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveProviders(providers) {
  fs.writeFileSync(filePath, JSON.stringify(providers, null, 2));
}

export async function registerProvider(url) {
  ensureFile();

  const providers = getProviders();
  const cleanUrl = url.replace(/\/$/, "");

  let provider = providers.find(p => p.url === cleanUrl);

  if (!provider) {
    provider = {
      id: `provider-${providers.length + 1}`,
      url: cleanUrl,
      status: "unknown",
      lastSync: null,
      tools: []
    };

    providers.push(provider);
  }

  const imported = await importProviderTools(cleanUrl);

  provider.status = "online";
  provider.lastSync = new Date().toISOString();
  provider.tools = imported.map(tool => tool.id);

  saveProviders(providers);

  return {
    provider,
    imported
  };
}

export async function importProviderTools(url) {
  const cleanUrl = url.replace(/\/$/, "");
  const response = await axios.get(`${cleanUrl}/mcp/tools`);
  const data = response.data;

  const imported = [];

  for (const tool of data.tools || []) {
    const service = registerService({
      id: tool.id || `${data.provider}-${tool.name}`,
      type: tool.type,
      tags: tool.tags || [tool.name],
      price: Number(tool.price || 0),
      latency: Number(tool.latency || 300),
      reputation: Number(tool.reputation || 90),
      endpoint: tool.endpoint
    });

    imported.push(service);
  }

  return imported;
}
