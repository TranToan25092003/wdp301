import React from "react";
import { Layout, Typography, Button, Row, Col, Card, Tag, Divider, Segmented } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
const { Title, Paragraph } = Typography;
import bannerImg from '../assets/banner.png';
import sample from "../assets/sample.jpg"
const { Content } = Layout;
import Banner from "../components/item/banner"
import { CategorySection } from "@/components/item/category-card";
import ItemList from "@/components/item/item-list";
import ProductList from "@/components/item/item-list";
import Footer from "@/components/global/Footer";

// Fake product data
const recentProducts = [
    { id: 1, name: "Used HP Laptop", price: "$220", image: sample, tags: ["90%"] },
    { id: 2, name: "LG 40-inch TV", price: "$145", image: sample, tags: ["80%"] },
];

const allProducts = [
    ...recentProducts,
    { id: 3, name: "Toshiba Washing Machine", price: "$130", image: sample, tags: ["85%"] },
    { id: 4, name: "Samsung A71 Phone", price: "$150", image: sample, tags: ["88%"] },
];

const categories = [
    {
        title: "Shoes",
        image: sample,
        tags: ["fashion", "durability", "comfort", "style", "footwear"],
        products: 3,
    },
    {
        title: "Electronic",
        image: sample,
        tags: ["sustainability", "connectivity", "innovation"],
        products: 3,
    },
    {
        title: "Sports",
        image: sample,
        tags: ["community", "entertainment", "competition", "unity"],
        products: 3,
    },
];

const items = [
    {
        _id: "item001",
        name: "Asus Vivobook Laptop",
        category: "Computers",
        images: [sample],
        description: "A powerful laptop suitable for work and study.",
        price: 100,
        rate: "day",
        isFree: false,
        status: "available",
    },
    {
        _id: "item002",
        name: "Basketball",
        category: "Sports",
        images: [sample],
        description: "Standard size basketball. Good grip and durability.",
        price: 5,
        rate: "hour",
        isFree: true,
        status: "available",
    },
    {
        _id: "item003",
        name: "Canon DSLR Camera",
        category: "Photography",
        images: [sample],
        description: "Great for shooting photos and videos. Includes lens.",
        price: 30,
        rate: "day",
        isFree: false,
        status: "not-available",
    },
];


const HomePage = () => {
    return (
        <Layout style={{ backgroundColor: "#fff" }}>
            <Banner />
            <CategorySection categories={categories} />

            <Divider />

            {/* RECENT PRODUCTS */}
            <Content>
                <ProductList title="Recently Listed Products" products={recentProducts} tagColor="green" />
                <Divider />
                <ProductList title="All Products" products={allProducts} tagColor="blue" />
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
