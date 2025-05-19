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
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

const RoutingPath = ({ from, to, mode }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!from || !to) return;

    if (routingRef.current && map.hasLayer(routingRef.current)) {
      map.removeControl(routingRef.current);
    }

    routingRef.current = L.Routing.control({
      waypoints: [L.latLng(...from), L.latLng(...to)],
      router: new L.Routing.OSRMv1({
        profile: mode === "bike" ? "bike" : "car",
        serviceUrl: "https://router.project-osrm.org/route/v1"
      }),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      lineOptions: {
        styles: [
          { color: "blue", weight: 6, opacity: 0.7 },
          { color: "white", weight: 3, opacity: 0.9 },
        ],
      },
    }).addTo(map);

    return () => {
      if (routingRef.current && map.hasLayer(routingRef.current)) {
        map.removeControl(routingRef.current);
        routingRef.current = null;
      }
    };
  }, [from, to, mode, map]);

  return null;
};

const MapView = ({ scrollToId, pathToHotel, onHotelsFetched, setUserLocation, travelMode }) => {
  const hotelsRef = useRef([]);
  const userPos = useRef(null);
  const center = [30.3165, 78.0322];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = [pos.coords.latitude, pos.coords.longitude];
      userPos.current = coords;
      setUserLocation({ lat: coords[0], lng: coords[1] });
    });

    const fetchHotels = async () => {
      const res = await fetch("https://api.foursquare.com/v3/places/search?ll=30.3165,78.0322&query=hotel&radius=10000&limit=50", {
        headers: {
          Authorization: "fsq3DJaU0tLmlGDTuxhMwEWxylkxAgbDZsRvSYbVF1QRcyE=",
        },
      });

      const data = await res.json();

      const hotels = await Promise.all(data.results.map(async (place, index) => {
        let photoUrl = `https://images.unsplash.com/photo-1582719478181-d07b0b4b0985?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60&sig=${index}`;

        try {
          const photoRes = await fetch(`https://api.foursquare.com/v3/places/${place.fsq_id}/photos`, {
            headers: {
              Authorization: "fsq3DJaU0tLmlGDTuxhMwEWxylkxAgbDZsRvSYbVF1QRcyE=",
            },
          });
          const photoData = await photoRes.json();
          if (photoData?.length) {
            photoUrl = `${photoData[0].prefix}original${photoData[0].suffix}`;
          }
        } catch (err) {
          console.error(`Image load failed for ${place.name}`, err);
        }

        return {
          id: place.fsq_id,
          name: place.name,
          location: {
            lat: place.geocodes.main.latitude,
            lng: place.geocodes.main.longitude,
          },
          address: place.location.formatted_address,
          rating: (Math.random() * 2 + 3).toFixed(1),
          price: Math.floor(Math.random() * 2000 + 1000),
          photo: photoUrl,
        };
      }));

      hotelsRef.current = hotels;
      onHotelsFetched(hotels);
    };

    fetchHotels();
  }, [setUserLocation, onHotelsFetched]);

  const selectedHotel = scrollToId
    ? hotelsRef.current.find((h) => h.id === scrollToId)
    : null;

  const from = userPos.current;
  const to = selectedHotel ? [selectedHotel.location.lat, selectedHotel.location.lng] : null;

  return (
    <MapContainer
      center={from || center}
      zoom={13}
      scrollWheelZoom={false}
      className="w-full h-[400px]"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {hotelsRef.current.map((hotel) => (
        <Marker
          key={hotel.id}
          position={[hotel.location.lat, hotel.location.lng]}
        >
          <Popup>
            <strong>{hotel.name}</strong><br />
            <img
              src={hotel.photo}
              alt={hotel.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1582719478181-d07b0b4b0985?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60";
              }}
              style={{ width: "100%", height: "auto", borderRadius: "6px" }}
            /><br />
            {hotel.address}<br />
            ₹{hotel.price} | ⭐ {hotel.rating}
          </Popup>
        </Marker>
      ))}

      {from && to && <RoutingPath from={from} to={to} mode={travelMode} />}
    </MapContainer>
  );
};

export default MapView;
