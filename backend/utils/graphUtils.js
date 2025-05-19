// Haversine distance
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

// Build weighted graph from hotel list
function buildGraph(hotels, threshold = 50, mode = "car") {
  const graph = {};
  const speedMap = { car: 60, bus: 40, bike: 20 };
  const speed = speedMap[mode] || 60;

  for (let i = 0; i < hotels.length; i++) {
    const current = hotels[i];
    graph[current.id] = [];

    for (let j = 0; j < hotels.length; j++) {
      if (i === j) continue;

      const target = hotels[j];
      const dist = haversine(
        current.location.lat,
        current.location.lng,
        target.location.lat,
        target.location.lng
      );

      if (dist <= threshold) {
        const time = dist / speed; // edge weight based on travel time
        graph[current.id].push({ node: target.id, weight: time });
      }
    }
  }

  return graph;
}


// Dijkstra's Algorithm
function dijkstra(graph, start) {
  const distances = {};
  const prev = {};
  const visited = new Set();
  const queue = new Map();

  for (let node in graph) {
    distances[node] = Infinity;
    queue.set(node, Infinity);
  }

  distances[start] = 0;
  queue.set(start, 0);

  while (queue.size) {
    const current = [...queue.entries()].reduce((a, b) => (a[1] < b[1] ? a : b))[0];
    queue.delete(current);
    visited.add(current);

    for (let neighbor of graph[current] || []) {
      if (visited.has(neighbor.node)) continue;
      const alt = distances[current] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        prev[neighbor.node] = current;
        queue.set(neighbor.node, alt);
      }
    }
  }

  return { distances, prev };
}

// Reconstruct shortest path from Dijkstra
function reconstructPath(prev, start, end) {
  const path = [];
  let curr = end;
  while (curr !== undefined) {
    path.unshift(curr);
    if (curr === start) break;
    curr = prev[curr];
  }
  return path[0] === start ? path : [];
}

// A* Search Algorithm
function aStar(graph, start, end, coords) {
  const openSet = new Set([start]);
  const cameFrom = {};
  const gScore = {};
  const fScore = {};

  for (const node in graph) {
    gScore[node] = Infinity;
    fScore[node] = Infinity;
  }

  gScore[start] = 0;
  fScore[start] = haversine(
    coords[start].lat, coords[start].lng,
    coords[end].lat, coords[end].lng
  );

  while (openSet.size) {
    let current = [...openSet].reduce((a, b) => fScore[a] < fScore[b] ? a : b);

    if (current === end) {
      const path = [];
      while (current) {
        path.unshift(current);
        current = cameFrom[current];
      }
      return { path, totalDistance: gScore[end] };
    }

    openSet.delete(current);

    for (let neighbor of graph[current]) {
      const tentativeG = gScore[current] + neighbor.weight;
      if (tentativeG < gScore[neighbor.node]) {
        cameFrom[neighbor.node] = current;
        gScore[neighbor.node] = tentativeG;
        fScore[neighbor.node] = tentativeG + haversine(
          coords[neighbor.node].lat, coords[neighbor.node].lng,
          coords[end].lat, coords[end].lng
        );
        openSet.add(neighbor.node);
      }
    }
  }

  return { path: [], totalDistance: 0 };
}

// Prim’s MST
function primMST(hotels) {
  const graph = buildGraph(hotels, Infinity); // connect all nodes
  const visited = new Set();
  const mst = [];
  let totalDistance = 0;

  const start = hotels[0].id;
  const edges = [...(graph[start] || []).map(e => ({ ...e, from: start }))];
  visited.add(start);

  while (edges.length) {
    edges.sort((a, b) => a.weight - b.weight);
    const edge = edges.shift();

    if (visited.has(edge.node)) continue;

    visited.add(edge.node);
    mst.push({ from: edge.from, to: edge.node, weight: edge.weight });
    totalDistance += edge.weight;

    for (const next of graph[edge.node] || []) {
      if (!visited.has(next.node)) {
        edges.push({ ...next, from: edge.node });
      }
    }
  }

  return { mst, totalDistance };
}

// BFS Algorithm
function bfs(graph, start, end) {
  const visited = new Set();
  const queue = [[start]];

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];

    if (node === end) return path;

    if (!visited.has(node)) {
      visited.add(node);
      const neighbors = graph[node] || [];

      for (const neighbor of neighbors) {
        const neighborId = typeof neighbor === 'object' ? neighbor.node : neighbor;
        if (!visited.has(neighborId)) {
          queue.push([...path, neighborId]);
        }
      }
    }
  }

  return null;
}

function bellmanFord(graph, start) {
  const distances = {};
  const prev = {};

  for (let node in graph) {
    distances[node] = Infinity;
    prev[node] = null;
  }
  distances[start] = 0;

  const nodes = Object.keys(graph);
  const edges = [];

  for (const u of nodes) {
    for (const { node: v, weight } of graph[u]) {
      edges.push({ from: u, to: v, weight });
    }
  }

  const V = nodes.length;

  // Relax edges V-1 times
  for (let i = 0; i < V - 1; i++) {
    for (const edge of edges) {
      const { from, to, weight } = edge;
      if (distances[from] + weight < distances[to]) {
        distances[to] = distances[from] + weight;
        prev[to] = from;
      }
    }
  }

  // Detect negative cycles (optional)
  for (const edge of edges) {
    const { from, to, weight } = edge;
    if (distances[from] + weight < distances[to]) {
      return { distances: null, prev: null, negativeCycle: true };
    }
  }

  return { distances, prev, negativeCycle: false };
}

module.exports = {
  buildGraph,
  haversine,
  dijkstra,
  reconstructPath,
  primMST,
  aStar,
  bfs,
  bellmanFord
};