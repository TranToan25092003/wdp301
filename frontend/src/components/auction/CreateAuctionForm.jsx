import React from "react";
import { Modal, Form, Input, InputNumber, DatePicker } from "antd";
import { createAuction } from "@/API/huynt.api/auction.api";
import { Button } from "../ui/button";

const CreateAuctionForm = ({ open, onCancel, onCreate }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const auctionData = {
        ...values,
        endTime: values.endTime.toISOString(),
      };
      const response = await createAuction(auctionData);
      onCreate(response.data);
      form.resetFields();
    } catch (error) {
      console.error("Error creating auction:", error);
    }
  };

  return (
    <Modal
      title="Create New Auction"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="title"
          label="Auction Title"
          rules={[
            { required: true, message: "Please enter the auction title" },
          ]}
        >
          <Input placeholder="Enter auction title" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <Input.TextArea placeholder="Enter auction description" />
        </Form.Item>
        <Form.Item
          name="startingPrice"
          label="Starting Price"
          rules={[
            { required: true, message: "Please enter the starting price" },
          ]}
        >
          <InputNumber
            min={1}
            placeholder="Enter starting price"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          name="endTime"
          label="End Time"
          rules={[{ required: true, message: "Please select the end time" }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Auction
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateAuctionForm;
