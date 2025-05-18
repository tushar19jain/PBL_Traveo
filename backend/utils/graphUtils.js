// Haversine formula to calculate distance between lat/lng coordinates
const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in KM
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
  
  // Convert hotel data to graph
  const buildGraph = (hotels) => {
    const graph = {};
  
    hotels.forEach(h1 => {
      if (!h1.location || h1.location.lat == null || h1.location.lng == null) return;
  
      graph[h1.id] = [];
  
      hotels.forEach(h2 => {
        if (
          h1.id !== h2.id &&
          h2.location &&
          h2.location.lat != null &&
          h2.location.lng != null
        ) {
          const distance = haversine(
            h1.location.lat,
            h1.location.lng,
            h2.location.lat,
            h2.location.lng
          );
  
          graph[h1.id].push({ to: h2.id, weight: distance });
        }
      });
    });
  
    return graph;
  };
  
  
  const primMST = (hotels) => {
    const nodes = hotels.map((h) => h.id);
    const edges = [];
  
    // Create all pairwise edges with distances
    for (let i = 0; i < hotels.length; i++) {
      for (let j = i + 1; j < hotels.length; j++) {
        const dist = haversine(
          hotels[i].location.lat,
          hotels[i].location.lng,
          hotels[j].location.lat,
          hotels[j].location.lng
        );
        edges.push({
          from: hotels[i].id,
          to: hotels[j].id,
          weight: dist,
        });
      }
    }
  
    // Kruskal-style edge selection with visited set
    const mst = [];
    const visited = new Set();
    visited.add(nodes[0]);
  
    while (mst.length < nodes.length - 1) {
      let smallest = null;
  
      for (let edge of edges) {
        if (
          (visited.has(edge.from) && !visited.has(edge.to)) ||
          (visited.has(edge.to) && !visited.has(edge.from))
        ) {
          if (!smallest || edge.weight < smallest.weight) {
            smallest = edge;
          }
        }
      }
  
      if (smallest) {
        mst.push(smallest);
        visited.add(smallest.from);
        visited.add(smallest.to);
      } else {
        break;
      }
    }
  
    const totalDistance = mst.reduce((acc, e) => acc + e.weight, 0);
    return { mst, totalDistance };
  };
  
  const aStar = (graph, start, goal, coordinatesMap) => {
    const heuristic = (a, b) => {
      const p1 = coordinatesMap[a];
      const p2 = coordinatesMap[b];
      return haversine(p1.lat, p1.lng, p2.lat, p2.lng);
    };
  
    const openSet = new Set([start]);
    const cameFrom = {};
    const gScore = {};
    const fScore = {};
  
    for (let node in graph) {
      gScore[node] = Infinity;
      fScore[node] = Infinity;
    }
  
    gScore[start] = 0;
    fScore[start] = heuristic(start, goal);
  
    while (openSet.size > 0) {
      let current = [...openSet].reduce((a, b) =>
        fScore[a] < fScore[b] ? a : b
      );
  
      if (current === goal) {
        const path = [];
        while (current) {
          path.unshift(current);
          current = cameFrom[current];
        }
        return { path, totalDistance: gScore[goal] };
      }
  
      openSet.delete(current);
      for (let neighbor of graph[current]) {
        const tentativeG = gScore[current] + neighbor.weight;
        if (tentativeG < gScore[neighbor.to]) {
          cameFrom[neighbor.to] = current;
          gScore[neighbor.to] = tentativeG;
          fScore[neighbor.to] =
            gScore[neighbor.to] + heuristic(neighbor.to, goal);
          openSet.add(neighbor.to);
        }
      }
    }
  
    return { path: [], totalDistance: 0 };
  };
  

  // Dijkstra's Algorithm
  const dijkstra = (graph, start) => {
    const distances = {};
    const visited = {};
    const prev = {};
    const queue = [{ node: start, dist: 0 }];
  
    for (let node in graph) {
      distances[node] = Infinity;
    }
    distances[start] = 0;
  
    while (queue.length) {
      queue.sort((a, b) => a.dist - b.dist);
      const { node } = queue.shift();
  
      if (visited[node]) continue;
      visited[node] = true;
  
      for (let neighbor of graph[node]) {
        const alt = distances[node] + neighbor.weight;
        if (alt < distances[neighbor.to]) {
          distances[neighbor.to] = alt;
          prev[neighbor.to] = node;
          queue.push({ node: neighbor.to, dist: alt });
        }
      }
    }
  
    return { distances, prev };
  };
  
  // Build full path
  const reconstructPath = (prev, start, end) => {
    const path = [];
    let current = end;
  
    while (current && current !== start) {
      path.unshift(current);
      current = prev[current];
    }
  
    if (current) path.unshift(current);
    return path;
  };
  
  module.exports = {
    buildGraph,
    dijkstra,
    reconstructPath,
    aStar,
    primMST,
  };
  