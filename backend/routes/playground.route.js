const express = require("express");
const router = express.Router();
const { runDijkstra, runAStar, runPrim, runBFS, runBellmanFord } = require("../controllers/playground.controller");

router.post("/playground/dijkstra", runDijkstra);
router.post("/playground/a-star", runAStar);
router.post("/playground/prim", runPrim);
router.post("/playground/bfs",runBFS)
router.post("/playground/bellman", runBellmanFord);

module.exports = router;
