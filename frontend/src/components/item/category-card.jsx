import { Card, Col, Row, Tag, Typography, Segmented } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
const { Title, Paragraph } = Typography;

const CategoryCard = ({ id, title, image, tags, products }) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      onClick={() => navigate(`/category/${id}`)}
      style={{ textAlign: "left", minHeight: 220 }}
    >
      <img
        src={image}
        alt={title}
        style={{ width: 50, height: 50, marginBottom: 10 }}
      />
      <Title level={4}>{title}</Title>
      <Paragraph>{products} Products</Paragraph>
      <div style={{ marginTop: 10 }}>
        {tags.map((tag, idx) => (
          <Tag key={idx} color="blue">
            {tag}
          </Tag>
        ))}
      </div>
    </Card>
  );
};

const CategorySection = ({ categories }) => (
  <div
    style={{ padding: "40px 20px", background: "#fafafa", borderRadius: 12 }}
  >
    <Title level={3}>
      Top Exploring. <span style={{ color: "#6B7280" }}>By Niche</span>
    </Title>
    <div
      style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}
    >
      <Segmented
        options={[
          { label: "Brand" },
          { label: "Category" },
          { label: "Store" },
        ]}
        defaultValue="category"
        block
      />
    </div>
    <Row gutter={[16, 16]} justify="center">
      {categories.map((item, i) => (
        <Col xs={24} sm={12} md={8} key={item._id}>
          <CategoryCard
            id={item._id}
            title={item.title}
            image={item.image}
            tags={item.tags}
            products={item.products}
          />
        </Col>
      ))}
    </Row>
  </div>
);

export { CategoryCard, CategorySection };
