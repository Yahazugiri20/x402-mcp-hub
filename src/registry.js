import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "services.json");

function loadServices() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveServices() {
  fs.writeFileSync(filePath, JSON.stringify(services, null, 2));
}

export const services = loadServices();

export function registerService(service) {
  const exists = services.find(s => s.id === service.id);

  if (exists) {
    Object.assign(exists, service);
    saveServices();
    return exists;
  }

  services.push(service);
  saveServices();
  return service;
}
