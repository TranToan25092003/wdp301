import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Divider,
  Button,
  Spin,
  Carousel,
  Row,
  Col,
  Card,
  Tag,
  notification,
  Image,
} from "antd";
import {
  ShoppingOutlined,
  SmileOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  SafetyOutlined,
  StarOutlined,
  TrophyOutlined,
  DollarOutlined,
  GiftOutlined,
  FireOutlined,
  RocketOutlined,
  TagOutlined,
} from "@ant-design/icons";
const { Paragraph, Title, Text } = Typography;
const { Content } = Layout;

import Banner from "../components/item/banner";
import { CategorySection } from "@/components/item/category-card";
import ProductList from "@/components/item/item-list";
import Footer from "@/components/global/Footer";
import CountdownTimer from "@/components/auction/CountdownTimer";

import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { getAllItems, getRecentItems } from "@/API/duc.api/item.api";
import { getAllCategoriesWithStats } from "@/API/duc.api/category.api";
import {
  getAllAuctions,
  getAuctionByItemId,
} from "@/API/huynt.api/auction.api";
import AuctionCard from "@/components/auction/AuctionCard";
import { filterNonDisplayableItems } from "@/lib/utils";

export const homepageLoader = async () => {
  try {
    const dataItems = await getAllItems();
    const recentItems = await getRecentItems(1); // page 1
    const dataCategories = await getAllCategoriesWithStats();
    const auctionsData = await getAllAuctions();
    return { dataItems, dataCategories, recentItems, auctionsData };
  } catch (error) {
    console.log(error);
  }
};

// Hero Section with animated items
const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-green-900 to-green-700 rounded-3xl py-16 px-6 md:px-12 my-8">
      {/* Animated circles in background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute w-72 h-72 rounded-full bg-green-500 opacity-10 -top-10 -right-10 animate-pulse"></div>
        <div className="absolute w-96 h-96 rounded-full bg-green-600 opacity-10 -bottom-20 -left-20"></div>
        <div
          className="absolute w-48 h-48 rounded-full bg-green-400 opacity-10 bottom-20 right-20 animate-bounce"
          style={{ animationDuration: "5s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <Row gutter={[48, 32]} align="middle">
          <Col xs={24} md={14} lg={12}>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              style={{
                color: "#ffffff",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              OldWays -{" "}
              <span
                className="text-green-300"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
              >
                Chợ Đồ Cũ
              </span>{" "}
              Trực Tuyến Hàng Đầu
            </h1>
            <p
              className="text-xl md:text-2xl mb-8"
              style={{
                color: "#ffffff",
                textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              Nền tảng mua bán, đấu giá, cho mượn đồ cũ với giá trị hơn 10.000
              đồ
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                type="primary"
                size="large"
                onClick={() => (window.location.href = "/auctions")}
                style={{
                  background: "#4ade80",
                  borderColor: "#22c55e",
                  color: "#052e16",
                  fontWeight: 600,
                  height: 50,
                  width: 180,
                  fontSize: 16,
                }}
                icon={<TrophyOutlined />}
              >
                Đấu giá ngay
              </Button>
              <Button
                size="large"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  borderColor: "#4ade80",
                  color: "#166534",
                  fontWeight: 600,
                  height: 50,
                  width: 180,
                  fontSize: 16,
                }}
                icon={<FireOutlined />}
              >
                Khám phá sản phẩm
              </Button>
            </div>
          </Col>

          <Col xs={24} md={10} lg={12}>
            <div className="relative">
              {/* Floating main image */}
              <img
                src="assets/iphone-15-1.jpg"
                alt="Featured product"
                className="rounded-xl shadow-2xl mx-auto object-cover h-80 w-80 border-4 border-white"
                style={{ transform: "rotate(3deg)" }}
                onError={(e) => {
                  e.target.src = "assets/fallback.png";
                }}
              />

              {/* Floating secondary images */}
              <img
                src="assets/dell-g3-2.jpg"
                alt="Dell laptop"
                className="absolute -bottom-6 -left-10 w-40 h-40 object-cover rounded-lg shadow-lg border-2 border-white"
                style={{ transform: "rotate(-8deg)" }}
                onError={(e) => {
                  e.target.src = "assets/fallback.png";
                }}
              />

              <img
                src="assets/table.jpg"
                alt="Furniture"
                className="absolute -top-4 -right-6 w-32 h-32 object-cover rounded-lg shadow-lg border-2 border-white"
                style={{ transform: "rotate(8deg)" }}
                onError={(e) => {
                  e.target.src = "assets/fallback.png";
                }}
              />

              {/* Price tags */}
              <div className="absolute top-20 right-0 bg-white text-green-800 font-bold py-2 px-4 rounded-full shadow-lg">
                -30% Giảm
              </div>

              <div className="absolute bottom-12 right-4 bg-white text-amber-800 font-bold py-2 px-4 rounded-full shadow-lg animate-pulse">
                Đấu giá sôi động
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 text-center">
            <div
              className="text-4xl font-bold mb-2"
              style={{
                color: "#22c55e",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              150+
            </div>
            <div
              className="text-green-500 font-medium"
              style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}
            >
              Sản phẩm đang bán
            </div>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 text-center">
            <div
              className="text-4xl font-bold mb-2"
              style={{
                color: "#22c55e",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              500+
            </div>
            <div
              className="text-green-500 font-medium"
              style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}
            >
              Phiên đấu giá thành công
            </div>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 text-center">
            <div
              className="text-4xl font-bold mb-2"
              style={{
                color: "#22c55e",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              100+
            </div>
            <div
              className="text-green-500 font-medium"
              style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}
            >
              Khách hàng hài lòng
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// New Feature Showcase section
const FeatureShowcase = () => (
  <div className="py-12 bg-gradient-to-r from-green-50 to-green-100 rounded-3xl overflow-hidden relative mb-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-green-800 mb-4">
          Các Cách Mua Sắm Tại OldWays
        </h2>
        <p className="text-green-700 text-lg max-w-3xl mx-auto">
          OldWays cung cấp đa dạng phương thức để bạn mua sắm thông minh và tiết
          kiệm
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Đấu giá */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-5 mx-auto">
            <TrophyOutlined style={{ fontSize: 28, color: "#16a34a" }} />
          </div>
          <h3 className="text-xl font-bold text-green-800 text-center mb-3">
            Đấu Giá
          </h3>
          <p className="text-green-700 mb-4 text-center">
            Tham gia đấu giá hấp dẫn để săn sản phẩm với giá tốt nhất
          </p>
          <div className="text-center">
            <Button
              onClick={() => (window.location.href = "/auctions")}
              type="primary"
              size="large"
              style={{
                background: "linear-gradient(135deg, #166534 0%, #22c55e 100%)",
                borderColor: "#16a34a",
              }}
            >
              Xem đấu giá
            </Button>
          </div>
        </div>

        {/* Mua ngay */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-5 mx-auto">
            <DollarOutlined style={{ fontSize: 28, color: "#16a34a" }} />
          </div>
          <h3 className="text-xl font-bold text-green-800 text-center mb-3">
            Mua Ngay
          </h3>
          <p className="text-green-700 mb-4 text-center">
            Mua hàng trực tiếp không cần chờ đợi, giao dịch nhanh chóng
          </p>
          <div className="text-center">
            <Button
              onClick={() => (window.location.href = "/filter")}
              type="primary"
              size="large"
              style={{
                background: "linear-gradient(135deg, #166534 0%, #22c55e 100%)",
                borderColor: "#16a34a",
              }}
            >
              Mua sắm
            </Button>
          </div>
        </div>

        {/* Cho mượn */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-5 mx-auto">
            <GiftOutlined style={{ fontSize: 28, color: "#16a34a" }} />
          </div>
          <h3 className="text-xl font-bold text-green-800 text-center mb-3">
            Cho Mượn
          </h3>
          <p className="text-green-700 mb-4 text-center">
            Mượn đồ bạn cần trong thời gian ngắn với chi phí thấp
          </p>
          <div className="text-center">
            <Button
              onClick={() => (window.location.href = "/filter")}
              type="primary"
              size="large"
              style={{
                background: "linear-gradient(135deg, #166534 0%, #22c55e 100%)",
                borderColor: "#16a34a",
              }}
            >
              Xem đồ cho mượn
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Trending Products Section
const TrendingProductsSection = ({ items = [] }) => {
  const navigate = useNavigate();

  // Lọc và sắp xếp items để ưu tiên hiển thị items đấu giá
  const getTrendingItems = () => {
    // Tách items thành 2 mảng: đấu giá và không đấu giá
    const auctionItems = items.filter(
      (item) => item.typeId?.name?.toLowerCase() === "auction"
    );
    const nonAuctionItems = items.filter(
      (item) => item.typeId?.name?.toLowerCase() !== "auction"
    );

    // Sắp xếp items đấu giá theo số lượng bid (nếu có) hoặc thời gian tạo
    const sortedAuctionItems = auctionItems.sort((a, b) => {
      if (b.bids?.length !== a.bids?.length) {
        return (b.bids?.length || 0) - (a.bids?.length || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Sắp xếp items không đấu giá theo thời gian tạo
    const sortedNonAuctionItems = nonAuctionItems.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Kết hợp 2 mảng, ưu tiên items đấu giá
    return [...sortedAuctionItems, ...sortedNonAuctionItems].slice(0, 3);
  };

  const trendingItems = getTrendingItems();

  const handleItemClick = async (item) => {
    try {
      if (item.typeId?.name?.toLowerCase() === "auction") {
        // Lấy auction từ itemId
        const response = await getAuctionByItemId(item._id);
        console.log("response", response);
        if (response.auction) {
          navigate(`/auctions/${response.auction._id}`);
          return;
        }
      }
      // Nếu không phải auction hoặc không tìm thấy auction, điều hướng đến trang item
      navigate(`/item/${item._id}`);
    } catch (error) {
      console.error("Error handling item click:", error);
      // Fallback to item page if there's an error
      navigate(`/item/${item._id}`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (trendingItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-16 bg-white rounded-3xl py-12 px-8 shadow-lg">
      <div className="text-center mb-10">
        <Tag color="#16a34a" className="text-base px-4 py-1 mb-4">
          <FireOutlined /> Xu hướng
        </Tag>
        <h2 className="text-3xl font-bold text-green-800 mb-4">
          Sản Phẩm Nổi Bật
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Những sản phẩm được quan tâm nhiều nhất trên nền tảng OldWays trong
          thời gian gần đây
        </p>
      </div>

      <Row gutter={[32, 32]}>
        {trendingItems.map((item) => (
          <Col xs={24} sm={12} md={8} key={item._id}>
            <Card
              hoverable
              onClick={() => handleItemClick(item)}
              className="overflow-hidden rounded-xl border border-gray-200"
              cover={
                <div className="relative">
                  <img
                    alt={item.name}
                    src={item.images?.[0] || "/fallback.jpg"}
                    className="h-64 w-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Tag
                      color={
                        item.typeId?.name?.toLowerCase() === "auction"
                          ? "#f59e0b"
                          : "#10b981"
                      }
                      className="px-3 py-1"
                    >
                      {item.typeId?.name?.toLowerCase() === "auction"
                        ? "Đấu giá sôi động"
                        : "Mới đăng"}
                    </Tag>
                  </div>
                  {item.typeId?.name?.toLowerCase() === "auction" &&
                    item.bids?.length > 0 && (
                      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                        {item.bids.length} lượt đấu giá
                      </div>
                    )}
                </div>
              }
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {item.name}
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-green-700 font-bold">
                  {formatPrice(item.price)}
                </span>
                <Button
                  type="primary"
                  size="middle"
                  className="bg-green-600 hover:bg-green-700 border-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item);
                  }}
                >
                  Xem chi tiết
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="text-center mt-12">
        <Button
          type="default"
          size="large"
          onClick={() => navigate("/filter")}
          className="px-8 h-12 border-green-600 text-green-700 hover:text-green-800 hover:border-green-800"
        >
          Xem tất cả sản phẩm nổi bật
        </Button>
      </div>
    </div>
  );
};

// Featured Auctions Section
const FeaturedAuctionsSection = ({ auctions = [] }) => {
  const navigate = useNavigate();

  if (!auctions || auctions.length === 0) {
    return null;
  }

  // Get only top 4 auctions to display
  const featuredAuctions = auctions.slice(0, 4);

  return (
    <div className="mb-16 bg-green-50 py-10 px-4 md:px-8 rounded-3xl">
      <div className="text-center mb-8">
        <Title
          level={2}
          style={{
            color: "#166534",
            fontWeight: 700,
          }}
        >
          Đấu Giá Nổi Bật
        </Title>
        <Text
          style={{
            fontSize: 18,
            color: "#166534",
            display: "block",
            marginTop: 12,
          }}
        >
          Cơ hội săn đồ cũ giá tốt - Hãy đặt giá ngay!
        </Text>
      </div>

      <div className="flex flex-col gap-4">
        {featuredAuctions.map((auction) => (
          <div
            key={auction._id}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer"
            onClick={() => navigate(`/auctions/${auction._id}`)}
          >
            <div className="flex flex-col md:flex-row gap-5">
              {/* Image */}
              <div className="relative w-full md:w-[280px] h-[200px] flex-shrink-0">
                <img
                  src={auction.itemId?.images?.[0] || "/assets/fallback.png"}
                  alt={auction.itemId?.name}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute top-3 right-3">
                  <Tag color="#16a34a" className="font-bold px-3 py-1">
                    ĐANG ĐẤU GIÁ
                  </Tag>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {auction.itemId?.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {auction.itemId?.description?.slice(0, 150) || ""}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500">Giá hiện tại:</div>
                      <div className="text-lg font-bold text-green-700">
                        {auction.currentPrice.toLocaleString()} ₫
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Kết thúc sau:</div>
                      <div className="text-base font-semibold text-orange-600">
                        <CountdownTimer
                          endTime={auction.endTime}
                          startTime={auction.startTime}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Lượt đấu giá:</div>
                      <div className="text-base font-semibold text-blue-600">
                        {auction.bids?.length || 0} lượt
                      </div>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    style={{
                      background:
                        "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
                      border: "none",
                      fontWeight: 600,
                      height: "40px",
                      borderRadius: "10px",
                    }}
                  >
                    Đấu giá ngay
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button
          type="primary"
          size="large"
          onClick={() => navigate("/auctions")}
          style={{
            background: "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
            border: "none",
            borderRadius: 16,
            height: 48,
            fontSize: 16,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(22, 101, 52, 0.3)",
          }}
        >
          Xem tất cả phiên đấu giá
        </Button>
      </div>
    </div>
  );
};

// OldWays Benefits Section - Using similar design to what the user shared
const BenefitsSection = () => (
  <div className="bg-green-800 rounded-3xl py-14 px-8 mb-16">
    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
      {/* Benefit 1 */}
      <div className="bg-green-50 rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <SmileOutlined style={{ fontSize: 48, color: "#16a34a" }} />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-3">Dễ sử dụng</h3>
        <p className="text-green-700">
          Đăng tin, mua bán, đấu giá, cho mượn chỉ với vài thao tác đơn giản.
        </p>
      </div>

      {/* Benefit 2 */}
      <div className="bg-green-50 rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <ThunderboltOutlined style={{ fontSize: 48, color: "#16a34a" }} />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-3">
          Nhanh chóng & An toàn
        </h3>
        <p className="text-green-700">
          Giao dịch minh bạch, bảo vệ người dùng tối đa với hệ thống bảo mật
          tiên tiến.
        </p>
      </div>

      {/* Benefit 3 */}
      <div className="bg-green-50 rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <ShoppingOutlined style={{ fontSize: 48, color: "#16a34a" }} />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-3">
          Tiết kiệm & Thông minh
        </h3>
        <p className="text-green-700">
          Mua sắm thông minh, tiết kiệm chi phí, bảo vệ môi trường xanh sạch.
        </p>
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const { dataCategories, recentItems, auctionsData } = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  const [recent, setRecent] = useState(
    filterNonDisplayableItems(recentItems.data)
  );
  const [page, setPage] = useState(2); // Page 1 loaded
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(recentItems.data.length > 0);
  const [categories] = useState(dataCategories.data);
  const [auctions] = useState(
    filterNonDisplayableItems(auctionsData?.auctions || [])
  );
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (location.state?.created) {
      // Remove the success notification here
      // Xóa state để reload không hiện lại
      window.history.replaceState({}, document.title);
    }
  }, [location.state, api]);

  const handleViewMore = async () => {
    setLoading(true);
    try {
      const res = await getRecentItems(page);
      const newItems = filterNonDisplayableItems(res.data);
      if (newItems.length > 0) {
        setRecent((prev) => [...prev, ...newItems]);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false); // No more data
      }
    } catch (err) {
      console.error("Error loading more recent items:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      style={{
        background: "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)",
        minHeight: "100vh",
      }}
    >
      {contextHolder}

      {/* Hero Section */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
        <HeroSection />
      </div>

      {/* Feature Showcase Section */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <BenefitsSection />
      </div>

      {/* Featured Auctions Section */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <FeaturedAuctionsSection auctions={auctions} />
      </div>

      {/* Trending Products Section */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <TrendingProductsSection items={recent} />
      </div>

      {/* Danh mục sản phẩm */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title
            level={2}
            style={{ marginBottom: 8, color: "#166534", fontWeight: 700 }}
          >
            Khám phá danh mục
          </Title>
          <Text style={{ fontSize: 16, color: "#166534" }}>
            Chọn danh mục phù hợp với nhu cầu của bạn
          </Text>
        </div>

        <div className="w-full bg-green-50 rounded-xl p-5">
          <div className="flex justify-between gap-3">
            {/* Hiển thị tối đa 8 danh mục phổ biến nhất */}
            {categories.slice(0, 8).map((cat) => (
              <div
                key={cat._id}
                className="flex flex-col items-center bg-white rounded-xl p-3 cursor-pointer hover:bg-green-100 transition-all w-[120px]"
                onClick={() => navigate(`/category/${cat._id}`)}
              >
                <div
                  className="w-12 h-12 rounded-full mb-2 bg-cover bg-center border-2 border-green-500"
                  style={{
                    backgroundImage: `url(${
                      cat.image || "/assets/fallback.png"
                    })`,
                  }}
                ></div>
                <div className="text-center">
                  <div className="font-medium text-xs text-green-700 line-clamp-2 h-8 flex items-center justify-center">
                    {/* Rút gọn tên danh mục nếu là "Sách & Phương tiện truyền thông" */}
                    {cat.title.includes("Phương tiện truyền thông")
                      ? cat.title.replace(
                          "Phương tiện truyền thông",
                          "Truyền thông"
                        )
                      : cat.title}
                  </div>
                  <span className="text-xs text-green-600">
                    {cat.products || 0} SP
                  </span>
                </div>
              </div>
            ))}

            {categories.length > 8 && (
              <div
                className="flex flex-col items-center justify-center bg-green-100 rounded-xl p-3 cursor-pointer hover:bg-green-200 transition-all w-[120px]"
                onClick={() => navigate("/filter")}
              >
                <div className="w-12 h-12 rounded-full mb-2 flex items-center justify-center bg-green-200 text-green-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="font-medium text-xs text-green-700">
                    Xem thêm
                  </div>
                  <span className="text-xs text-green-600">
                    {categories.length - 8} danh mục
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sản phẩm mới nhất */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        <Content
          style={{
            background: "white",
            borderRadius: 24,
            padding: 48,
            boxShadow: "0 20px 40px rgba(22,101,52,0.08)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Title
              level={2}
              style={{ marginBottom: 16, color: "#166534", fontWeight: 700 }}
            >
              Sản phẩm mới đăng
            </Title>
            <Text style={{ fontSize: 18, color: "#16a34a" }}>
              Khám phá những sản phẩm mới nhất được đăng trên nền tảng
            </Text>
          </div>
          <ProductList
            title=""
            products={recent}
            onViewAll={() => navigate("/filter")}
          />
          {hasMore && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Button
                onClick={handleViewMore}
                loading={loading}
                size="large"
                style={{
                  background:
                    "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
                  border: "none",
                  borderRadius: 16,
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                  boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
                }}
              >
                Xem thêm sản phẩm
              </Button>
            </div>
          )}
          {!hasMore && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  borderRadius: 16,
                  padding: 32,
                  border: "2px dashed #86efac",
                }}
              >
                <HeartOutlined
                  style={{ fontSize: 48, color: "#16a34a", marginBottom: 16 }}
                />
                <Paragraph
                  style={{ color: "#15803d", fontSize: 16, margin: 0 }}
                >
                  Không còn sản phẩm nào để hiển thị.
                </Paragraph>
              </div>
            </div>
          )}
        </Content>
      </div>

      {/* Footer section */}
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
          color: "white",
          marginTop: 60,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Row gutter={[32, 32]} align="middle" justify="center">
            <Col xs={24} md={8}>
              <StarOutlined
                style={{ fontSize: 32, color: "#a3e635", marginBottom: 16 }}
              />
              <Title level={4} style={{ color: "white", marginBottom: 8 }}>
                Chất lượng đảm bảo
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                Tất cả sản phẩm đều được kiểm duyệt chất lượng
              </Text>
            </Col>
            <Col xs={24} md={8}>
              <SafetyOutlined
                style={{ fontSize: 32, color: "#bef264", marginBottom: 16 }}
              />
              <Title level={4} style={{ color: "white", marginBottom: 8 }}>
                Giao dịch an toàn
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                Bảo vệ thông tin và tài khoản của bạn
              </Text>
            </Col>
            <Col xs={24} md={8}>
              <ShoppingOutlined
                style={{ fontSize: 32, color: "#d9f99d", marginBottom: 16 }}
              />
              <Title level={4} style={{ color: "white", marginBottom: 8 }}>
                Tiết kiệm thông minh
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                Mua sắm thông minh, bảo vệ môi trường
              </Text>
            </Col>
          </Row>
        </div>
      </div>

      <style jsx>{`
        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(22, 101, 52, 0.15);
        }
      `}</style>
    </Layout>
  );
};

export default HomePage;
