export const executionLogs = [];

export function addLog(entry) {
  const log = {
    id: executionLogs.length + 1,
    time: new Date().toISOString(),
    ...entry
  };

  executionLogs.push(log);
  return log;
}

export function getLogs() {
  return executionLogs;
}
