import { services } from "./registry.js";

export function searchMarketplace(query = "") {
  const lower = query.toLowerCase();

  return services
    .filter(service => {
      return (
        service.id.toLowerCase().includes(lower) ||
        service.type.toLowerCase().includes(lower) ||
        service.tags.some(tag => tag.includes(lower))
      );
    })
    .sort((a, b) => b.reputation - a.reputation);
}
