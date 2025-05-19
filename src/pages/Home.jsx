import { useEffect, useRef, useState } from "react";
import axios from "axios";
import MapView from "../pages/MapView";
import HotelCard from "../components/HotelCard";
import FilterDialog from "../components/FilterDialog";
import Header from "../components/Header";
import CategoryBar from "../components/CategoryBtn";

const HomePage = () => {
  const [hotels, setHotels] = useState([]);
  const [sortedHotels, setSortedHotels] = useState([]);
  const [sortType, setSortType] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollToId, setScrollToId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [pathToHotel, setPathToHotel] = useState(null);
  const [travelMode, setTravelMode] = useState("car");
  const mapRef = useRef();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserLocation({ lat, lng });

      try {
        const res = await axios.get(
          "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotelsByCoordinates",
          {
            params: {
              latitude: lat,
              longitude: lng,
              arrival_date: "2024-06-01",
              departure_date: "2024-06-02",
              adults: "1",
              room_qty: "1",
              languagecode: "en-us",
              currency_code: "INR",
            },
            headers: {
              'x-rapidapi-key': 'e39248b1aemsh57c1e3222812f5ap1eff05jsn17a22a777fdb',
              'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
            },
          }
        );

        const enriched = res.data.hotels.map((hotel, i) => ({
          id: hotel.hotel_id,
          name: hotel.name,
          location: {
            lat: parseFloat(hotel.latitude),
            lng: parseFloat(hotel.longitude),
          },
          address: hotel.address || hotel.city || "Unknown",
          price: hotel.min_total_price || Math.floor(Math.random() * 2000 + 1000),
          rating: hotel.review_score || (Math.random() * 2 + 3).toFixed(1),
          photo:
            hotel.main_photo_url ||
            `https://source.unsplash.com/400x300/?hotel,room,${i}`,
        }));

        setHotels(enriched);
      } catch (error) {
        console.error("Booking API failed:", error);
      }
    });
  }, []);

  const sortHotels = async (type) => {
    if (type === "distance") {
      if (!userLocation) return alert("User location not available!");

      const res = await fetch("http://localhost:5000/api/shortest-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userLocation, hotels }),
      });

      const data = await res.json();
      setSortedHotels(data.hotels);
      setSortType("Sorted by: Distance");
    }

    if (type === "price") {
      const sorted = [...hotels].sort((a, b) => a.price - b.price);
      setSortedHotels(sorted);
      setSortType("Sorted by: Price (Low to High)");
    }

    setShowDialog(false);
  };

  const handleViewOnMap = async (hotelId) => {
    if (!userLocation) return;

    const userNode = {
      id: "user",
      name: "You are here",
      location: userLocation,
    };

    const fullHotels = [...hotels, userNode];
    setScrollToId(hotelId);

    try {
      const res = await fetch("http://localhost:5000/api/playground/dijkstra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "user",
          to: hotelId,
          hotels: fullHotels,
          mode: travelMode,
        }),
      });

      const data = await res.json();
      setPathToHotel(data.path || []);
    } catch (err) {
      console.error("Path fetch failed:", err);
    }

    setTimeout(() => {
      document.getElementById("main-map")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const filtered = (sortedHotels.length ? sortedHotels : hotels).filter((hotel) =>
    hotel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="sticky top-[80px] z-40 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <CategoryBar onFilterClick={() => setShowDialog(true)} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <input
          type="text"
          placeholder="Search hotels by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded shadow-sm"
        />
      </div>

      {showDialog && (
        <FilterDialog onClose={() => setShowDialog(false)} onSort={sortHotels} />
      )}

      <div className="max-w-6xl mx-auto px-4 mb-4 flex justify-end">
        <select
          value={travelMode}
          onChange={(e) => setTravelMode(e.target.value)}
          className="border p-2 rounded shadow-sm"
        >
          <option value="car">🚗 Car</option>
          <option value="bike">🛵 Bike</option>
          <option value="foot">🚌 Bus/Walk</option>
        </select>
      </div>

      {sortType && (
        <div className="max-w-6xl mx-auto px-4 text-sm text-gray-600 mb-2">
          {sortType}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <p className="text-gray-500 col-span-full">No hotels found.</p>
        ) : (
          filtered.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} onViewMap={() => handleViewOnMap(hotel.id)} />
          ))
        )}
      </div>

      <div id="main-map" className="max-w-6xl mx-auto mt-10 rounded-lg overflow-hidden shadow border">
        <MapView
          ref={mapRef}
          scrollToId={scrollToId}
          pathToHotel={pathToHotel}
          onHotelsFetched={setHotels}
          setUserLocation={setUserLocation}
          travelMode={travelMode}
        />
      </div>

      <footer className="bg-white border-t mt-8 p-4 text-center text-sm text-gray-500">
        Developed by Tushar Jain, Rohit Singh, Vikash Kumar and Rupesh Kumar — MCA 2nd Semester
      </footer>
    </div>
  );
};

export default HomePage;
