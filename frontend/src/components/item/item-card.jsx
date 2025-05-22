import { Tag } from "antd";
import { Card } from "antd";
import { Typography } from 'antd';
const { Title, Paragraph } = Typography;

const ProductCard = ({ name, price, image, tags, tagColor = "blue" }) => (
    <Card hoverable cover={<img src={image} alt={name} />}>
        <Card.Meta
            title={name}
            description={
                <>
                    <Paragraph strong>{price}</Paragraph>
                    {tags.map((tag, i) => (
                        <Tag color={tagColor} key={i}>{tag}</Tag>
                    ))}
                </>
            }
        />
    </Card>
);

export default ProductCard