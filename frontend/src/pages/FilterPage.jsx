import React, { useEffect, useState } from "react";
import {
  Layout,
  Row,
  Col,
  Typography,
  Input,
  Button,
  DatePicker,
  Divider,
  Form,
} from "antd";
import { useSearchParams } from "react-router-dom";
import ProductList from "@/components/item/item-list";
import { getAllItems } from "@/API/duc.api/item.api";

const { Content } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const FilterPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [filteredItems, setFilteredItems] = useState([]);

  const fetchFilteredItems = async (filters) => {
    try {
      const res = await getAllItems(filters);
      setFilteredItems(res.data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const onFinish = (values) => {
    const params = { ...values };

    if (values.dateRange) {
      params.startDate = values.dateRange[0]?.toISOString();
      params.endDate = values.dateRange[1]?.toISOString();
    }
    delete params.dateRange;

    setSearchParams(params);
    fetchFilteredItems(params);
  };

  useEffect(() => {
    const initialFilters = {};
    searchParams.forEach((value, key) => {
      initialFilters[key] = value;
    });

    if (initialFilters.startDate && initialFilters.endDate) {
      form.setFieldsValue({
        ...initialFilters,
        dateRange: [
          new Date(initialFilters.startDate),
          new Date(initialFilters.endDate),
        ],
      });
    } else {
      form.setFieldsValue(initialFilters);
    }

    fetchFilteredItems(initialFilters);
  }, []);

  return (
    <Layout style={{ backgroundColor: "#fff" }}>
      <Content style={{ padding: "24px" }}>
        <Row gutter={24}>
          {/* FILTER BAR */}
          <Col span={6}>
            <Title level={4}>Filter Products</Title>
            <Form layout="vertical" form={form} onFinish={onFinish}>
              <Form.Item label="Name" name="name">
                <Input placeholder="Product name" />
              </Form.Item>

              <Form.Item label="Price Range">
                <Input.Group compact>
                  <Form.Item name="minPrice" noStyle>
                    <Input
                      style={{ width: "50%" }}
                      placeholder="Min"
                      type="number"
                    />
                  </Form.Item>
                  <Form.Item name="maxPrice" noStyle>
                    <Input
                      style={{ width: "50%" }}
                      placeholder="Max"
                      type="number"
                    />
                  </Form.Item>
                </Input.Group>
              </Form.Item>

              <Form.Item label="Rate Price" name="ratePrice">
                <Input type="number" placeholder="Rate Price" />
              </Form.Item>

              <Form.Item label="Owner ID" name="owner">
                <Input placeholder="Owner ID" />
              </Form.Item>

              <Form.Item label="Post Date Range" name="dateRange">
                <RangePicker />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Apply Filters
                </Button>
              </Form.Item>
            </Form>
          </Col>

          {/* PRODUCT LIST */}
          <Col span={18}>
            <ProductList title="Filtered Products" products={filteredItems} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default FilterPage;
