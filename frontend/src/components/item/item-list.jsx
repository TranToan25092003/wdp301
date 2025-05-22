import { Col, Row, Typography } from 'antd';
import ProductCard from './item-card';
const { Title, Paragraph } = Typography;

const ProductList = ({ title, products, tagColor }) => (
    <>
        <Title level={3}>{title}</Title>
        <Row gutter={[16, 16]}>
            {products.map(product => (
                <Col xs={24} sm={12} md={6} key={product.id}>
                    <ProductCard {...product} tagColor={tagColor} />
                </Col>
            ))}
        </Row>
    </>
);

export default ProductList
