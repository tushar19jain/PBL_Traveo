import { useEffect, useState } from "react";
import { primMST } from "../utils/mstAlgorithm";
import axios from "axios";

const fallbackImages = [
  "https://source.unsplash.com/400x300/?hotel,room",
  "https://source.unsplash.com/400x300/?resort",
  "https://source.unsplash.com/400x300/?apartment",
  "https://source.unsplash.com/400x300/?homestay",
  "https://source.unsplash.com/400x300/?guesthouse",
];

const MstVisualizer = () => {
  const [hotels, setHotels] = useState([]);
  const [edges, setEdges] = useState([]);
  const [cost, setCost] = useState(0);
  const [activeEdge, setActiveEdge] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);

      try {
        const res = await axios.get("https://api.foursquare.com/v3/places/search", {
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

        const hotelsData = res.data.results.map((place, i) => ({
          id: place.fsq_id,
          name: place.name,
          address: place.location?.formatted_address || "No address",
          rating: (Math.random() * 2 + 3).toFixed(1),
          price: Math.floor(Math.random() * 2000 + 1000),
          location: {
            lat: place.geocodes.main.latitude,
            lng: place.geocodes.main.longitude,
          },
          photo: fallbackImages[i % fallbackImages.length],
        }));

        setHotels(hotelsData);
      } catch (err) {
        console.error("Error fetching hotels:", err);
      }
    });
  }, []);

  const runPrim = async () => {
    setEdges([]);
    setCost(0);
    setLoading(true);

    const { mstEdges, totalCost } = primMST(hotels);

    for (let i = 0; i < mstEdges.length; i++) {
      setActiveEdge(mstEdges[i]);
      await new Promise((res) => setTimeout(res, 700));
      setEdges((prev) => [...prev, mstEdges[i]]);
      setCost((prev) => prev + mstEdges[i].distance);
    }

    setActiveEdge(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Prim's MST Visualizer</h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={runPrim}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Running MST..." : "Run Prim’s MST"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {hotels.map((hotel, i) => (
          <div
            key={i}
            className={`border p-4 rounded shadow text-center transition duration-500 ${
              activeEdge && (activeEdge.from === i || activeEdge.to === i)
                ? "bg-yellow-100 border-yellow-500 scale-105"
                : "bg-white"
            }`}
          >
            <img
              src={hotel.photo}
              alt={hotel.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <h3 className="text-lg font-semibold">{hotel.name}</h3>
            <p className="text-sm text-gray-600">{hotel.address}</p>
            <p className="text-sm text-yellow-500">⭐ {hotel.rating}</p>
            <p className="text-sm text-green-600">₹{hotel.price}</p>
          </div>
        ))}
      </div>

      {edges.length > 0 && (
        <div className="mt-10 bg-white p-6 rounded shadow max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 text-center">Connected Edges:</h2>
          <ul className="space-y-2">
            {edges.map((edge, i) => (
              <li
                key={i}
                className={`text-sm transition ${
                  activeEdge?.from === edge.from && activeEdge?.to === edge.to
                    ? "text-red-600 font-semibold"
                    : "text-gray-800"
                }`}
              >
                {hotels[edge.from]?.name} ➝ {hotels[edge.to]?.name} :
                <span className="text-blue-600 font-medium ml-1">
                  {edge.distance.toFixed(2)} km
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 font-bold text-green-700 text-center">
            Total MST Cost: {cost.toFixed(2)} km
          </div>
        </div>
      )}
    </div>
  );
};

export default MstVisualizer;
