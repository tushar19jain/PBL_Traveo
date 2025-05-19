// src/utils/aStarPath.js

// Haversine distance in kilometers
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

function heuristic(a, b) {
  return haversine(a.location.lat, a.location.lng, b.location.lat, b.location.lng);
}

function reconstructPath(cameFrom, current) {
  const totalPath = [current];
  while (cameFrom[current]) {
    current = cameFrom[current];
    totalPath.unshift(current);
  }
  return totalPath;
}

export function aStarPath(hotels, graph, startId, endId) {
  const nodes = {};
  const openSet = new Set();
  const cameFrom = {};
  const gScore = {};
  const fScore = {};

  hotels.forEach((hotel) => {
    nodes[hotel.id] = hotel;
    gScore[hotel.id] = Infinity;
    fScore[hotel.id] = Infinity;
  });

  gScore[startId] = 0;
  fScore[startId] = heuristic(nodes[startId], nodes[endId]);
  openSet.add(startId);

  let loopCount = 0;

  while (openSet.size && loopCount++ < 10000) {
    let current = [...openSet].reduce((a, b) => fScore[a] < fScore[b] ? a : b);

    if (current === endId) {
      return reconstructPath(cameFrom, current);
    }

    openSet.delete(current);

    const neighbors = graph[current] || [];

    for (const neighborId of neighbors) {
      const neighbor = nodes[neighborId];
      if (!neighbor) continue;

      const dist = haversine(
        nodes[current].location.lat,
        nodes[current].location.lng,
        neighbor.location.lat,
        neighbor.location.lng
      );

      const tentativeG = gScore[current] + dist;

      if (tentativeG < gScore[neighborId]) {
        cameFrom[neighborId] = current;
        gScore[neighborId] = tentativeG;
        fScore[neighborId] = tentativeG + heuristic(neighbor, nodes[endId]);
        openSet.add(neighborId);
      }
    }
  }

  console.warn("A* exited due to loop limit or no path found");
  return [];
}
