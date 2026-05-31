export function scoreService(service) {
  const reputationScore = service.reputation || 0;
  const latencyPenalty = (service.latency || 500) / 50;
  const pricePenalty = Number(service.price || 0) * 500;

  return Number((reputationScore - latencyPenalty - pricePenalty).toFixed(2));
}

export function rankServices(services) {
  return services
    .map(service => ({
      ...service,
      score: scoreService(service)
    }))
    .sort((a, b) => b.score - a.score);
}
