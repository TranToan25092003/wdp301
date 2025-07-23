import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Row,
  Col,
  Input,
  Button,
  Select,
  Form,
  Slider,
  Card,
  Tag,
  Spin,
  Space,
  InputNumber,
  Radio,
} from "antd";
import { useLoaderData, useNavigate } from "react-router-dom";
import AuctionCard from "@/components/auction/AuctionCard";
import { getAllAuctions } from "@/API/huynt.api/auction.api";
import { filterNonDisplayableAuctions } from "@/lib/utils";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getAllCategoriesWithStats } from "@/API/duc.api/category.api";

const { Content } = Layout;
const { Title, Text } = Typography;

// Định nghĩa các mức giá phổ biến
const PRICE_RANGES = [
  { label: "Dưới 1 triệu", value: "0-1000000" },
  { label: "1 - 5 triệu", value: "1000000-5000000" },
  { label: "5 - 10 triệu", value: "5000000-10000000" },
  { label: "10 - 20 triệu", value: "10000000-20000000" },
  { label: "20 - 50 triệu", value: "20000000-50000000" },
  { label: "Trên 50 triệu", value: "50000000-999999999" },
];

export const auctionListLoader = async () => {
  try {
    const [auctionsResponse, categoriesResponse] = await Promise.all([
      getAllAuctions(),
      getAllCategoriesWithStats(),
    ]);
    return {
      auctions: auctionsResponse.auctions,
      categories: categoriesResponse.data,
    };
  } catch (error) {
    console.error("Error loading data:", error);
    return { auctions: [], categories: [] };
  }
};

const AuctionPage = () => {
  const { auctions: rawAuctions, categories } = useLoaderData();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Lọc các phiên đấu giá không hợp lệ
  const [filteredAuctions, setFilteredAuctions] = useState(
    filterNonDisplayableAuctions(rawAuctions)
  );
  const [displayedAuctions, setDisplayedAuctions] = useState(filteredAuctions);

  // State cho search và filter
  const [searchText, setSearchText] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [auctionStatus, setAuctionStatus] = useState("all");
  const [priceFilterType, setPriceFilterType] = useState("preset"); // 'preset' hoặc 'custom'
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);

  // Tìm giá cao nhất trong các phiên đấu giá để làm max của price range
  const maxPrice = Math.max(
    ...filteredAuctions.map((auction) => auction.currentPrice || 0)
  );

  const handlePriceRangeChange = (value) => {
    if (priceFilterType === "preset") {
      const [min, max] = value.split("-").map(Number);
      setPriceRange([min, max]);
    } else {
      setPriceRange(value);
    }
  };

  const handleFilter = () => {
    setLoading(true);
    let result = [...filteredAuctions];

    // Filter by search text
    if (searchText) {
      result = result.filter(
        (auction) =>
          auction.itemId?.name
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          auction.itemId?.description
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(
        (auction) => auction.itemId?.categoryId?._id === selectedCategory
      );
    }

    // Filter by price range
    result = result.filter(
      (auction) =>
        auction.currentPrice >= priceRange[0] &&
        auction.currentPrice <= priceRange[1]
    );

    // Filter by status
    const now = new Date();
    switch (auctionStatus) {
      case "active":
        result = result.filter(
          (auction) =>
            new Date(auction.startTime) <= now &&
            new Date(auction.endTime) > now
        );
        break;
      case "upcoming":
        result = result.filter((auction) => new Date(auction.startTime) > now);
        break;
      case "ended":
        result = result.filter((auction) => new Date(auction.endTime) < now);
        break;
      default:
        break;
    }

    // Sort
    switch (sortBy) {
      case "latest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "priceAsc":
        result.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case "priceDesc":
        result.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case "endingSoon":
        result.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
        break;
      case "mostBids":
        result.sort((a, b) => (b.bids?.length || 0) - (a.bids?.length || 0));
        break;
      default:
        break;
    }

    setDisplayedAuctions(result);
    setLoading(false);
  };

  // Effect để áp dụng filter khi các điều kiện thay đổi
  useEffect(() => {
    handleFilter();
  }, [searchText, selectedCategory, priceRange, sortBy, auctionStatus]);

  const resetFilters = () => {
    setSearchText("");
    setPriceRange([0, maxPrice]);
    setSelectedCategory(null);
    setSortBy("latest");
    setAuctionStatus("all");
    setPriceFilterType("preset");
    setSelectedPriceRange(null);
    form.resetFields();
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Layout style={{ backgroundColor: "#fff", padding: "20px" }}>
      <Content>
        <Row gutter={24}>
          {/* Filter Sidebar */}
          <Col span={6}>
            <Card className="filter-sidebar">
              <Title level={4}>
                <FilterOutlined /> Bộ lọc đấu giá
              </Title>
              <Form form={form} layout="vertical">
                {/* Search */}
                <Form.Item label="Tìm kiếm">
                  <Input
                    placeholder="Tên sản phẩm..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Form.Item>

                {/* Category */}
                <Form.Item label="Danh mục">
                  <Select
                    placeholder="Chọn danh mục"
                    allowClear
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                  >
                    {categories.map((cat) => (
                      <Select.Option key={cat._id} value={cat._id}>
                        {cat.title}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Price Range */}
                <Form.Item label="Khoảng giá">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Radio.Group
                      value={priceFilterType}
                      onChange={(e) => {
                        setPriceFilterType(e.target.value);
                        if (e.target.value === "preset") {
                          setSelectedPriceRange(null);
                          setPriceRange([0, maxPrice]);
                        }
                      }}
                      style={{ marginBottom: 16 }}
                    >
                      <Radio.Button value="preset">Mức giá có sẵn</Radio.Button>
                      <Radio.Button value="custom">Tùy chỉnh</Radio.Button>
                    </Radio.Group>

                    {priceFilterType === "preset" ? (
                      <Select
                        placeholder="Chọn khoảng giá"
                        style={{ width: "100%" }}
                        value={selectedPriceRange}
                        onChange={(value) => {
                          setSelectedPriceRange(value);
                          handlePriceRangeChange(value);
                        }}
                        allowClear
                      >
                        {PRICE_RANGES.map((range) => (
                          <Select.Option key={range.value} value={range.value}>
                            {range.label}
                          </Select.Option>
                        ))}
                      </Select>
                    ) : (
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <InputNumber
                          addonBefore="Từ"
                          style={{ width: "100%" }}
                          value={priceRange[0]}
                          onChange={(value) =>
                            setPriceRange([value || 0, priceRange[1]])
                          }
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                          min={0}
                          max={priceRange[1]}
                        />
                        <InputNumber
                          addonBefore="Đến"
                          style={{ width: "100%" }}
                          value={priceRange[1]}
                          onChange={(value) =>
                            setPriceRange([priceRange[0], value || maxPrice])
                          }
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                          min={priceRange[0]}
                          max={maxPrice}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Khoảng giá: {formatPrice(priceRange[0])} -{" "}
                          {formatPrice(priceRange[1])}
                        </Text>
                      </Space>
                    )}
                  </Space>
                </Form.Item>

                {/* Auction Status */}
                <Form.Item label="Trạng thái">
                  <Select value={auctionStatus} onChange={setAuctionStatus}>
                    <Select.Option value="all">Tất cả</Select.Option>
                    <Select.Option value="active">Đang diễn ra</Select.Option>
                    <Select.Option value="upcoming">Sắp diễn ra</Select.Option>
                    <Select.Option value="ended">Đã kết thúc</Select.Option>
                  </Select>
                </Form.Item>

                {/* Sort */}
                <Form.Item label="Sắp xếp theo">
                  <Select value={sortBy} onChange={setSortBy}>
                    <Select.Option value="latest">Mới nhất</Select.Option>
                    <Select.Option value="priceAsc">Giá tăng dần</Select.Option>
                    <Select.Option value="priceDesc">
                      Giá giảm dần
                    </Select.Option>
                    <Select.Option value="endingSoon">
                      Sắp kết thúc
                    </Select.Option>
                    <Select.Option value="mostBids">
                      Nhiều lượt đấu giá nhất
                    </Select.Option>
                  </Select>
                </Form.Item>

                {/* Reset Button */}
                <Button
                  icon={<ReloadOutlined />}
                  onClick={resetFilters}
                  block
                  style={{ marginTop: 16 }}
                >
                  Đặt lại bộ lọc
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Auction List */}
          <Col span={18}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spin size="large" />
              </div>
            ) : !displayedAuctions || displayedAuctions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Title level={4} style={{ color: "#666" }}>
                  Không tìm thấy phiên đấu giá nào
                </Title>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    Kết quả tìm kiếm
                  </Title>
                  <Text type="secondary">
                    Tìm thấy {displayedAuctions.length} phiên đấu giá
                  </Text>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {displayedAuctions.map((auction) => (
                    <AuctionCard
                      key={auction._id}
                      auction={auction}
                      bidCount={auction.bids ? auction.bids.length : 0}
                      onViewDetails={() => navigate(`/auctions/${auction._id}`)}
                    />
                  ))}
                </div>
              </>
            )}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default AuctionPage;
