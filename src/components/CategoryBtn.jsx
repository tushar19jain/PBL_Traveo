const categories = [
    { name: "Hotels", icon: "🏨" },
    { name: "Resorts", icon: "🏝️" },
    { name: "Homestays", icon: "🏡" },
    { name: "Camps", icon: "🏕️" },
  ];
  
  const CategoryBar = ({ onFilterClick }) => {
    return (
      <div className="flex items-center overflow-x-auto gap-4 px-4 py-3 bg-white border-b">
        {categories.map((cat, index) => (
          <button
            key={index}
            className="flex items-center gap-2 border px-4 py-2 rounded-full text-sm text-gray-700 hover:bg-blue-50 transition whitespace-nowrap"
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
  
        <button
          onClick={onFilterClick}
          className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition"
        >
          <span>⚙️</span>
          <span>Filter</span>
        </button>
      </div>
    );
  };
  
  export default CategoryBar;
  