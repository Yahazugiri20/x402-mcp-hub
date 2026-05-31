import { getLogs } from "./logs.js";
import { services } from "./registry.js";
import { getProviders } from "./providers.js";

export function getAnalytics() {
  const logs = getLogs();

  const totalInvocations = logs.length;
  const successfulInvocations = logs.filter(log => log.ok).length;
  const failedInvocations = totalInvocations - successfulInvocations;

  const paidLogs = logs.filter(log =>
    log.payment?.required &&
    log.payment?.status === "paid_with_x402_client"
  );

  const freeLogs = logs.filter(log =>
    log.payment?.required === false ||
    log.payment?.status === "free_service"
  );

  const serviceUsage = {};

  for (const log of logs) {
    if (!log.service) continue;

    if (!serviceUsage[log.service]) {
      serviceUsage[log.service] = {
        service: log.service,
        calls: 0,
        success: 0,
        failed: 0,
        paidCalls: 0
      };
    }

    serviceUsage[log.service].calls += 1;

    if (log.ok) {
      serviceUsage[log.service].success += 1;
    } else {
      serviceUsage[log.service].failed += 1;
    }

    if (log.payment?.status === "paid_with_x402_client") {
      serviceUsage[log.service].paidCalls += 1;
    }
  }

  return {
    totalProviders: getProviders().length,
    totalServices: services.length,
    totalInvocations,
    successfulInvocations,
    failedInvocations,
    paidInvocations: paidLogs.length,
    freeInvocations: freeLogs.length,
    serviceUsage: Object.values(serviceUsage)
  };
}
