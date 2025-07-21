import React from "react";
import { Layout, Row, Col, Typography, Divider } from "antd";
const { Footer } = Layout;
const { Title, Text, Link } = Typography;
import { useLoaderData } from "react-router-dom";
import {
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  FileProtectOutlined,
  LockOutlined,
  FacebookOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const AppFooter = () => {
  const year = new Date().getFullYear();
  const { footerInfo } = useLoaderData();

  const { address, email, facebook, iframe, phone, zalo } = footerInfo;

  return (
    <Footer
      style={{
        backgroundColor: "#f0fdf4",
        padding: "60px 0px 30px",
        borderTop: "1px solid #dcfce7",
      }}
    >
      <div className="container mx-auto px-4">
        <Row gutter={[48, 40]}>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-green-800 tracking-tighter mb-2">
                <span className="text-green-600">OLD</span>
                <span className="font-light italic">WAYS</span>
              </h1>
              <div className="text-sm text-green-700">
                Nơi Trao Đổi Đồ Cũ Tin Cậy
              </div>
            </div>
            <Text className="text-green-700">
              Nền tảng mua bán, đấu giá, cho mượn đồ dùng đã qua sử dụng với giá
              trị hơn 10.000 đô.
            </Text>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: "#166534", marginBottom: 16 }}>
              <HomeOutlined className="mr-2" />
              Địa chỉ
            </Title>
            <div className="flex flex-col text-green-700">
              <Link
                href="/about"
                className="text-green-700 hover:text-green-500 mb-2"
              >
                {" "}
                {address}{" "}
              </Link>
              <div
                className="mt-4"
                dangerouslySetInnerHTML={{
                  __html: iframe,
                }}
              ></div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: "#166534", marginBottom: 16 }}>
              <PhoneOutlined className="mr-2" />
              Hỗ trợ khách hàng
            </Title>
            <div>
              <Link
                href={`tel:${phone}`}
                className="text-green-700 hover:text-green-500 mb-3 flex items-center"
              >
                <PhoneOutlined style={{ marginRight: 8 }} />
                {phone}
              </Link>
              <Link
                href={`mailto:${email}`}
                className="text-green-700 hover:text-green-500 flex items-center"
              >
                <MailOutlined style={{ marginRight: 8 }} />
                {email}
              </Link>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: "#166534", marginBottom: 16 }}>
              Kết nối với chúng tôi
            </Title>
            <div>
              <Link
                href={facebook}
                target="_blank"
                className="text-green-700 hover:text-green-500 mb-3 flex items-center"
              >
                <FacebookOutlined style={{ marginRight: 8 }} />
                Facebook
              </Link>
              <Link
                href={zalo}
                target="_blank"
                className="text-green-700 hover:text-green-500 flex items-center"
              >
                <MessageOutlined style={{ marginRight: 8 }} />
                Zalo
              </Link>
            </div>
          </Col>
        </Row>

        <Divider style={{ borderColor: "#86efac", margin: "40px 0 20px" }} />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <Text className="text-green-700 mb-4 md:mb-0">
            © {year} OldWays - Mọi quyền được bảo lưu.
          </Text>

          <div className="flex space-x-4">
            <Link
              href="/terms"
              className="text-green-700 hover:text-green-500 flex items-center"
            >
              <FileProtectOutlined style={{ marginRight: 4 }} />
              Điều khoản sử dụng
            </Link>
            <Link
              href="/privacy"
              className="text-green-700 hover:text-green-500 flex items-center"
            >
              <LockOutlined style={{ marginRight: 4 }} />
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </Footer>
  );
};

export default AppFooter;
