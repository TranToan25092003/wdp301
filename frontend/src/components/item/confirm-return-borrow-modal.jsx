import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import Swal from "sweetalert2";
import { useAuth } from "@clerk/clerk-react";
import { confirmReturnBorrow } from "@/API/duc.api/borrow.api";

const ConfirmReturnModal = ({ visible, onCancel, onSuccess, borrowId, borrowRecords }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(false); // Reset loading state when modal opens
    }
  }, [visible]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await confirmReturnBorrow(borrowId, token);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.message,
          confirmButtonText: "OK",
        });
        onSuccess(); // Trigger success callback to update parent state
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to confirm return. Please try again.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      onCancel(); // Close modal after action
    }
  };

  return (
    <Modal
      title="Confirm Return"
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
          className="bg-blue-500 hover:bg-blue-600"
        >
          Confirm
        </Button>,
      ]}
    >
      <p>Are you sure you want to confirm the return for this borrow? This action cannot be undone.</p>
    </Modal>
  );
};

export default ConfirmReturnModal;