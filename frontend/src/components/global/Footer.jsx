import React from "react";
import { Layout, Row, Col, Typography, Divider } from "antd";

const { Footer } = Layout;
const { Title, Text, Link } = Typography;

const AppFooter = () => {
  const year = new Date().getFullYear();

  return (
    <Footer style={{ backgroundColor: "#f0f2f5", padding: "40px 0px" }}>
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} md={6} style={{textAlign: "center"}}>
          <Title level={5}>Company</Title>
          <div>
            <Link href="/about">About Us</Link><br />
            <Link href="/team">Team</Link><br />
            <Link href="/careers">Careers</Link>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6} style={{textAlign: "center"}}>
          <Title level={5}>Support</Title>
          <div>
            <Link href="/help">Help Center</Link><br />
            <Link href="/contact">Contact Us</Link><br />
            <Link href="/faq">FAQ</Link>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6} style={{textAlign: "center"}}>
          <Title level={5}>Legal</Title>
          <div>
            <Link href="/terms">Terms of Service</Link><br />
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6} style={{textAlign: "center"}}>
          <Title level={5}>Follow Us</Title>
          <div>
            <Link href="https://facebook.com" target="_blank">Facebook</Link><br />
            <Link href="https://twitter.com" target="_blank">Twitter</Link><br />
            <Link href="https://linkedin.com" target="_blank">LinkedIn</Link>
          </div>
        </Col>
      </Row>

      <Divider style={{ marginTop: 40 }} />

      <Text type="secondary" style={{ display: "block", textAlign: "center" }}>
        © {year} All rights reserved.
      </Text>
    </Footer>
  );
};

export default AppFooter;
