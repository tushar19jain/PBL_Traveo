import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

const PlaygroundVisualizer = ({ hotels, path, totalDistance }) => {
  if (!path || path.length === 0) return null;

  // Get coordinates of all hotels in path
  const pathCoords = path
    .map((id) => {
      const hotel = hotels.find((h) => h.id === id);
      return hotel ? [hotel.location.lat, hotel.location.lng] : null;
    })
    .filter(Boolean);

  const center = pathCoords[0] || [30.3165, 78.0322];

  return (
    <div className="w-full max-w-6xl mx-auto my-6 rounded-lg overflow-hidden shadow-md border">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-[400px]"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pathCoords.map((coord, i) => (
          <Marker key={i} position={coord}>
            <Popup>{path[i]}</Popup>
          </Marker>
        ))}

        {pathCoords.length > 1 && (
          <Polyline positions={pathCoords} color="blue" />
        )}
      </MapContainer>

      <div className="p-4 bg-white border-t text-sm">
        <p><strong>Path:</strong> {path.join(" → ")}</p>
        <p><strong>Total Distance:</strong> {totalDistance.toFixed(2)} km</p>
      </div>
    </div>
  );
};

export default PlaygroundVisualizer;
