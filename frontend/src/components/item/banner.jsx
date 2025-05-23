import React from 'react'
import bannerImg from "../../assets/banner.png"
import { Button, Col, Row } from 'antd'
import { Typography } from 'antd';
const { Title, Paragraph } = Typography;

function Banner() {
    return (
        <div>
            <div style={{ backgroundColor: "#1DCD9F", padding: "50px 100px", borderRadius: 12 }}>
                <Row justify="center" align="middle">
                    <Col xs={24} md={12}>
                        <Title style={{ fontSize: 42 }}>Second-hand<br />Marketplace</Title>
                        <Paragraph>Buy – Sell – Save more</Paragraph>
                        <Button style={{ backgroundColor: "black", color: "white" }} size="large">Start Browsing</Button>
                    </Col>
                    <Col xs={24} md={12}>
                        <img src={bannerImg} alt="banner" style={{ width: "80%" }} />
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default Banner
