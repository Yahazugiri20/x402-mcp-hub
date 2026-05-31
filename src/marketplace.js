import { services } from "./registry.js";
import { rankServices } from "./scoring.js";

export function searchMarketplace(query = "") {
  const lower = query.toLowerCase();

  const results = services
    .filter(service => {
      return (
        service.id.toLowerCase().includes(lower) ||
        service.type.toLowerCase().includes(lower) ||
        service.tags.some(tag => tag.includes(lower))
      );
    })
    ;

  return rankServices(results);
}
