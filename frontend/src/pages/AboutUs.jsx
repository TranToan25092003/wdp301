import { Card, Typography, Row, Col, Avatar, Divider } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  FacebookOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text, Link } = Typography;

const teamMembers = [
  {
    name: "Nguyễn Văn A",
    role: "Team Leader",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    facebook: "https://facebook.com/nguyenvana",
  },
  {
    name: "Trần Thị B",
    role: "Frontend Developer",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    facebook: "https://facebook.com/tranthib",
  },
  {
    name: "Lê Văn C",
    role: "Backend Developer",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
    facebook: "https://facebook.com/levanc",
  },
  {
    name: "Phạm Thị D",
    role: "UI/UX Designer",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    facebook: "https://facebook.com/phamthid",
  },
];

const AboutUs = () => {
  return (
    <div
      style={{ minHeight: "100vh", background: "#f7fafc", padding: "32px 0" }}
    >
      <Card
        style={{
          maxWidth: 900,
          margin: "0 auto",
          boxShadow: "0 4px 24px #0001",
          borderRadius: 16,
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Title level={2} style={{ textAlign: "center", marginBottom: 8 }}>
          About Us
        </Title>
        <Paragraph style={{ textAlign: "center", fontSize: 18, color: "#555" }}>
          Chào mừng bạn đến với <b>WDP301 Project</b>!<br />
          Đây là nền tảng hỗ trợ đăng tin, đấu giá, cho thuê và mua bán sản phẩm
          trực tuyến.
        </Paragraph>
        <Divider />
        <Row gutter={[32, 32]} align="middle" justify="center">
          <Col xs={24} md={12}>
            <Title level={4}>Sứ mệnh</Title>
            <Paragraph style={{ fontSize: 16 }}>
              Chúng tôi mong muốn tạo ra một môi trường giao dịch minh bạch, an
              toàn và tiện lợi cho mọi người.
              <br />
              <Text type="secondary">
                "Kết nối cộng đồng - Trao giá trị - Lan tỏa niềm tin"
              </Text>
            </Paragraph>
            <Title level={4} style={{ marginTop: 24 }}>
              Thông tin liên hệ
            </Title>
            <Paragraph style={{ fontSize: 16, marginBottom: 8 }}>
              <EnvironmentOutlined /> 123 Đường ABC, Quận 1, TP.HCM
              <br />
              <PhoneOutlined /> 0123 456 789
              <br />
              <MailOutlined /> wdp301@example.com
              <br />
              <FacebookOutlined />{" "}
              <Link href="https://facebook.com/wdp301" target="_blank">
                facebook.com/wdp301
              </Link>
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 8px #0001",
              }}
            >
              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.502234833635!2d106.7004233153346!3d10.77637369232239!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1c1b1b1b1b%3A0x1b1b1b1b1b1b1b1b!2zMTIzIMSQxrDhu51uZyBBQkMsIFF14bqtbiAxLCBUUC5IQ00!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </Col>
        </Row>
        <Divider />
        <Title level={4} style={{ textAlign: "center" }}>
          Thành viên nhóm
        </Title>
        <Row gutter={[24, 24]} justify="center" style={{ marginTop: 16 }}>
          {teamMembers.map((member) => (
            <Col
              xs={24}
              sm={12}
              md={6}
              key={member.name}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Card
                hoverable
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px #0001",
                  width: 180,
                }}
                bodyStyle={{ padding: 18 }}
              >
                <Avatar
                  src={member.avatar}
                  size={72}
                  style={{ marginBottom: 12 }}
                />
                <Title level={5} style={{ marginBottom: 0 }}>
                  {member.name}
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {member.role}
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Link href={member.facebook} target="_blank">
                    <FacebookOutlined
                      style={{ fontSize: 20, color: "#1877f3" }}
                    />
                  </Link>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default AboutUs;
