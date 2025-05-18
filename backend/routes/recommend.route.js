const express = require("express");
const router = express.Router();
const { getRecommendations } = require("../controllers/recommend.controller");

router.post("/recommendations", getRecommendations);

module.exports = router;
