import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

// ✅ Auto-zoom to fit markers
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
};

// ✅ Real road routing like Google Maps
const RoutingPath = ({ coordinates }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map || coordinates.length < 2) return;

    if (routingRef.current) {
      map.removeControl(routingRef.current);
    }

    routingRef.current = L.Routing.control({
      waypoints: coordinates.map((pos) => L.latLng(pos[0], pos[1])),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
    }).addTo(map);

    return () => {
      if (routingRef.current) {
        map.removeControl(routingRef.current);
        routingRef.current = null;
      }
    };
  }, [coordinates, map]);

  return null;
};

const PlaygroundVisualizer = ({ hotels, path, totalDistance }) => {
  if (!path || path.length === 0) return null;

  const getLatLng = (id) => {
    const hotel = hotels.find((h) => h.id === id);
    return hotel ? [hotel.location.lat, hotel.location.lng] : null;
  };

  let routePoints = [];
  let hotelIdSet = new Set();

  if (typeof path[0] === "string") {
    routePoints = path.map(getLatLng).filter(Boolean);
    path.forEach((id) => hotelIdSet.add(id));
  } else if (typeof path[0] === "object" && path[0].from && path[0].to) {
    for (const edge of path) {
      const from = getLatLng(edge.from);
      const to = getLatLng(edge.to);
      if (from && to) {
        routePoints.push(from, to);
        hotelIdSet.add(edge.from);
        hotelIdSet.add(edge.to);
      }
    }
  }

  const center = routePoints[0] || [30.3165, 78.0322];

  return (
    <div className="w-full max-w-6xl mx-auto my-6 rounded-lg overflow-hidden shadow-md border">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-[400px]"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds positions={routePoints} />

        {[...hotelIdSet].map((id) => {
          const hotel = hotels.find((h) => h.id === id);
          if (!hotel) return null;
          return (
            <Marker key={id} position={[hotel.location.lat, hotel.location.lng]}>
              <Popup>{hotel.name}</Popup>
            </Marker>
          );
        })}

        {/* Show Google Maps-style road path only for sequential ID-based paths */}
        {typeof path[0] === "string" && routePoints.length >= 2 && (
          <RoutingPath coordinates={routePoints} />
        )}
      </MapContainer>

      <div className="p-4 bg-white border-t text-sm">
        <p>
          <strong>Path:</strong>{" "}
          {typeof path[0] === "string"
            ? path
                .map((id) => hotels.find((h) => h.id === id)?.name || id)
                .join(" → ")
            : path
                .map((edge) => {
                  const from = hotels.find((h) => h.id === edge.from);
                  const to = hotels.find((h) => h.id === edge.to);
                  return `${from?.name || edge.from} → ${to?.name || edge.to}`;
                })
                .join(" | ")}
        </p>
        <p>
          <strong>Total Distance:</strong> {totalDistance.toFixed(2)} km
        </p>
      </div>
    </div>
  );
};

export default PlaygroundVisualizer;
