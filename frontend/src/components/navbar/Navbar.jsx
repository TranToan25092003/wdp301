import React from "react";
import LinkDropdown from "./LinksDropdown";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ShoppingCart, Plus, MessageCircle, Search } from "lucide-react";
import { TbCoinFilled } from "react-icons/tb";
import { useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="border-b w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:justify-between lg:items-center flex-wrap gap-4 py-2">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Logo */}
          <Link to="/">
            <img src={logo} alt="Old market Logo" className="h-28" />
          </Link>

          {/* Navigation tabs */}
          <nav className="hidden md:flex items-center gap-6 ml-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              to="/auctions"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Auctions
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Thông tin
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 order-last lg:order-none w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {/* Chat Icon */}
          <div className="relative cursor-pointer">
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              2
            </span>
          </div>

          {/* Cart Icon with badge */}
          <div className="relative cursor-pointer">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </div>

          <Link to={"/topup"}>
            <div className="flex items-center mx-2">
              <TbCoinFilled size={30} color="#ebb410" />
              <p className="ml-1">{user?.publicMetadata?.coin || 0}</p>
            </div>
          </Link>

          {/* Dropdown menu */}
          <LinkDropdown />
          {/* Post listing button */}
          <Link to="/create-post">
            <button
              className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-white"
              style={{
                backgroundColor: "#169976",
                ":hover": { backgroundColor: "#0f7a5a" },
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#0f7a5a")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#169976")}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng tin</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
