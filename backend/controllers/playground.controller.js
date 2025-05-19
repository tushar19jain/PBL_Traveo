const {
  buildGraph,
  dijkstra,
  reconstructPath,
  primMST,
  aStar,
  bfs,
  bellmanFord
} = require("../utils/graphUtils");

const haversine = (lat1, lon1, lat2, lon2) => {
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
};

// ✅ Dijkstra
const runDijkstra = (req, res) => {
  const { from, to, hotels, mode = "car" } = req.body;
  const graph = buildGraph(hotels, 50, mode); // Pass travel mode
  const { distances, prev } = dijkstra(graph, from);
  const path = reconstructPath(prev, from, to);

  if (!path.length) {
    return res.status(404).json({ message: "No path found", path: [] });
  }

  res.json({ path, totalDistance: distances[to] || 0 });
};


// ✅ A*
const runAStar = (req, res) => {
  const { from, to, hotels } = req.body;
  const graph = buildGraph(hotels, 50); // 👈 updated threshold
  const coords = {};
  hotels.forEach(h => coords[h.id] = h.location);
  const { path, totalDistance } = aStar(graph, from, to, coords);
  res.json({ path, totalDistance });
};

// ✅ Prim's MST (returns edge objects)
const runPrim = (req, res) => {
  const { hotels } = req.body;
  const { mst, totalDistance } = primMST(hotels); // connects all, no threshold needed
  res.json({ path: mst, totalDistance });
};

// ✅ BFS
const runBFS = (req, res) => {
  const { from, to, hotels } = req.body;
  const graph = buildGraph(hotels, 50); // 👈 updated threshold
  const path = bfs(graph, from, to);

  if (!path || path.length === 0) {
    return res.status(404).json({ message: "No path found.", path: [] });
  }

  const getHotelById = id => hotels.find(h => h.id === id);
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const h1 = getHotelById(path[i]);
    const h2 = getHotelById(path[i + 1]);
    if (!h1 || !h2) continue;
    totalDistance += haversine(h1.location.lat, h1.location.lng, h2.location.lat, h2.location.lng);
  }

  res.json({ path, totalDistance });
};

// ✅ Bellman-Ford
const runBellmanFord = (req, res) => {
  const { from, to, hotels } = req.body;
  const graph = buildGraph(hotels, 50); // 👈 updated threshold

  const { distances, prev, negativeCycle } = bellmanFord(graph, from);

  if (negativeCycle) {
    return res.status(400).json({ message: "Graph contains a negative weight cycle." });
  }

  const path = reconstructPath(prev, from, to);
  res.json({ path, totalDistance: distances[to] || 0 });
};

module.exports = {
  runDijkstra,
  runPrim,
  runAStar,
  runBFS,
  runBellmanFord
};
