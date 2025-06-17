import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Upload,
  Button,
  Modal,
  DatePicker,
  InputNumber,
  Radio,
  message,
  Divider,
  Select,
} from "antd";
import { UploadOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ImgCrop from "antd-img-crop";
import { getAllCategoriesWithStats } from "@/API/duc.api/category.api";
import { getAllTypes } from "@/API/duc.api/type.api";
import { getAllStatuses } from "@/API/duc.api/status.api";
import { createItem } from "@/API/duc.api/item.api";
import { createAuction } from "@/API/huynt.api/auction.api";
import { createBorrow } from "@/API/duc.api/borrow.api";
import { useAuth } from "@clerk/clerk-react";

const { TextArea } = Input;
const { Option } = Select;

const CreatePost = () => {
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [postType, setPostType] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [firstStepData, setFirstStepData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, typesRes, statusesRes] = await Promise.all([
          getAllCategoriesWithStats(),
          getAllTypes(),
          getAllStatuses(),
        ]);
        setCategories(categoriesRes.data);
        setTypes(typesRes.data);
        setStatuses(statusesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load initial data");
      }
    };
    fetchData();
  }, []);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "huynt7104"); // Replace with your upload preset
    formData.append("cloud_name", "db4tuojnn"); // Replace with your cloud name

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/db4tuojnn/image/upload`, // Replace with your cloud name
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleFirstStepSubmit = (values) => {
    if (fileList.length === 0) {
      message.error("Please upload at least 1 image");
      return;
    }
    console.log("First step submitted with values:", values);
    setFirstStepData(values);
    setCurrentStep(2);
  };

  const handlePostTypeSelect = (type) => {
    setPostType(type);
    setIsModalVisible(true);
    modalForm.resetFields();
  };

  const handleModalSubmit = async (values) => {
    try {
      setUploading(true);

      if (!firstStepData) {
        throw new Error("First step data is missing");
      }

      // Upload all images to Cloudinary
      const uploadPromises = fileList.map((file) =>
        uploadImage(file.originFileObj)
      );
      const imageUrls = await Promise.all(uploadPromises);

      // Find approved status
      const approvedStatus = statuses.find(
        (status) => status.name.toLowerCase() === "approved"
      );
      if (!approvedStatus) {
        throw new Error("Approved status not found");
      }

      console.log("First step data:", firstStepData);
      console.log("Second step (modal) values:", values);

      // First create the item
      const itemData = {
        name: firstStepData.name,
        description: firstStepData.description,
        price: Number(values.price),
        images: imageUrls,
        ratePrice: firstStepData.ratePrice,
        owner: userId,
        typeId: selectedType._id,
        categoryId: firstStepData.categoryId,
        statusId: approvedStatus._id,
      };

      // Validate required fields before sending
      const requiredFields = [
        "name",
        "description",
        "price",
        "ratePrice",
        "owner",
        "typeId",
        "categoryId",
        "statusId",
      ];

      const missingFields = requiredFields.filter((field) => !itemData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      console.log("Sending item data:", itemData);

      const itemRes = await createItem(itemData);
      console.log("Item creation response:", itemRes);

      // Based on post type, create additional records
      if (postType === "auction") {
        const auctionData = {
          startTime: values.auctionStartTime.toISOString(),
          endTime: values.auctionEndTime.toISOString(),
          startPrice: Number(values.price),
          currentPrice: Number(values.price),
          itemId: itemRes.data._id,
          statusId: approvedStatus._id,
        };
        console.log("Creating auction with data:", auctionData);
        await createAuction(auctionData);
      } else if (postType === "borrow") {
        const borrowData = {
          totalPrice: Number(values.price),
          totalTime: Number(values.totalTime),
          borrowers: userId,
          itemId: itemRes.data._id,
          startTime: values.startTime.toISOString(),
          endTime: values.endTime.toISOString(),
        };
        console.log("Creating borrow with data:", borrowData);
        await createBorrow(borrowData);
      }

      message.success("Post created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        message.error(error.response.data.message || "Failed to create post");
      } else {
        message.error(error.message || "Failed to create post");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = ({ fileList: newFileList }) => {
    const isLt5M = newFileList.every(
      (file) => !file.originFileObj || file.originFileObj.size / 1024 / 1024 < 5
    );

    if (!isLt5M) {
      message.error("Each image must be less than 5MB!");
      return;
    }

    setFileList(newFileList);
  };

  const handleVideoChange = (info) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} upload failed.`);
    }
  };

  const beforeVideoUpload = (file) => {
    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      message.error("You can only upload video files!");
      return false;
    }

    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error("Video must be smaller than 100MB!");
      return false;
    }

    return true;
  };

  const renderPriceModal = () => {
    const isAuction = postType === "auction";
    const isBorrow = postType === "borrow";

    return (
      <Modal
        title={`Set ${
          isAuction ? "Auction" : isBorrow ? "Borrow" : "Sale"
        } Price`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={modalForm} onFinish={handleModalSubmit} layout="vertical">
          <Form.Item
            name="price"
            label={isAuction ? "Starting Price" : "Price"}
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              addonAfter="VND"
            />
          </Form.Item>

          {isAuction && (
            <>
              <Form.Item
                name="auctionStartTime"
                label="Start Time"
                rules={[
                  {
                    required: true,
                    message: "Please select start time",
                  },
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="auctionEndTime"
                label="End Time"
                rules={[
                  {
                    required: true,
                    message: "Please select end time",
                  },
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}

          {isBorrow && (
            <>
              <Form.Item
                name="totalTime"
                label="Total Time (hours)"
                rules={[
                  {
                    required: true,
                    message: "Please enter total time",
                  },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
              <Form.Item
                name="startTime"
                label="Start Time"
                rules={[
                  {
                    required: true,
                    message: "Please select start time",
                  },
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="endTime"
                label="End Time"
                rules={[
                  {
                    required: true,
                    message: "Please select end time",
                  },
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={uploading}>
              Complete
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>

      {currentStep === 1 && (
        <Form form={form} layout="vertical" onFinish={handleFirstStepSubmit}>
          <Form.Item
            name="name"
            label="Title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="Enter product title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea
              rows={4}
              placeholder="Detailed description of the product"
            />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select placeholder="Select category">
              {categories.map((category) => (
                <Option key={category._id} value={category._id}>
                  {category.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="ratePrice"
            label="Rate Price"
            rules={[{ required: true, message: "Please select rate price" }]}
          >
            <Radio.Group>
              <Radio.Button value="hour">Per Hour</Radio.Button>
              <Radio.Button value="day">Per Day</Radio.Button>
              <Radio.Button value="no">No Rate</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Divider>Images & Video</Divider>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2">
                Product Images (First image will be cover)
              </h3>
              <ImgCrop rotationSlider>
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleImageChange}
                  beforeUpload={() => false}
                  multiple
                  maxCount={10}
                >
                  {fileList.length < 10 && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </ImgCrop>
              <p className="text-gray-500 text-sm">
                Maximum 10 images, each less than 5MB
              </p>
            </div>

            {/* <div>
              <h3 className="mb-2">Product Video (optional)</h3>
              <Upload
                maxCount={1}
                beforeUpload={beforeVideoUpload}
                onChange={handleVideoChange}
                listType="picture"
              >
                <Button icon={<VideoCameraOutlined />}>Upload video</Button>
              </Upload>
              <p className="text-gray-500 text-sm">
                Maximum 1 video, less than 100MB
              </p>
            </div> */}
          </div>

          <Form.Item className="mt-6">
            <Button type="primary" htmlType="submit" block>
              Continue
            </Button>
          </Form.Item>
        </Form>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Choose Post Type</h2>
          <div className="grid grid-cols-3 gap-4">
            {types.map((type) => (
              <Button
                key={type._id}
                size="large"
                onClick={() => {
                  setSelectedType(type);
                  handlePostTypeSelect(type.name.toLowerCase());
                }}
                block
              >
                {type.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {renderPriceModal()}
    </div>
  );
};

export default CreatePost;
