// Prim's Minimum Spanning Tree Algorithm for hotels
export function primMST(hotels) {
    const n = hotels.length;
    const visited = Array(n).fill(false);
    const parent = Array(n).fill(null);
    const key = Array(n).fill(Infinity);
    const mstEdges = [];
  
    key[0] = 0; // Start from the first hotel
  
    for (let count = 0; count < n - 1; count++) {
      let u = -1;
  
      for (let i = 0; i < n; i++) {
        if (!visited[i] && (u === -1 || key[i] < key[u])) {
          u = i;
        }
      }
  
      if (u === -1) break; // no connected node found
  
      visited[u] = true;
  
      for (let v = 0; v < n; v++) {
        if (!visited[v] && u !== v) {
          const dist = haversine(
            hotels[u].location.lat,
            hotels[u].location.lng,
            hotels[v].location.lat,
            hotels[v].location.lng
          );
  
          if (dist < key[v]) {
            key[v] = dist;
            parent[v] = u;
          }
        }
      }
    }
  
    let totalCost = 0;
  
    for (let i = 1; i < n; i++) {
      if (parent[i] !== null) {
        const from = parent[i];
        const to = i;
        const dist = haversine(
          hotels[from].location.lat,
          hotels[from].location.lng,
          hotels[to].location.lat,
          hotels[to].location.lng
        );
        totalCost += dist;
        mstEdges.push({ from, to, distance: dist });
      }
    }
  
    return { mstEdges, totalCost };
  }
  
  // Haversine distance in km between two lat/lng points
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  