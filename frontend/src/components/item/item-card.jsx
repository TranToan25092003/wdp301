import { Card, Typography, Tag, Carousel } from "antd";
const { Title, Paragraph } = Typography;
import { useNavigate } from "react-router-dom";

const ProductCard = ({ item }) => {
  const navigate = useNavigate();
  const {
    _id,
    name,
    price,
    ratePrice,
    images,
    typeId,
    categoryId,
    statusId,
  } = item;

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  const displayPrice = ratePrice !== "no" ? `${formatPrice(price)} / ${ratePrice}` : formatPrice(price);

  // Handle image display
  const renderImages = () => {
    if (!images || images.length === 0) {
      // Case: No images
      return (
        <img
          src="/fallback.jpg"
          alt={name}
          style={{ objectFit: "cover", height: "200px", width: "100%" }}
        />
      );
    }

    if (images.length === 1) {
      // Case: Single image (no carousel)
      return (
        <img
          src={images[0]}
          alt={name}
          style={{ objectFit: "cover", height: "200px", width: "100%" }}
        />
      );
    }

    // Case: Multiple images (use carousel)
    return (
      <Carousel autoplay dots={{ className: "carousel-dots" }} style={{ height: "200px" }}>
        {images.map((image, index) => (
          <div key={index}>
            <img
              src={image}
              alt={`${name}-${index}`}
              style={{ objectFit: "cover", height: "200px", width: "100%" }}
            />
          </div>
        ))}
      </Carousel>
    );
  };

  return (
    <Card
      hoverable
      onClick={() => navigate(`/item/${_id}`)}
      cover={renderImages()}
      bodyStyle={{ padding: "12px" }}
    >
      <Card.Meta
        title={<Title level={5} style={{ margin: 0 }}>{name}</Title>}
        description={
          <>
            <Paragraph strong style={{ margin: "4px 0" }}>
              {displayPrice}
            </Paragraph>
            <Tag color="blue">{categoryId?.name || "Unknown"}</Tag>
            <Tag color="green">{typeId?.name || "Unknown"}</Tag>
            <Tag color="gold">{statusId?.name || "Unknown"}</Tag>
          </>
        }
      />
    </Card>
  );
};

export default ProductCard;