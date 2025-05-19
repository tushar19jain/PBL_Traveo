import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">Traveo</Link>
        <nav className="space-x-4 text-sm font-medium text-gray-700">
          <Link to="/" className="hover:text-blue-500">Home</Link>
          <Link to="/map" className="hover:text-blue-500">Map</Link>
          {/*<Link to="/sort" className="hover:text-blue-500">Sort</Link>*/}
          <Link to="/mst" className="hover:text-blue-500">MST</Link>
          <Link to="/pathfinder" className="hover:text-blue-500">Pathfinding</Link>
          <Link to="/recommend" className="hover:text-blue-500">Recommend</Link>
          <Link to="/playground" className="hover:text-blue-500">Playground</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
