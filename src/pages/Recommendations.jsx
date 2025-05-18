import { useEffect, useState } from "react";
import axios from "axios";
import HotelCard from "../components/HotelCard";

const RecommendationPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  // User Preferences
  const [budgetType, setBudgetType] = useState("budget");
  const [roomType, setRoomType] = useState("any");
  const [features, setFeatures] = useState({
    wifi: false,
    breakfast: false,
    pool: false,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Location error:", err);
        alert("Please allow location access.");
      }
    );
  }, []);

  const fetchRecommendations = async () => {
    if (!location) {
      alert("User location not available yet.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/recommendations", {
        lat: location.lat,
        lng: location.lng,
        preference: budgetType,
        roomType,
        features,
      });

      setRecommendations(res.data.recommended);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to get recommendations");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        🎯 Personalized Hotel Recommendations
      </h1>

      {/* Preferences Form */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">💰 Budget Type</label>
            <select
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            >
              <option value="budget">Budget</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          <div>
            <label className="font-medium">🛏️ Room Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            >
              <option value="any">Any</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="font-medium block mb-2">🧰 Features</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={features.wifi}
                  onChange={(e) =>
                    setFeatures({ ...features, wifi: e.target.checked })
                  }
                />
                Free Wi-Fi
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={features.breakfast}
                  onChange={(e) =>
                    setFeatures({ ...features, breakfast: e.target.checked })
                  }
                />
                Breakfast Included
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={features.pool}
                  onChange={(e) =>
                    setFeatures({ ...features, pool: e.target.checked })
                  }
                />
                Pool Access
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={fetchRecommendations}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          🔍 Get Recommendations
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-center text-gray-500">Loading hotels...</p>
      ) : recommendations.length === 0 ? (
        <p className="text-center text-gray-400">No hotels matched your preferences.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {recommendations.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationPage;
