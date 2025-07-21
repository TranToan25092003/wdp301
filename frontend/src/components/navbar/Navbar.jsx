import { MessageCircle } from "lucide-react";
import LinkDropdown from "./LinksDropdown";
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
    <div className="border-b w-full bg-gradient-to-r from-green-900 to-green-700 text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:justify-between lg:items-center flex-wrap gap-4 py-2">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                <span className="text-green-300">OLD</span>
                <span className="text-white font-light italic">WAYS</span>
              </h1>
              <div className="text-xs text-green-200 ml-2 border-l border-green-400 pl-2">
                Nơi Trao Đổi
                <br />
                Đồ Cũ Tin Cậy
              </div>
            </div>
          </Link>

          {/* Navigation tabs */}
          <nav className="hidden md:flex items-center gap-6 ml-8">
            <Link
              to="/"
              className="text-white hover:text-green-200 font-medium transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              to="/auctions"
              className="text-white hover:text-green-200 font-medium transition-colors"
            >
              Đấu giá
            </Link>
            <Link
              to="/sellers"
              className="text-white hover:text-green-200 font-medium transition-colors"
            >
              Người bán
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-green-200 font-medium transition-colors"
            >
              Giới thiệu
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
              "--antd-wave-shadow-color": "#166534",
            }}
            className="custom-antd-search"
          />
        </div>

        <div className="flex gap-4 items-center">
          {/* Chat Icon */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-800 transition-colors">
            <ChatList />
          </div>

          {/* Notification Bell ✅ */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-800 transition-colors">
            <NotificationBell />
          </div>

          {/* Coin */}
          <Link to={"/topup"} onClick={handleTopUpClick}>
            <div className="flex items-center mx-2 relative text-white">
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
                backgroundColor: "#15803d",
                ":hover": { backgroundColor: "#166534" },
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#166534")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#15803d")}
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
