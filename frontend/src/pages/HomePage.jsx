import React from "react";
import { Layout, Typography, Button, Row, Col, Card, Tag, Divider, Segmented } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
const { Title, Paragraph } = Typography;
import bannerImg from '../assets/banner.png';
import sample from "/assets/sample.jpg"
const { Content } = Layout;
import Banner from "../components/item/banner"
import { CategorySection } from "@/components/item/category-card";
import ItemList from "@/components/item/item-list";
import ProductList from "@/components/item/item-list";
import Footer from "@/components/global/Footer";
import { useLoaderData } from 'react-router-dom'
import { getAllItems, getRecentItems } from "@/API/duc.api/item.api";
import { useState } from "react";
import { getAllCategoriesWithStats } from "@/API/duc.api/category.api";


export const homepageLoader = async () => {
    try {
        const dataItems = await getAllItems()
        const recentItems = await getRecentItems()
        const dataCategories = await getAllCategoriesWithStats()
        return { dataItems, dataCategories, recentItems }
    } catch (error) {
        console.log(error)
    }
}

const HomePage = () => {
    const { dataItems, dataCategories, recentItems } = useLoaderData()
    const [items] = useState(dataItems.data)
    const [recent] = useState(recentItems.data)
    const [categories] = useState(dataCategories.data)
    return (
        <Layout style={{ backgroundColor: "#fff" }}>
            <Banner />
            <CategorySection categories={categories} />

            <Divider />

            {/* RECENT PRODUCTS */}
            <Content>
                <ProductList title="Recently Listed Products" products={recent} />
                <Divider />
                <ProductList title="All Products" products={items} />
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
