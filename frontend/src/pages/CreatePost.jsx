import { useState } from "react";
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
} from "antd";
import { UploadOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ImgCrop from "antd-img-crop";

const { TextArea } = Input;

const CreatePost = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [postType, setPostType] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [videoFile, setVideoFile] = useState(null);

  const handleFirstStepSubmit = (values) => {
    if (fileList.length === 0) {
      message.error("Vui lòng tải lên ít nhất 1 hình ảnh");
      return;
    }
    console.log("First step values:", values);
    setCurrentStep(2);
  };

  const handlePostTypeSelect = (type) => {
    setPostType(type);
    setIsModalVisible(true);
  };

  const handleModalSubmit = async (values) => {
    const finalData = {
      ...form.getFieldsValue(),
      postType,
      ...values,
      images: fileList,
      video: videoFile,
      coverImage: fileList[0], // Ảnh đầu tiên sẽ là ảnh bìa
    };
    console.log("Final submission:", finalData);

    try {
      // TODO: Call API to save post
      message.success("Đăng tin thành công!");
      navigate("/"); // Navigate back to home page
    } catch (error) {
      message.error("Có lỗi xảy ra khi đăng tin");
    }
  };

  const handleImageChange = ({ fileList: newFileList }) => {
    // Giới hạn kích thước file là 5MB
    const isLt5M = newFileList.every(
      (file) => !file.originFileObj || file.originFileObj.size / 1024 / 1024 < 5
    );

    if (!isLt5M) {
      message.error("Mỗi hình ảnh phải nhỏ hơn 5MB!");
      return;
    }

    setFileList(newFileList);
  };

  const handleVideoChange = (info) => {
    if (info.file.status === "done") {
      setVideoFile(info.file);
      message.success(`${info.file.name} đã được tải lên thành công`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} tải lên thất bại.`);
    }
  };

  const beforeVideoUpload = (file) => {
    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      message.error("Bạn chỉ có thể tải lên file video!");
      return false;
    }

    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error("Video phải nhỏ hơn 100MB!");
      return false;
    }

    return true;
  };

  const renderPriceModal = () => {
    const isAuction = postType === "auction";

    return (
      <Modal
        title={`Thiết lập giá ${isAuction ? "đấu giá" : ""}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleModalSubmit} layout="vertical">
          <Form.Item
            name="price"
            label={isAuction ? "Giá khởi điểm" : "Giá"}
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              addonAfter="VNĐ"
            />
          </Form.Item>

          {isAuction && (
            <>
              <Form.Item
                name="auctionStartTime"
                label="Thời gian bắt đầu"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn thời gian bắt đầu",
                  },
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="auctionEndTime"
                label="Thời gian kết thúc"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn thời gian kết thúc",
                  },
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Hoàn tất
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Đăng tin</h1>

      {currentStep === 1 && (
        <Form form={form} layout="vertical" onFinish={handleFirstStepSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề sản phẩm" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <TextArea rows={4} placeholder="Mô tả chi tiết về sản phẩm" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Radio.Group>
              <Radio.Button value="electronics">Điện tử</Radio.Button>
              <Radio.Button value="fashion">Thời trang</Radio.Button>
              <Radio.Button value="furniture">Nội thất</Radio.Button>
              <Radio.Button value="others">Khác</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Divider>Hình ảnh & Video</Divider>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2">
                Hình ảnh sản phẩm (Ảnh đầu tiên sẽ là ảnh bìa)
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
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </ImgCrop>
              <p className="text-gray-500 text-sm">
                Tối đa 10 ảnh, mỗi ảnh không quá 5MB
              </p>
            </div>

            <div>
              <h3 className="mb-2">Video sản phẩm (không bắt buộc)</h3>
              <Upload
                maxCount={1}
                beforeUpload={beforeVideoUpload}
                onChange={handleVideoChange}
                listType="picture"
              >
                <Button icon={<VideoCameraOutlined />}>Tải video</Button>
              </Upload>
              <p className="text-gray-500 text-sm">
                Tối đa 1 video, dung lượng không quá 100MB
              </p>
            </div>
          </div>

          <Form.Item className="mt-6">
            <Button type="primary" htmlType="submit" block>
              Tiếp tục
            </Button>
          </Form.Item>
        </Form>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Chọn hình thức đăng tin
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <Button
              size="large"
              onClick={() => handlePostTypeSelect("rent")}
              block
            >
              Cho thuê
            </Button>
            <Button
              size="large"
              onClick={() => handlePostTypeSelect("sell")}
              block
            >
              Bán
            </Button>
            <Button
              size="large"
              onClick={() => handlePostTypeSelect("auction")}
              block
            >
              Đấu giá
            </Button>
          </div>
        </div>
      )}

      {renderPriceModal()}
    </div>
  );
};

export default CreatePost;
