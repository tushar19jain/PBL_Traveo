import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import PlaygroundVisualizer from "../components/PlaygroundVisualizer";

const Playground = () => {
  const [hotels, setHotels] = useState([]);
  const [fromHotel, setFromHotel] = useState("");
  const [toHotel, setToHotel] = useState("");
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [pathResult, setPathResult] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get("https://api.foursquare.com/v3/places/search", {
          headers: {
            Authorization: "fsq3DJaU0tLmlGDTuxhMwEWxylkxAgbDZsRvSYbVF1QRcyE=", // Replace with your key
          },
          params: {
            ll: "30.3165,78.0322",
            query: "hotel",
            radius: 5000,
            limit: 20,
          },
        });

        const data = res.data.results.map((place) => ({
          id: place.fsq_id,
          name: place.name,
          location: {
            lat: place.geocodes.main.latitude,
            lng: place.geocodes.main.longitude,
          },
        }));

        setHotels(data);
      } catch (err) {
        console.error("Hotel fetch error:", err);
      }
    };

    fetchHotels();
  }, []);

  const runAlgorithm = async () => {
    if (!fromHotel || !toHotel) {
      alert("Please select both source and destination.");
      return;
    }

    if (fromHotel === toHotel) {
      alert("Please select two different hotels.");
      return;
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/playground/${algorithm}`, {
        from: fromHotel,
        to: toHotel,
        hotels,
      });

      setPathResult(res.data);
    } catch (err) {
      console.error("Algorithm error:", err.response?.data || err.message);
      alert("Failed to run algorithm: " + (err.response?.data?.message || err.message));
    }
  };

  const getHotelById = (id) => hotels.find((h) => h.id === id);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <h1 className="text-3xl font-bold text-center mb-6">🧪 Hotel Graph Playground</h1>

      {/* Controls */}
      <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Algorithm</label>
            <select
              className="w-full p-2 border rounded"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              <option value="dijkstra">Dijkstra (Shortest Distance)</option>
              <option value="a-star">A* Algorithm</option>
              <option value="prim">Prim's MST</option>
              <option value="bfs">BFS Algorithm</option>
              <option value="bellman">Bellman–Ford Algorithm</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">From Hotel</label>
            <select
              className="w-full p-2 border rounded"
              value={fromHotel}
              onChange={(e) => setFromHotel(e.target.value)}
            >
              <option value="">-- Select From --</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">To Hotel</label>
            <select
              className="w-full p-2 border rounded"
              value={toHotel}
              onChange={(e) => setToHotel(e.target.value)}
            >
              <option value="">-- Select To --</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={runAlgorithm}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full"
            >
              ▶️ Run Algorithm
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {pathResult && (
        <>
          <div className="max-w-4xl mx-auto bg-white rounded shadow p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">✅ Result</h2>
            <p>
              <strong>Algorithm:</strong> {algorithm}
            </p>

            {/* Render path result dynamically */}
            {pathResult.path && (
              <div className="mt-2">
                <strong>Path:</strong>{" "}
                {pathResult.path.map((item, index) => {
                  if (typeof item === "string") {
                    const hotel = getHotelById(item);
                    return (
                      <span key={item}>
                        {hotel?.name || item}
                        {index < pathResult.path.length - 1 && " → "}
                      </span>
                    );
                  }

                  if (typeof item === "object" && item.from && item.to) {
                    const from = getHotelById(item.from);
                    const to = getHotelById(item.to);
                    return (
                      <div key={`${item.from}-${item.to}`} className="text-sm text-blue-600">
                        🛤️ {from?.name || item.from} → {to?.name || item.to} ({item.weight.toFixed(2)} km)
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {typeof pathResult.totalDistance === "number" && (
              <p className="mt-2">
                <strong>Total Distance:</strong> {pathResult.totalDistance.toFixed(2)} km
              </p>
            )}
          </div>

          {/* Map Visualizer */}
          <PlaygroundVisualizer
            hotels={hotels}
            path={pathResult.path}
            totalDistance={pathResult.totalDistance}
          />
        </>
      )}
    </div>
  );
};

export default Playground;
