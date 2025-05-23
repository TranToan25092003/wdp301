import React from "react";
import Container from "../global/Container";
import NavSearch from "./NavSearch";
import LinkDropdown from "./LinksDropdown";
import logo from "../../assets/logo.png"
import { Link } from "react-router-dom";
import CategoryDropdown from "../item/category-dropdown";
import FilterBar from "../item/filter-bar";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "antd";
import { SlidersHorizontal } from "lucide-react";
import { ShoppingCart } from "lucide-react";
const Navbar = () => {

  const categories = [
    { name: "Electronics", path: "/category/electronics" },
    { name: "Clothing", path: "/category/clothing" },
    { name: "Books", path: "/category/books" },
    { name: "Home Appliances", path: "/category/home-appliances" },
  ];

  const [filters, setFilters] = useState({
    category: "",
    status: "",
    priceRange: [0, 1000000],
    rate: "",
    isFree: false,
  });

  const onFilterChange = (newFilter) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilter,
    }));
  };

  return (
    <div className="border-b">
      <Container className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Logo */}
          <Link to="/">
            <img src={logo} alt="Old market Logo" className="h-28" />
          </Link>

          {/* Category */}
          <CategoryDropdown categories={categories} />

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px] sm:w-[600px] max-h-[80vh] overflow-auto">
              <FilterBar
                filters={filters}
                onFilterChange={onFilterChange}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-4 items-center">
          {/* Cart Icon with badge */}
          <div className="relative cursor-pointer">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </div>
          {/* Dropdown menu */}
          <LinkDropdown />
        </div>
      </Container>
    </div>
  );
};

export default Navbar;
