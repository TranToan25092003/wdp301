import React, { useState } from "react";
import { Modal, Button } from "antd";
import Swal from "sweetalert2";
import { useAuth } from "@clerk/clerk-react";
import { confirmBuyItemReceipt } from "@/API/duc.api/buy.api";

const ConfirmBuyReceiptModal = ({ visible, onCancel, onSuccess, buyId }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await confirmBuyItemReceipt(buyId, token);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.message,
          confirmButtonText: "OK",
        });
        onSuccess(); 
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to confirm receipt. Please try again.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      onCancel(); // Close modal after action
    }
  };

  return (
    <Modal
      title="Confirm Receipt"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          loading={loading}
          className="bg-green-500 hover:bg-green-600"
        >
          Confirm Receipt
        </Button>,
      ]}
    >
      <p>Are you sure you have received the item? Confirming will transfer the payment to the seller.</p>
    </Modal>
  );
};

export default ConfirmBuyReceiptModal;