import React from "react";
import { Layout, Typography, Button, Row, Col, Card, Tag, Divider, Segmented } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
const { Title, Paragraph } = Typography;
import bannerImg from '../assets/banner.png';
const { Content } = Layout;

// Fake product data
const recentProducts = [
    { id: 1, name: "Used HP Laptop", price: "$220", image: "https://via.placeholder.com/200x150", tags: ["90%"] },
    { id: 2, name: "LG 40-inch TV", price: "$145", image: "https://via.placeholder.com/200x150", tags: ["80%"] },
];

const allProducts = [
    ...recentProducts,
    { id: 3, name: "Toshiba Washing Machine", price: "$130", image: "https://via.placeholder.com/200x150", tags: ["85%"] },
    { id: 4, name: "Samsung A71 Phone", price: "$150", image: "https://via.placeholder.com/200x150", tags: ["88%"] },
];

const categories = [
    {
        title: "Shoes",
        image: "https://via.placeholder.com/50x50?text=Shoes",
        tags: ["fashion", "durability", "comfort", "style", "footwear"],
        products: 3,
    },
    {
        title: "Electronic",
        image: "https://via.placeholder.com/50x50?text=Electronic",
        tags: ["sustainability", "connectivity", "innovation"],
        products: 3,
    },
    {
        title: "Sports",
        image: "https://via.placeholder.com/50x50?text=Sports",
        tags: ["community", "entertainment", "competition", "unity"],
        products: 3,
    },
];

const HomePage = () => {
    return (
        <Layout style={{ backgroundColor: "#fff" }}>
            {/* BANNER */}
            <div style={{ backgroundColor: "#1DCD9F", padding: "50px 100px", borderRadius: 12 }}>
                <Row justify="center" align="middle">
                    <Col xs={24} md={12}>
                        <Title style={{ fontSize: 42 }}>Second-hand<br />Marketplace</Title>
                        <Paragraph>Buy – Sell – Save more</Paragraph>
                        <Button style={{ backgroundColor: "black", color: "white" }} size="large" >Start Browsing</Button>
                    </Col>
                    <Col xs={24} md={12}>
                        <img src={bannerImg} alt="banner" style={{ width: "80%" }} />
                    </Col>
                </Row>
            </div>

            {/* CATEGORY SECTION */}
            <div style={{ padding: "40px 20px", background: "#fafafa", borderRadius: 12 }}>
                <Title level={3}>
                    Top Exploring. <span style={{ color: "#6B7280" }}>By Niche</span>
                </Title>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
                    <Segmented
                        options={[
                            { label: "Brand", value: "brand" },
                            { label: "Category", value: "category" },
                            { label: "Store", value: "store" },
                        ]}
                        defaultValue="category"
                        block
                    />
                </div>

                <Row gutter={[16, 16]} justify="center">
                    {categories.map((item, i) => (
                        <Col xs={24} sm={12} md={8} key={i}>
                            <Card
                                bordered
                                hoverable
                                style={{ textAlign: "center", minHeight: 220 }}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    style={{ width: 50, height: 50, marginBottom: 10 }}
                                />
                                <Title level={4}>{item.title}</Title>
                                <Paragraph>{item.products} Products</Paragraph>
                                <div style={{ marginTop: 10 }}>
                                    {item.tags.map((tag, idx) => (
                                        <Tag key={idx} color="blue">
                                            {tag}
                                        </Tag>
                                    ))}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <Divider />

            {/* RECENT PRODUCTS */}
            <Content>
                <Title level={3}>🆕 Recently Listed Products</Title>
                <Row gutter={[16, 16]}>
                    {recentProducts.map((item) => (
                        <Col xs={24} sm={12} md={6} key={item.id}>
                            <Card
                                hoverable
                                cover={<img src={item.image} alt={item.name} />}
                            >
                                <Card.Meta
                                    title={item.name}
                                    description={
                                        <>
                                            <Paragraph strong>{item.price}</Paragraph>
                                            {item.tags.map((tag, i) => (
                                                <Tag color="green" key={i}>{tag}</Tag>
                                            ))}
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Divider />

                {/* ALL PRODUCTS */}
                <Title level={3}>📦 All Products</Title>
                <Row gutter={[16, 16]}>
                    {allProducts.map((item) => (
                        <Col xs={24} sm={12} md={6} key={item.id}>
                            <Card
                                hoverable
                                cover={<img src={item.image} alt={item.name} />}
                            >
                                <Card.Meta
                                    title={item.name}
                                    description={
                                        <>
                                            <Paragraph strong>{item.price}</Paragraph>
                                            {item.tags.map((tag, i) => (
                                                <Tag color="blue" key={i}>{tag}</Tag>
                                            ))}
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
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
