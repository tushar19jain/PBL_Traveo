import { useEffect, useState } from "react";
import axios from "axios";
import { aStarPath } from "../utils/aStarPath";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2x,
  iconUrl: icon,
  shadowUrl: shadow,
});

const fallbackImages = [
  "https://source.unsplash.com/400x300/?hotel,room",
  "https://source.unsplash.com/400x300/?resort",
  "https://source.unsplash.com/400x300/?apartment",
  "https://source.unsplash.com/400x300/?homestay",
  "https://source.unsplash.com/400x300/?guesthouse",
];

const PathFinder = () => {
  const [hotels, setHotels] = useState([]);
  const [startHotel, setStartHotel] = useState(null);
  const [endHotel, setEndHotel] = useState(null);
  const [path, setPath] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
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
          address: place.location?.formatted_address || "Address not available",
          rating: (Math.random() * 2 + 3).toFixed(1),
          price: Math.floor(Math.random() * 2000 + 1000),
          location: {
            lat: place.geocodes.main.latitude,
            lng: place.geocodes.main.longitude,
          },
          photo: fallbackImages[i % fallbackImages.length],
        }));

        setHotels(hotelsData);
        setStartHotel(hotelsData[0]?.id);
        setEndHotel(hotelsData[1]?.id);
      } catch (err) {
        console.error("Error fetching hotels:", err);
      }
    });
  }, []);

  const scrollToMap = () => {
    const el = document.getElementById("scrollToMap");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const findPath = () => {
    if (!startHotel || !endHotel) return;
    setLoading(true);

    const pathResult = aStarPath(hotels, startHotel, endHotel);
    const resolvedPath = pathResult.map((id) => hotels.find((h) => h.id === id));
    setPath(resolvedPath);

    let dist = 0;
    for (let i = 0; i < resolvedPath.length - 1; i++) {
      dist += haversine(
        resolvedPath[i].location.lat,
        resolvedPath[i].location.lng,
        resolvedPath[i + 1].location.lat,
        resolvedPath[i + 1].location.lng
      );
    }

    setTotalDistance(dist);
    setLoading(false);
    scrollToMap();
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">A* Pathfinding Visualizer</h1>

      <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
        <div>
          <label className="mr-2">Start Hotel:</label>
          <select
            value={startHotel}
            onChange={(e) => setStartHotel(e.target.value)}
            className="p-2 border rounded"
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2">End Hotel:</label>
          <select
            value={endHotel}
            onChange={(e) => setEndHotel(e.target.value)}
            className="p-2 border rounded"
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={findPath}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Finding..." : "Find Path"}
        </button>
      </div>

      {path.length > 0 && (
        <div className="bg-white p-4 rounded shadow-md mb-6 text-center">
          <h2 className="text-lg font-semibold mb-2">📍 Path:</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {path.map((hotel, index) => (
              <li key={hotel.id}>
                {index + 1}. {hotel.name}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-green-700 font-medium">
            📏 Total Distance: {totalDistance.toFixed(2)} km
          </p>
        </div>
      )}

      <div className="h-[400px] rounded overflow-hidden border" id="scrollToMap">
        {path.length > 0 && (
          <MapContainer
            center={[path[0].location.lat, path[0].location.lng]}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {path.map((hotel, i) => (
              <Marker key={hotel.id} position={[hotel.location.lat, hotel.location.lng]}>
                <Popup>
                  {hotel.name}<br />
                  ₹{hotel.price} | ⭐ {hotel.rating}
                </Popup>
              </Marker>
            ))}

            <Polyline
              positions={path.map((h) => [h.location.lat, h.location.lng])}
              color="blue"
              weight={4}
            />
          </MapContainer>
        )}
      </div>
    </div>
  );
};

// Haversine for distance
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

export default PathFinder;
