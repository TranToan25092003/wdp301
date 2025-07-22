import React from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Avatar,
  Tooltip,
  Space,
  Statistic,
} from "antd";
import {
  GiftOutlined,
  ShoppingOutlined,
  MailOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  GithubOutlined,
  LinkedinOutlined,
  HeartOutlined,
  GlobalOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const { Title, Paragraph, Text } = Typography;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const developers = [
  {
    name: "Nguyễn Trọng Huy",
    role: "Full-stack Developer",
    avatar: "/path/to/huy-avatar.jpg",
    github: "https://github.com/huynguyen",
    linkedin: "https://linkedin.com/in/huynguyen",
    description: "Phát triển hệ thống đấu giá realtime và quản lý giao dịch",
  },
  {
    name: "Nguyễn Đức",
    role: "Backend Developer",
    avatar: "/path/to/duc-avatar.jpg",
    github: "https://github.com/ducnguyen",
    linkedin: "https://linkedin.com/in/ducnguyen",
    description: "Xây dựng API và hệ thống quản lý người dùng, mua bán",
  },
  {
    name: "Nguyễn Duy",
    role: "Frontend Developer",
    avatar: "/path/to/duy-avatar.jpg",
    github: "https://github.com/duynguyen",
    linkedin: "https://linkedin.com/in/duynguyen",
    description: "Thiết kế giao diện và trải nghiệm người dùng",
  },
  {
    name: "Nguyễn Văn A",
    role: "Backend Developer",
    avatar: "/path/to/a-avatar.jpg",
    github: "https://github.com/vana",
    linkedin: "https://linkedin.com/in/vana",
    description: "Phát triển hệ thống thanh toán và quản lý coin",
  },
];

const features = [
  {
    icon: <GiftOutlined style={{ fontSize: 32, color: "#f5222d" }} />,
    title: "Đấu giá trực tuyến",
    description:
      "Hệ thống đấu giá thời gian thực với bảo vệ người mua khỏi đấu giá ảo và đảm bảo công bằng cho người bán",
  },
  {
    icon: <ShoppingOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
    title: "Mua bán trực tiếp",
    description:
      "Nền tảng kết nối người bán và người mua với hệ thống thanh toán an toàn bằng coin",
  },
  {
    icon: <HeartOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
    title: "Đánh giá tin cậy",
    description:
      "Hệ thống đánh giá người dùng minh bạch, giúp xây dựng cộng đồng mua bán đáng tin cậy",
  },
  {
    icon: (
      <SafetyCertificateOutlined style={{ fontSize: 32, color: "#faad14" }} />
    ),
    title: "Bảo vệ giao dịch",
    description:
      "Cơ chế thanh toán an toàn với hệ thống coin và quy trình giải quyết tranh chấp chuyên nghiệp",
  },
];

const About = () => (
  <AnimatePresence>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      {/* Hero Section */}
      <motion.div
        variants={itemVariants}
        className="hero-section"
        style={{
          maxWidth: 1200,
          margin: "0 auto 40px",
          background: "#fff",
          borderRadius: 24,
          padding: "60px 40px",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        <Title
          level={1}
          style={{
            fontSize: 48,
            background: "linear-gradient(120deg, #155799 0%, #159957 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          OldWays
        </Title>
        <Title level={3} style={{ marginBottom: 24, color: "#666" }}>
          Nền tảng đấu giá và mua bán đồ cũ tin cậy
        </Title>
        <Paragraph
          style={{
            fontSize: 18,
            maxWidth: 800,
            margin: "0 auto",
            color: "#555",
          }}
        >
          OldWays là nền tảng kết nối người mua và người bán đồ cũ thông qua
          hình thức đấu giá trực tuyến và mua bán trực tiếp. Với hệ thống thanh
          toán bằng coin an toàn và minh bạch, chúng tôi mang đến trải nghiệm
          mua bán đáng tin cậy cho cộng đồng. Mỗi giao dịch trên OldWays đều
          được bảo vệ bởi cơ chế đảm bảo và hệ thống đánh giá người dùng chuyên
          nghiệp.
        </Paragraph>
      </motion.div>

      {/* Features Section */}
      <motion.div
        variants={itemVariants}
        style={{ maxWidth: 1200, margin: "0 auto 40px" }}
      >
        <Title
          level={2}
          style={{ textAlign: "center", marginBottom: 40, color: "#1890ff" }}
        >
          Tính năng nổi bật
        </Title>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <motion.div
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <Card
                  style={{
                    height: "100%",
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    textAlign: "center",
                  }}
                  bodyStyle={{ padding: 24 }}
                >
                  {feature.icon}
                  <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
                    {feature.title}
                  </Title>
                  <Text type="secondary">{feature.description}</Text>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        variants={itemVariants}
        style={{
          maxWidth: 1200,
          margin: "0 auto 40px",
          background: "#fff",
          borderRadius: 24,
          padding: 40,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Title
          level={2}
          style={{ textAlign: "center", marginBottom: 40, color: "#1890ff" }}
        >
          OldWays trong con số
        </Title>
        <Row gutter={[48, 24]} justify="center">
          <Col xs={12} sm={6}>
            <Statistic
              title="Đấu giá thành công"
              value="500+"
              prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
              style={{ textAlign: "center" }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Người dùng tin cậy"
              value="1,000+"
              prefix={<UserOutlined style={{ color: "#52c41a" }} />}
              style={{ textAlign: "center" }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Đánh giá tích cực"
              value="95%"
              prefix={<HeartOutlined style={{ color: "#f5222d" }} />}
              style={{ textAlign: "center" }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Giao dịch thành công"
              value="2,000+"
              prefix={<GlobalOutlined style={{ color: "#1890ff" }} />}
              style={{ textAlign: "center" }}
            />
          </Col>
        </Row>
      </motion.div>

      {/* Team Section */}
      <motion.div
        variants={itemVariants}
        style={{
          maxWidth: 1200,
          margin: "0 auto 40px",
          background: "#fff",
          borderRadius: 24,
          padding: 40,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Title
          level={2}
          style={{ textAlign: "center", marginBottom: 40, color: "#1890ff" }}
        >
          Đội ngũ phát triển
        </Title>
        <Row gutter={[24, 24]}>
          {developers.map((dev, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <motion.div
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <Card
                  style={{
                    textAlign: "center",
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                  bodyStyle={{ padding: 24 }}
                >
                  <Avatar
                    size={100}
                    src={dev.avatar}
                    style={{ marginBottom: 16 }}
                  />
                  <Title level={4} style={{ marginBottom: 4 }}>
                    {dev.name}
                  </Title>
                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 16 }}
                  >
                    {dev.role}
                  </Text>
                  <Paragraph style={{ minHeight: 72, color: "#666" }}>
                    {dev.description}
                  </Paragraph>
                  <Space>
                    <Tooltip title="GitHub">
                      <Button
                        type="text"
                        icon={<GithubOutlined />}
                        href={dev.github}
                        target="_blank"
                      />
                    </Tooltip>
                    <Tooltip title="LinkedIn">
                      <Button
                        type="text"
                        icon={<LinkedinOutlined />}
                        href={dev.linkedin}
                        target="_blank"
                      />
                    </Tooltip>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        variants={itemVariants}
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 24,
          padding: 40,
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Title level={2} style={{ marginBottom: 24, color: "#1890ff" }}>
          Liên hệ với chúng tôi
        </Title>
        <Space size={40} wrap style={{ justifyContent: "center" }}>
          <div>
            <MailOutlined
              style={{ fontSize: 24, marginBottom: 8, color: "#1890ff" }}
            />
            <div>
              <Text strong>Email</Text>
              <br />
              <a href="mailto:support@oldways.com">support@oldways.com</a>
            </div>
          </div>
          <div>
            <GlobalOutlined
              style={{ fontSize: 24, marginBottom: 8, color: "#52c41a" }}
            />
            <div>
              <Text strong>Website</Text>
              <br />
              <a
                href="https://oldways.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.oldways.com
              </a>
            </div>
          </div>
          <div>
            <TeamOutlined
              style={{ fontSize: 24, marginBottom: 8, color: "#722ed1" }}
            />
            <div>
              <Text strong>Địa chỉ</Text>
              <br />
              <Text>Tòa nhà FPT Polytechnic, Quận 12, TP.HCM</Text>
            </div>
          </div>
        </Space>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

export default About;
