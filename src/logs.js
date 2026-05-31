import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "logs.json");

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
  }
}

function loadLogs() {
  ensureFile();
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveLogs(logs) {
  fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
}

export function addLog(entry) {
  const logs = loadLogs();

  const log = {
    id: logs.length + 1,
    time: new Date().toISOString(),
    ...entry
  };

  logs.push(log);
  saveLogs(logs);

  return log;
}

export function getLogs() {
  return loadLogs();
}
