import { Button, Col, Pagination, Row, Typography } from 'antd';
import ProductCard from './item-card';
import { Spin } from 'antd';
const { Title } = Typography;

const ProductList = ({ title, products, onViewAll, loading = false, total, page, pageSize, onPaginationChange }) => (
  <>
    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
      <Col>
        <Title level={3} style={{ margin: 0 }}>{title}</Title>
      </Col>
      {onViewAll && (
        <Col>
          <Button type="text" onClick={onViewAll} style={{ backgroundColor: "#8AE5CD" }}>View all products</Button>
        </Col>
      )}
    </Row>
    {loading ? (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    ) : (
      <>
        <Row gutter={[16, 16]}>
          {products.map(product => (
            <Col xs={24} sm={12} md={6} key={product._id}>
              <ProductCard item={product} />
            </Col>
          ))}
        </Row>
        {total !== undefined && page !== undefined && pageSize !== undefined && onPaginationChange && (
          <Row justify="center" style={{ marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={onPaginationChange}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50]}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            />
          </Row>
        )}
      </>
    )}
  </>
);

export default ProductList;
