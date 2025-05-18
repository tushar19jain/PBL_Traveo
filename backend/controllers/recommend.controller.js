const recommendEngine = require("../utils/recommendEngine");

const getRecommendations = async (req, res) => {
  const {
    lat,
    lng,
    preference = "budget",
    roomType = "any",
    features = { wifi: false, breakfast: false, pool: false }
  } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Latitude and longitude are required" });
  }

  try {
    const results = await recommendEngine(lat, lng, preference, roomType, features);
    res.json({ recommended: results });
  } catch (err) {
    console.error("Recommendation error:", err.message);
    res.status(500).json({ message: "Failed to get recommendations" });
  }
};

module.exports = { getRecommendations };
