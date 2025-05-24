import React from 'react';
import { Col, Row, Typography, Tag } from 'antd';
const { Title, Paragraph } = Typography;

function CategoryBanner({ title, description, image, tags = [] }) {
    return (
        <div style={{ backgroundColor: "#1DCD9F", padding: "50px 100px", borderRadius: 12 }}>
            <Row justify="center" align="middle">
                <Col xs={24} md={12}>
                    <Title style={{ fontSize: 42 }}>{title}</Title>
                    <Paragraph style={{ color: "#222222" }}>
                        {description || `Explore second-hand items in ${title}`}
                    </Paragraph>
                    <div style={{ marginTop: 10 }}>
                        {tags.map((tag, idx) => (
                            <Tag key={idx} color="#222222">{tag}</Tag>
                        ))}
                    </div>
                </Col>
                <Col xs={24} md={12}>
                    <img
                        src={image || "/assets/fallback.png"}
                        alt={title}
                        style={{ width: "80%", borderRadius: 8 }}
                    />
                </Col>
            </Row>
        </div>
    );
}

export default CategoryBanner;
