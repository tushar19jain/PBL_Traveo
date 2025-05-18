const express = require("express");
const router = express.Router();

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildGraph(userLocation, hotels) {
  const graph = { user: [] };
  hotels.forEach((hotel) => {
    const dist = haversine(
      userLocation.lat,
      userLocation.lng,
      hotel.location.lat,
      hotel.location.lng
    );
    graph.user.push({ to: hotel.id, weight: dist });
    graph[hotel.id] = [];
  });
  return graph;
}

function dijkstra(graph, start) {
  const distances = {};
  const visited = {};
  const queue = [{ node: start, dist: 0 }];

  for (let node in graph) distances[node] = Infinity;
  distances[start] = 0;

  while (queue.length) {
    queue.sort((a, b) => a.dist - b.dist);
    const { node } = queue.shift();
    if (visited[node]) continue;
    visited[node] = true;

    graph[node].forEach(({ to, weight }) => {
      const newDist = distances[node] + weight;
      if (newDist < distances[to]) {
        distances[to] = newDist;
        queue.push({ node: to, dist: newDist });
      }
    });
  }

  return distances;
}

router.post("/shortest-path", (req, res) => {
  const { userLocation, hotels } = req.body;

  const graph = buildGraph(userLocation, hotels);
  const distances = dijkstra(graph, "user");

  const sorted = hotels
    .map((hotel) => ({
      ...hotel,
      distance: distances[hotel.id] || Infinity,
    }))
    .sort((a, b) => a.distance - b.distance);

  res.json({ hotels: sorted });
});

module.exports = router;
