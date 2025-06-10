import { Button, Col, Row, Typography } from 'antd';
import ProductCard from './item-card';
const { Title } = Typography;

const ProductList = ({ title, products, onViewAll }) => (
  <>
    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
      <Col>
        <Title level={3} style={{ margin: 0 }}>{title}</Title>
      </Col>
      {onViewAll && (
        <Col>
          <Button type="text" onClick={onViewAll} style={{backgroundColor: "#8AE5CD"}}>View all products</Button>
        </Col>
      )}
    </Row>
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
