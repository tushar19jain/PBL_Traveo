import { useState } from "react";

const staticFallbackImages = [
  "https://images.unsplash.com/photo-1582719508461-905c673771fd", // modern
  "https://images.unsplash.com/photo-1501117716987-c8e1ecb210d3", // classic
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",     // resort
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f5d2", // apartment
  "https://images.unsplash.com/photo-1618773928121-c32242e3c9bb", // luxury
  "https://images.unsplash.com/photo-1568495248636-6432b97bd949", // room
];

const HotelCard = ({ hotel, index, onViewMap }) => {
  const fallbackUrl = staticFallbackImages[index % staticFallbackImages.length];
  const [imgSrc, setImgSrc] = useState(hotel.photo || fallbackUrl);

  const handleImgError = () => {
    setImgSrc(fallbackUrl);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border">
      <img
        src={imgSrc}
        onError={handleImgError}
        alt={hotel.name}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1">{hotel.name}</h2>
        <p className="text-gray-600 text-sm mb-1">{hotel.address}</p>
        <p className="text-blue-600 text-sm font-medium mb-1">₹{hotel.price}</p>
        <p className="text-yellow-600 text-sm mb-2">⭐ {hotel.rating}</p>
        <button
          onClick={onViewMap}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          View on Map
        </button>
      </div>
    </div>
  );
};

export default HotelCard;
