const express = require("express");
const router = express.Router();
const { runDijkstra, runAStar, runPrim } = require("../controllers/playground.controller");

router.post("/playground/dijkstra", runDijkstra);
router.post("/playground/a-star", runAStar);
router.post("/playground/prim", runPrim);

module.exports = router;
