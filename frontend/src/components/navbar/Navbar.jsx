import { MessageCircle } from "lucide-react";
import LinkDropdown from "./LinksDropdown";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Plus } from "lucide-react";
import { TbCoinFilled } from "react-icons/tb";
import { useUser } from "@clerk/clerk-react";
import { Input } from "antd";
import ChatList from "./ChatList";
import NotificationBell from "../global/NotificationBell"; // ✅ Đã import chuông thông báo

const Navbar = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/filter?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
              to="/sellers"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Người đăng
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
          <Input.Search
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
            enterButton={<span className="hidden sm:inline">Tìm</span>}
            size="large"
            style={{
              "--antd-wave-shadow-color": "#0F7A5A",
            }}
            className="custom-antd-search"
          />
        </div>

        <div className="flex gap-4 items-center">
          {/* Chat Icon */}
          <div className="relative cursor-pointer">
            <ChatList />
          </div>

          {/* Notification Bell ✅ */}
          <NotificationBell />

          {/* Coin */}
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
