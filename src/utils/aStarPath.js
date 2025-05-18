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

// Heuristic = straight-line distance (same as haversine)
function heuristic(a, b) {
  return haversine(
    a.location.lat,
    a.location.lng,
    b.location.lat,
    b.location.lng
  );
}

// Reconstruct path from cameFrom map
function reconstructPath(cameFrom, current) {
  const totalPath = [current];
  while (cameFrom[current]) {
    current = cameFrom[current];
    totalPath.unshift(current);
  }
  return totalPath;
}

// A* pathfinding algorithm
export function aStarPath(hotels, startId, endId) {
  const nodes = {};
  const openSet = new Set();
  const cameFrom = {};
  const gScore = {};
  const fScore = {};

  // Initialize scores and hotel map
  hotels.forEach((hotel) => {
    nodes[hotel.id] = hotel;
    gScore[hotel.id] = Infinity;
    fScore[hotel.id] = Infinity;
  });

  gScore[startId] = 0;
  fScore[startId] = heuristic(nodes[startId], nodes[endId]);
  openSet.add(startId);

  while (openSet.size) {
    // Get node in openSet with lowest fScore
    let current = [...openSet].reduce((a, b) =>
      fScore[a] < fScore[b] ? a : b
    );

    if (current === endId) {
      return reconstructPath(cameFrom, current);
    }

    openSet.delete(current);

    for (const neighbor of hotels) {
      const neighborId = neighbor.id;
      if (neighborId === current) continue;

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
        fScore[neighborId] =
          tentativeG + heuristic(neighbor, nodes[endId]);
        openSet.add(neighborId);
      }
    }
  }

  // No path found
  return [];
}
