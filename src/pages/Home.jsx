import { useEffect, useRef, useState } from "react";
import MapView from "../pages/MapView";
import HotelCard from "../components/HotelCard";
import FilterDialog from "../components/FilterDialog";
import Header from "../components/Header";
import CategoryBar from "../components/CategoryBtn";


const HomePage = () => {
  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6)
      setUserLocation({lat, lng});
    });
  })
  
  const [hotels, setHotels] = useState([]);
  const [sortedHotels, setSortedHotels] = useState([]);
  const [sortType, setSortType] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollToId, setScrollToId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef();

  const sortHotels = async (type) => {
    if (type === "distance") {
      if (!userLocation) {
        alert("User location not available!");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/shortest-path", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userLocation,
            hotels,
          }),
        });

        const data = await res.json();
        setSortedHotels(data.hotels);
        setSortType("Sorted by: Distance");
      } catch (err) {
        console.error("Error fetching sorted hotels:", err);
      }
    }

    if (type === "price") {
      const sorted = [...hotels].sort((a, b) => a.price - b.price);
      setSortedHotels(sorted);
      setSortType("Sorted by: Price (Low to High)");
    }

    setShowDialog(false);
  };

  const filteredHotels = (sortedHotels.length ? sortedHotels : hotels).filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex justify-center border-b bg-white sticky top-[80px] z-40">
        <div className="w-full max-w-6xl">
          <CategoryBar onFilterClick={() => setShowDialog(true)} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <input
          type="text"
          placeholder="Search hotels by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showDialog && (
        <FilterDialog onClose={() => setShowDialog(false)} onSort={sortHotels} />
      )}

      {sortType && (
        <div className="max-w-6xl mx-auto px-4 mb-2 text-sm text-gray-600 font-medium">
          {sortType}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredHotels.length === 0 ? (
          <p className="text-gray-500 col-span-full">No hotels found.</p>
        ) : (
          filteredHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onViewMap={(id) => {
                setScrollToId(id);
                setTimeout(() => {
                  const map = document.getElementById("main-map");
                  map?.scrollIntoView({ behavior: "smooth" });
                }, 200);
              }}
            />
          ))
        )}
      </div>

      <div
        id="main-map"
        className="relative w-full max-w-6xl mx-auto mt-10 rounded-lg overflow-hidden shadow-md border"
      >
        <MapView
          ref={mapRef}
          scrollToId={scrollToId}
          onHotelsFetched={setHotels}
          setUserLocation={setUserLocation}
        />
        <div className="absolute top-2 left-2 bg-white text-sm text-gray-800 px-3 py-1 rounded shadow">
          📍 You are currently here
        </div>
      </div>

      <footer className="bg-white border-t mt-8 p-4 text-center text-sm text-gray-500">
        Developed by Tushar Jain, Rohit Singh, Vikash Kumar and Rupesh Kumar — MCA 2nd Semester
      </footer>
    </div>
  );
};

export default HomePage;
