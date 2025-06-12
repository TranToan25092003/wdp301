import React, { useEffect, useState } from "react";
import {
  Layout,
  Row,
  Col,
  Typography,
  Input,
  Button,
  DatePicker,
  Form,
  Select,
} from "antd";
import { useSearchParams, useLoaderData } from "react-router-dom";
import ProductList from "@/components/item/item-list";
import { getAllItems, getFilteredItems } from "@/API/duc.api/item.api";
import { message } from "antd";
import dayjs from "dayjs";
import { getAllCategoriesWithStats } from "@/API/duc.api/category.api";
import { getAllTypes } from "@/API/duc.api/type.api";
import { getAllStatuses } from "@/API/duc.api/status.api";

const { Content } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;

export const filterPageLoader = async () => {
  try {
    const [typesRes, categoriesRes, statusesRes] = await Promise.all([
      getAllTypes(),
      getAllCategoriesWithStats(),
      getAllStatuses(),
    ]);

    return {
      types: typesRes || [],
      categories: categoriesRes.data || [],
      statuses: statusesRes || [],
    };
  } catch (error) {
    console.error("Error loading filter options:", error);
    return {
      types: [],
      categories: [],
      statuses: [],
    };
  }
};

const FilterPage = () => {
  const { categories, types, statuses } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const typeOptions = types.map(type => ({ label: type.name, value: type._id }));
  const categoryOptions = categories.map(c => ({ label: c.title, value: c._id }))
  const statusOptions = statuses.map(s => ({ label: s.name, value: s._id }));

  const fetchFilteredItems = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await getFilteredItems(filters);
      setFilteredItems(res.data || []);
    } catch (error) {
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors)) {
        const errorMessages = errors.map(e => `${e.path}: ${e.msg}`).join(" | ");
        message.error(errorMessages);
      } else {
        message.error("Invalid filter parameters.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values) => {
    const params = {};

    Object.entries(values).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "undefined"
      ) {
        if (key === "dateRange" && Array.isArray(value) && value.length === 2) {
          params.startDate = value[0]?.toISOString();
          params.endDate = value[1]?.toISOString();
        } else if (key !== "dateRange") {
          params[key] = value;
        }
      }
    });

    setSearchParams(params);
    fetchFilteredItems(params);
  };


  useEffect(() => {
    const initialFilters = {};
    let isValid = true;

    searchParams.forEach((value, key) => {
      if (
        value === "undefined" ||
        value === null ||
        value === "" ||
        (["minPrice", "maxPrice", "ratePrice"].includes(key) && isNaN(Number(value)))
      ) {
        isValid = false;
      } else {
        initialFilters[key] = value;
      }
    });

    if (!isValid) {
      console.warn("Invalid search parameters detected.");
      message.warning("One or more filter parameters are invalid.");
      return;
    }

    const formValues = { ...initialFilters };

    if (initialFilters.startDate && initialFilters.endDate) {
      formValues.dateRange = [
        dayjs(initialFilters.startDate),
        dayjs(initialFilters.endDate),
      ];
      delete formValues.startDate;
      delete formValues.endDate;
    }

    form.setFieldsValue(formValues);
    fetchFilteredItems(initialFilters);
  }, []);



  return (
    <Layout style={{ backgroundColor: "#fff" }}>
      <Content style={{ padding: "0" }}>
        <Row gutter={24}>
          {/* FILTER BAR */}
          <Col span={6} style={{ borderRight: "1px #E5E5E5 solid", padding: "16px" }}>
            <Title level={4}>Filter Products</Title>
            <Form layout="vertical" form={form} onFinish={onFinish}>
              <Form.Item label="Name" name="name">
                <Input placeholder="Product name" />
              </Form.Item>

              <Form.Item label="Price Range">
                <Input.Group compact>
                  <Form.Item name="minPrice" noStyle>
                    <Input style={{ width: "50%" }} placeholder="Min" type="number" />
                  </Form.Item>
                  <Form.Item name="maxPrice" noStyle>
                    <Input style={{ width: "50%" }} placeholder="Max" type="number" />
                  </Form.Item>
                </Input.Group>
              </Form.Item>

              <Form.Item label="Rate Price" name="ratePrice">
                <Input type="number" placeholder="Rate Price" />
              </Form.Item>

              <Form.Item label="Owner ID" name="owner">
                <Input placeholder="Owner ID" />
              </Form.Item>

              <Form.Item label="Type" name="typeId">
                <Select options={typeOptions} placeholder="Select a type" allowClear />
              </Form.Item>

              <Form.Item label="Category" name="categoryId">
                <Select options={categoryOptions} placeholder="Select a category" allowClear />
              </Form.Item>

              <Form.Item label="Status" name="statusId">
                <Select options={statusOptions} placeholder="Select a status" allowClear />
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

            <Form.Item>
              <Button
                type="primary"
                htmlType="button"
                onClick={() => {
                  form.resetFields();
                  setSearchParams({});
                  fetchFilteredItems();
                }}
                block
              >
                Clear Filters
              </Button>
            </Form.Item>

          </Col>

          {/* PRODUCT LIST */}
          <Col span={18} style={{ padding: "16px" }}>
            <ProductList
              title="Filtered Products"
              products={filteredItems}
              loading={loading}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default FilterPage;
