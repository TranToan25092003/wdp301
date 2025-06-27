import React, { useState } from "react";
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
} from "antd";
import {
  ShoppingOutlined,
  SmileOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
const { Paragraph, Title, Text } = Typography;
const { Content } = Layout;

import Banner from "../components/item/banner";
import { CategorySection } from "@/components/item/category-card";
import ProductList from "@/components/item/item-list";
import Footer from "@/components/global/Footer";

import { useLoaderData } from "react-router-dom";
import { getAllItems, getRecentItems } from "@/API/duc.api/item.api";
import { getAllCategoriesWithStats } from "@/API/duc.api/category.api";
import { useNavigate } from "react-router-dom";

export const homepageLoader = async () => {
  try {
    const dataItems = await getAllItems();
    const recentItems = await getRecentItems(1); // page 1
    const dataCategories = await getAllCategoriesWithStats();
    return { dataItems, dataCategories, recentItems };
  } catch (error) {
    console.log(error);
  }
};

const carouselData = [
  {
    img: "/assets/banner.png",
    title: "Chào mừng đến với WDP301",
    desc: "Nền tảng mua bán, đấu giá, cho mượn đồ dùng tiện lợi, an toàn và tiết kiệm.",
    cta: "Khám phá ngay",
  },
  {
    img: "/assets/sample.jpg",
    title: "Sản phẩm mới, giá tốt",
    desc: "Khám phá hàng trăm sản phẩm mới được đăng mỗi ngày.",
    cta: "Xem sản phẩm",
  },
  {
    img: "/assets/category-electronics.jpeg",
    title: "Đấu giá sôi động",
    desc: "Tham gia đấu giá để sở hữu món đồ bạn yêu thích với giá tốt nhất!",
    cta: "Tham gia đấu giá",
  },
];

const IntroSection = () => (
  <div
    style={{
      background: "#f6f9fc",
      padding: "40px 0",
      margin: "40px 0",
      borderRadius: 16,
    }}
  >
    <Row gutter={32} align="middle" justify="center">
      <Col xs={24} md={8} className="text-center">
        <SmileOutlined style={{ fontSize: 48, color: "#52c41a" }} />
        <Title level={4} style={{ marginTop: 16 }}>
          Dễ sử dụng
        </Title>
        <Text>Đăng tin, mua bán, đấu giá, cho mượn chỉ với vài thao tác.</Text>
      </Col>
      <Col xs={24} md={8} className="text-center">
        <ThunderboltOutlined style={{ fontSize: 48, color: "#faad14" }} />
        <Title level={4} style={{ marginTop: 16 }}>
          Nhanh chóng & An toàn
        </Title>
        <Text>Giao dịch minh bạch, bảo vệ người dùng tối đa.</Text>
      </Col>
      <Col xs={24} md={8} className="text-center">
        <ShoppingOutlined style={{ fontSize: 48, color: "#1890ff" }} />
        <Title level={4} style={{ marginTop: 16 }}>
          Tiết kiệm & Thông minh
        </Title>
        <Text>Mua sắm thông minh, tiết kiệm chi phí, bảo vệ môi trường.</Text>
      </Col>
    </Row>
  </div>
);

const HomePage = () => {
  // const { dataItems, dataCategories, recentItems } = useLoaderData();
  const { dataCategories, recentItems } = useLoaderData();
  const navigate = useNavigate();
  const [recent, setRecent] = useState(recentItems.data);
  const [page, setPage] = useState(2); // Page 1 loaded
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(recentItems.data.length > 0);
  const [categories] = useState(dataCategories.data);

  const handleViewMore = async () => {
    setLoading(true);
    try {
      const res = await getRecentItems(page);
      if (res.data.length > 0) {
        setRecent((prev) => [...prev, ...res.data]);
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
    <Layout style={{ background: "#f6f9fc" }}>
      {/* Carousel Banner */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 0" }}>
        <Carousel
          autoplay
          dots
          draggable
          style={{ borderRadius: 16, overflow: "hidden" }}
        >
          {carouselData.map((slide, idx) => (
            <div key={idx}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#fff",
                  borderRadius: 16,
                  minHeight: 320,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                  overflow: "hidden",
                  padding: 32,
                }}
              >
                <img
                  src={slide.img}
                  alt={slide.title}
                  style={{
                    width: 320,
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 12,
                    marginRight: 32,
                  }}
                />
                <div>
                  <Title level={2} style={{ marginBottom: 8 }}>
                    {slide.title}
                  </Title>
                  <Paragraph style={{ fontSize: 18 }}>{slide.desc}</Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    style={{ marginTop: 12 }}
                    onClick={() => navigate("/filter")}
                  >
                    {slide.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Danh mục sản phẩm */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 0" }}>
        <Title level={3} style={{ marginBottom: 24, textAlign: "center" }}>
          Khám phá danh mục
        </Title>
        <Row
          gutter={[32, 32]}
          justify="center"
          align="middle"
          style={{ minHeight: 200 }}
        >
          {categories.map((cat) => (
            <Col
              xs={24}
              sm={12}
              md={8}
              lg={6}
              xl={4}
              key={cat._id}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Card
                hoverable
                style={{
                  width: 140,
                  minHeight: 180,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  borderRadius: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0",
                  transition: "transform 0.2s",
                  padding: 12,
                }}
                bodyStyle={{ padding: 0 }}
                onClick={() => navigate(`/category/${cat._id}`)}
              >
                <img
                  src={cat.image || "/assets/fallback.png"}
                  alt={cat.title}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 12,
                    margin: "0 auto 12px auto",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: 16,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                  }}
                >
                  {cat.title}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <Divider />

      {/* Sản phẩm mới nhất */}
      <Content
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        <Title level={3} style={{ marginBottom: 24 }}>
          Sản phẩm mới đăng
        </Title>
        <ProductList
          title=""
          products={recent}
          onViewAll={() => navigate("/filter")}
        />
        {hasMore && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button
              onClick={handleViewMore}
              loading={loading}
              style={{ backgroundColor: "#8AE5CD" }}
            >
              Xem thêm
            </Button>
          </div>
        )}
        {!hasMore && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Paragraph>Không còn sản phẩm nào để hiển thị.</Paragraph>
          </div>
        )}
      </Content>

      {/* Section giới thiệu */}
      <IntroSection />

      <Divider />
      <div style={{ textAlign: "center", padding: 30 }}>
        <ShoppingOutlined style={{ fontSize: 28 }} />
        <Paragraph>Smart and budget-friendly second-hand shopping</Paragraph>
      </div>
    </Layout>
  );
};

export default HomePage;
