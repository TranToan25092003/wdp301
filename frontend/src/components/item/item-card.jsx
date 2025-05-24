import { Card, Typography, Tag } from "antd";
const { Title, Paragraph } = Typography;
import { useNavigate } from 'react-router-dom';
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
        statusId
    } = item;

    const displayPrice = ratePrice !== "no" ? `$${price} / ${ratePrice}` : `$${price}`;

    return (
        <Card
            hoverable
            onClick={() => navigate(`/item/${_id}`)}
            cover={<img src={images[0] || "/fallback.jpg"} alt={name} style={{ objectFit: "cover", height: "200px" }} />}
        >
            <Card.Meta
                title={<Title level={5}>{name}</Title>}
                description={
                    <>
                        <Paragraph strong>{displayPrice}</Paragraph>
                        <Tag color="blue">{categoryId?.name}</Tag>
                        <Tag color="green">{typeId?.name}</Tag>
                        <Tag color="gold">{statusId?.name}</Tag>
                    </>
                }
            />
        </Card>
    );
};

export default ProductCard;
