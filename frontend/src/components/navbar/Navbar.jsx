import { MessageCircle } from "lucide-react";
import LinkDropdown from "./LinksDropdown";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { TbCoinFilled } from "react-icons/tb";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Input } from "antd";
import ChatList from "./ChatList";
import NotificationBell from "../global/NotificationBell";
import AuthRequiredModal from "../global/AuthRequiredModal";
import { initializeSocket } from "@/utils/socket";
import { toast } from "sonner";

const Navbar = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authFeatureName, setAuthFeatureName] = useState("");
  const [coinBalance, setCoinBalance] = useState(0);
  const navigate = useNavigate();

  // Initialize coin balance from user data when loaded
  useEffect(() => {
    if (userLoaded && user) {
      setCoinBalance(user.publicMetadata?.coin || 0);
    }
  }, [user, userLoaded]);

  // Set up socket listener for coin balance updates
  useEffect(() => {
    if (!isSignedIn || !user) return;

    const socket = initializeSocket();

    // Join user's personal room for notifications
    socket.emit("join", user.id);

    // Listen for coin balance updates
    socket.on("coinUpdate", (data) => {
      if (data.userId === user.id) {
        setCoinBalance(data.newBalance);

        // Show a toast notification about the transaction
        const isCredit = data.transaction?.type === "credit";
        toast(
          isCredit ? "Coin balance increased!" : "Coin balance decreased!",
          {
            description: data.transaction?.description,
            icon: isCredit ? "💰" : "💸",
          }
        );
      }
    });

    return () => {
      socket.off("coinUpdate");
    };
  }, [isSignedIn, user]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/filter?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePostClick = (e) => {
    if (!isSignedIn) {
      e.preventDefault();
      setAuthFeatureName("đăng tin");
      setShowAuthModal(true);
    }
  };

  const handleTopUpClick = (e) => {
    if (!isSignedIn) {
      e.preventDefault();
      setAuthFeatureName("nạp coin");
      setShowAuthModal(true);
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
          <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ChatList />
          </div>

          {/* Notification Bell ✅ */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <NotificationBell />
          </div>

          {/* Coin */}
          <Link to={"/topup"} onClick={handleTopUpClick}>
            <div className="flex items-center mx-2 relative">
              <TbCoinFilled size={30} color="#ebb410" />
              <p className="ml-1">{coinBalance}</p>
            </div>
          </Link>

          {/* Dropdown menu */}
          <LinkDropdown />

          {/* Post listing button */}
          <Link to="/create-post" onClick={handlePostClick}>
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

      <AuthRequiredModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        featureName={authFeatureName}
      />
    </div>
  );
};

export default Navbar;
