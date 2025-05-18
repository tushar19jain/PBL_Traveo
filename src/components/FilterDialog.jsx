const FilterDialog = ({ onClose, onSort }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
          {/* Close Button */}
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
            onClick={onClose}
          >
            &times;
          </button>
  
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Sort Hotels
          </h2>
  
          <div className="flex flex-col gap-4">
            <button
              onClick={() => onSort("distance")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              📍 Sort by Distance
            </button>
  
            <button
              onClick={() => onSort("price")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              💸 Sort by Price (Low to High)
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default FilterDialog;
  