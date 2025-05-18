const {
    buildGraph,
    dijkstra,
    reconstructPath,
    primMST,
    aStar
  } = require("../utils/graphUtils");
  
  const runDijkstra = (req, res) => {
    const { from, to, hotels } = req.body;
    const graph = buildGraph(hotels);
    const { distances, prev } = dijkstra(graph, from);
    const path = reconstructPath(prev, from, to);
    res.json({ path, totalDistance: distances[to] || 0 });
  };
  
  const runPrim = (req, res) => {
    const { hotels } = req.body;
    const { mst, totalDistance } = primMST(hotels);
    res.json({ path: mst, totalDistance });
  };
  
  const runAStar = (req, res) => {
    const { from, to, hotels } = req.body;
    const graph = buildGraph(hotels);
  
    const coords = {};
    hotels.forEach((h) => {
      coords[h.id] = h.location;
    });
  
    const { path, totalDistance } = aStar(graph, from, to, coords);
    res.json({ path, totalDistance });
  };
  
  module.exports = { runDijkstra, runPrim, runAStar };
  