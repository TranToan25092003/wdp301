import { Card, Col, Row } from 'antd';
import React from 'react'
import { Typography } from 'antd';
import { Tag } from 'antd';
import { Segmented } from 'antd';
const { Title, Paragraph } = Typography;

const CategoryCard = ({ title, image, tags, products }) => (
    <Card hoverable style={{ textAlign: "left", minHeight: 220 }}>
        <img src={image} alt={title} style={{ width: 50, height: 50, marginBottom: 10 }} />
        <Title level={4}>{title}</Title>
        <Paragraph>{products} Products</Paragraph>
        <div style={{ marginTop: 10 }}>
            {tags.map((tag, idx) => (
                <Tag key={idx} color="blue">{tag}</Tag>
            ))}
        </div>
    </Card>
);

const CategorySection = ({ categories }) => (
    <div style={{ padding: "40px 20px", background: "#fafafa", borderRadius: 12 }}>
        <Title level={3}>Top Exploring. <span style={{ color: "#6B7280" }}>By Niche</span></Title>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
            <Segmented options={[{ label: "Brand" }, { label: "Category" }, { label: "Store" }]} defaultValue="category" block />
        </div>
        <Row gutter={[16, 16]} justify="center">
            {categories.map((item, i) => (
                <Col xs={24} sm={12} md={8} key={i}>
                    <CategoryCard {...item} />
                </Col>
            ))}
        </Row>
    </div>
);

export { CategoryCard, CategorySection }
