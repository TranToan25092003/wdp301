import React, { useState, useEffect } from "react";
import { Layout, Typography, Divider, Button, Spin, notification } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
const { Paragraph } = Typography;
const { Content } = Layout;

import Banner from "../components/item/banner";
import { CategorySection } from "@/components/item/category-card";
import ProductList from "@/components/item/item-list";
import Footer from "@/components/global/Footer";

import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { getAllItems, getRecentItems } from "@/API/duc.api/item.api";
import { getAllCategoriesWithStats } from "@/API/duc.api/category.api";

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

const HomePage = () => {
  const { dataCategories, recentItems } = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  const [api, contextHolder] = notification.useNotification();
  const [recent, setRecent] = useState(recentItems.data);
  const [page, setPage] = useState(2); // Page 1 loaded
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(recentItems.data.length > 0);
  const [categories] = useState(dataCategories.data);

  useEffect(() => {
    if (location.state && location.state.postSuccess) {
      api.success({
        message: "Đăng tin thành công!",
        description: "Sản phẩm của bạn đã được đăng lên hệ thống.",
        placement: "bottomRight",
        duration: 4,
      });
      // Xoá state để không hiện lại khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, api]);

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
    <Layout style={{ backgroundColor: "#fff" }}>
      {contextHolder}
      <Banner />
      <CategorySection categories={categories} />
      <Divider />

      <Content>
        <ProductList
          title="Recently Listed Products"
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
              View More
            </Button>
          </div>
        )}
        {!hasMore && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Paragraph>No more products to show.</Paragraph>
          </div>
        )}
      </Content>

      <Divider />
      <div style={{ textAlign: "center", padding: 30 }}>
        <ShoppingOutlined style={{ fontSize: 28 }} />
        <Paragraph>Smart and budget-friendly second-hand shopping</Paragraph>
      </div>
    </Layout>
  );
};

export default HomePage;
