import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Fix icon issues with Leaflet in Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const fallbackImages = [
  "https://source.unsplash.com/400x300/?hotel,room",
  "https://source.unsplash.com/400x300/?lobby",
  "https://source.unsplash.com/400x300/?bedroom",
  "https://source.unsplash.com/400x300/?resort",
  "https://source.unsplash.com/400x300/?apartment",
  "https://source.unsplash.com/400x300/?homestay",
  "https://source.unsplash.com/400x300/?hotel-view",
  "https://source.unsplash.com/400x300/?guesthouse",
];

const MapView = ({ onHotelsFetched, scrollToId }) => {
  const mapRef = useRef();
  const [userLocation, setUserLocation] = useState(null);
  const [hotels, setHotels] = useState([]);

  // Scroll and zoom to marker logic
  const FlyToMarker = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
      if (lat && lng) {
        map.flyTo([lat, lng], 15, { duration: 1.5 });
      }
    }, [lat, lng]);
    return null;
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);

        // Foursquare API
        try {
          const res = await axios.get("https://api.foursquare.com/v3/places/search", {
            headers: {
              Authorization: "fsq3DJaU0tLmlGDTuxhMwEWxylkxAgbDZsRvSYbVF1QRcyE=", // Replace this
            },
            params: {
              ll: `${lat},${lng}`,
              query: "hotel",
              radius: 5000,
              limit: 20,
            },
          });

          const fetched = res.data.results.map((place, idx) => ({
            id: place.fsq_id,
            name: place.name,
            address: place.location?.formatted_address || "Address unavailable",
            rating: (Math.random() * 2 + 3).toFixed(1),
            price: Math.floor(Math.random() * 3000 + 1000),
            location: {
              lat: place.geocodes.main.latitude,
              lng: place.geocodes.main.longitude,
            },
            distance: null,
            photo: fallbackImages[idx % fallbackImages.length],
          }));

          setHotels(fetched);
          onHotelsFetched(fetched);
        } catch (err) {
          console.error("Foursquare API failed", err);
        }
      },
      (err) => {
        console.error("Location error", err);
      }
    );
  }, []);

  return (
    <div id="main-map" style={{ height: "400px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
      {userLocation && (
        <MapContainer center={userLocation} zoom={13} scrollWheelZoom={true} ref={mapRef} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>

          {hotels.map((hotel) => (
            <Marker key={hotel.id} position={[hotel.location.lat, hotel.location.lng]}>
              <Popup>
                <strong>{hotel.name}</strong>
                <br />
                {hotel.address}
                <br />
                ⭐ {hotel.rating} | ₹{hotel.price}
              </Popup>
            </Marker>
          ))}

          {scrollToId && (
            <FlyToMarker
              lat={hotels.find((h) => h.id === scrollToId)?.location.lat}
              lng={hotels.find((h) => h.id === scrollToId)?.location.lng}
            />
          )}
        </MapContainer>
      )}
    </div>
  );
};

export default MapView;
