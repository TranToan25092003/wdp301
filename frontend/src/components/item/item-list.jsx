import { Col, Row, Typography } from 'antd';
import ProductCard from './item-card';
const { Title } = Typography;

const ProductList = ({ title, products }) => (
  <>
    <Title level={3}>{title}</Title>
    <Row gutter={[16, 16]}>
      {products.map(product => (
        <Col xs={24} sm={12} md={6} key={product._id}>
          <ProductCard item={product} />
        </Col>
      ))}
    </Row>
  </>
);

export default ProductList;
