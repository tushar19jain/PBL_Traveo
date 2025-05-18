const HotelCard = ({ hotel, onViewMap }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      {hotel.photo && (
        <img
          src={hotel.photo}
          alt={hotel.name}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{hotel.name}</h2>
          <p className="text-sm text-gray-600 mb-1">📍 {hotel.address}</p>
          <p className="text-sm text-yellow-600">⭐ Rating: {hotel.rating}</p>
          <p className="text-sm text-green-700 font-medium">₹{hotel.price}</p>
          {hotel.distance && (
            <p className="text-sm text-blue-500 mt-1">
              📏 {hotel.distance.toFixed(2)} km away
            </p>
          )}
        </div>

        <button
          onClick={() => onViewMap(hotel.id)}
          className="mt-4 bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition w-fit"
        >
          View on Map
        </button>
      </div>
    </div>
  );
};

export default HotelCard;
