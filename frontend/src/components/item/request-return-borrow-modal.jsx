import React, { useState, useEffect } from "react";
import { Modal, Input, Spin } from "antd";
import { useAuth } from "@clerk/clerk-react";

import Swal from "sweetalert2";
import { requestForReturnBorrow } from "@/API/duc.api/borrow.api";

const RequestReturnModal = ({ visible, onCancel, borrowId, onSuccess, borrowRecords }) => {
  const { getToken } = useAuth();
  const [returnMessage, setReturnMessage] = useState('');
  const [returnError, setReturnError] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setReturnMessage('');
      setReturnError('');
      setReturnLoading(false);
    }
  }, [visible]);

  const handleReturnRequest = async () => {
    setReturnError('');
    if (!returnMessage.trim()) {
      setReturnError('Please provide a message for the return request.');
      return;
    }

    setReturnLoading(true);
    try {
      const token = await getToken();
      const response = await requestForReturnBorrow(
        { borrowId, message: returnMessage },
        token
      );
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: response.message,
        confirmButtonText: 'OK',
      });
      onSuccess();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to request return. Please try again.',
        confirmButtonText: 'OK',
      });
      setReturnError(error.response?.data?.message || 'Failed to request return. Please try again.');
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <Modal
      title="Request Return"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={400}
    >
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <Input.TextArea
            value={returnMessage}
            onChange={(e) => setReturnMessage(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            placeholder="Enter your return request message"
            rows={4}
            disabled={returnLoading}
          />
        </div>
        {returnError && <p className="text-red-500 text-sm mb-4">{returnError}</p>}
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="mr-2 bg-gray-300 px-4 py-2 rounded"
            disabled={returnLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleReturnRequest}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={returnLoading}
          >
            {returnLoading ? <Spin size="small" /> : 'Submit Request'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RequestReturnModal;