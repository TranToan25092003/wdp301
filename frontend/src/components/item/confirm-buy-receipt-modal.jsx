import React, { useState } from "react";
import { Modal, Button, Alert, Space } from "antd";
import Swal from "sweetalert2";
import { useAuth } from "@clerk/clerk-react";
import { confirmBuyItemReceipt } from "@/API/duc.api/buy.api";
import { CheckCircle, AlertTriangle } from "lucide-react";

const ConfirmBuyReceiptModal = ({ visible, onCancel, onSuccess, buyId }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      console.log("Confirming receipt for buyId:", buyId);

      if (!token) {
        throw new Error(
          "No authentication token available. Please try logging in again."
        );
      }

      if (!buyId) {
        throw new Error(
          "No transaction ID found. Please refresh the page and try again."
        );
      }

      const response = await confirmBuyItemReceipt(buyId, token);
      console.log("Confirmation response:", response);

      if (response && response.success) {
        setLoading(false);
        onCancel(); // Close modal on success

        Swal.fire({
          icon: "success",
          title: "Xác nhận thành công!",
          text:
            response.message ||
            "Bạn đã xác nhận nhận hàng thành công. Thanh toán đã được chuyển cho người bán.",
          confirmButtonText: "Đóng",
        });

        onSuccess();
      } else {
        throw new Error(response?.message || "Failed to confirm receipt");
      }
    } catch (error) {
      console.error("Error confirming receipt:", error);
      setLoading(false); // Stop loading but don't close modal

      Swal.fire({
        icon: "error",
        title: "Lỗi xác nhận",
        text:
          error.response?.data?.message ||
          error.message ||
          "Không thể xác nhận nhận hàng. Vui lòng thử lại sau.",
        confirmButtonText: "Đóng",
      });

      // Do not close modal on error so user can try again
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center text-green-600">
          <CheckCircle className="mr-2" /> Xác nhận đã nhận hàng
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Hủy bỏ
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          loading={loading}
          className="bg-green-500 hover:bg-green-600"
        >
          Xác nhận đã nhận hàng
        </Button>,
      ]}
      width={500}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <p className="text-base">
          Bạn xác nhận đã nhận được hàng và sản phẩm đúng như mô tả?
        </p>

        <Alert
          message="Lưu ý quan trọng"
          description={
            <ul className="list-disc pl-5 text-sm">
              <li>Khi xác nhận, tiền sẽ được chuyển đến người bán</li>
              <li>Hãy kiểm tra kỹ sản phẩm trước khi xác nhận</li>
              <li>Sau khi xác nhận, bạn không thể hoàn tác hành động này</li>
            </ul>
          }
          type="warning"
          showIcon
          icon={<AlertTriangle className="text-amber-500" />}
          className="my-3"
        />

        <div className="text-right text-gray-500 text-sm mt-3">
          Mã giao dịch: {buyId}
        </div>
      </Space>
    </Modal>
  );
};

export default ConfirmBuyReceiptModal;
