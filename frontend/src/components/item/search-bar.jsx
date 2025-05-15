import { useState, useEffect } from "react";

export default function SearchBar({ search, onSearchChange }) {
  const [searchTerm, setSearchTerm] = useState(search || "");

  useEffect(() => {
    setSearchTerm(search || "");
  }, [search]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <div className="flex w-full md:w-1/2">
      <input
        type="search"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Search items..."
        value={searchTerm}
        onChange={handleInputChange}
      />
    </div>
  );
}
