const axios = require("axios");

const fallbackImages = [
  "https://source.unsplash.com/400x300/?hotel",
  "https://source.unsplash.com/400x300/?room",
  "https://source.unsplash.com/400x300/?resort",
  "https://source.unsplash.com/400x300/?apartment",
  "https://source.unsplash.com/400x300/?hostel",
];

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

const recommendEngine = async (lat, lng, preference, roomType, features) => {
  const response = await axios.get("https://api.foursquare.com/v3/places/search", {
    headers: {
      Authorization: "fsq3DJaU0tLmlGDTuxhMwEWxylkxAgbDZsRvSYbVF1QRcyE=",
    },
    params: {
      ll: `${lat},${lng}`,
      query: "hotel",
      radius: 5000,
      limit: 20,
    },
  });

  const rawHotels = response.data.results.map((place, i) => {
    const rating = Math.random() * 2 + 3;
    const price = Math.floor(Math.random() * 2000 + 1000);
    const distance = haversine(
      lat,
      lng,
      place.geocodes.main.latitude,
      place.geocodes.main.longitude
    );

    return {
      id: place.fsq_id,
      name: place.name,
      address: place.location?.formatted_address || "Unknown",
      rating: +rating.toFixed(1),
      price,
      distance,
      roomType: ["single", "double", "suite"][Math.floor(Math.random() * 3)],
      features: {
        wifi: Math.random() > 0.3,
        breakfast: Math.random() > 0.5,
        pool: Math.random() > 0.6,
      },
      photo: fallbackImages[i % fallbackImages.length],
      location: {
        lat: place.geocodes.main.latitude,
        lng: place.geocodes.main.longitude,
      },
    };
  });

  // FILTER by price
  let filtered = rawHotels.filter((h) =>
    preference === "budget" ? h.price < 2000 : h.price >= 2000
  );

  // FILTER by roomType if not "any"
  if (roomType !== "any") {
    filtered = filtered.filter((h) => h.roomType === roomType);
  }

  // FILTER by selected features (only if true)
  if (features.wifi) filtered = filtered.filter((h) => h.features.wifi);
  if (features.breakfast) filtered = filtered.filter((h) => h.features.breakfast);
  if (features.pool) filtered = filtered.filter((h) => h.features.pool);

  // SORT: prioritize higher rating and lower distance
  const ranked = filtered
    .sort((a, b) => (b.rating / b.distance) - (a.rating / a.distance))
    .slice(0, 10); // Return top 10

  return ranked;
};

module.exports = recommendEngine;
