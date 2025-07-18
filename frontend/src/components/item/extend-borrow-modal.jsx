import React, { useState, useEffect } from "react";
import { Modal, Input, Spin } from "antd";
import { useAuth } from "@clerk/clerk-react";
import { extendBorrow } from "@/API/duc.api/borrow.api";
import Swal from "sweetalert2"; // Import SweetAlert2

const ExtendBorrowModal = ({ visible, onCancel, borrowId, onSuccess, borrowRecords }) => {
  const { getToken } = useAuth();
  const [newEndTime, setNewEndTime] = useState('');
  const [extensionError, setExtensionError] = useState('');
  const [loading, setLoading] = useState(false); // State for spinner

  useEffect(() => {
    if (visible) {
      setNewEndTime('');
      setExtensionError('');
      setLoading(false); // Reset loading state
    }
  }, [visible]);

  const handleExtendBorrow = async () => {
    setExtensionError(''); // Clear previous errors
    const newEndTimeDate = new Date(newEndTime);

    // Client-side validation
    if (!newEndTime || isNaN(newEndTimeDate.getTime())) {
      setExtensionError('Please enter a valid date and time for the new end time.');
      return;
    }

    const currentDate = new Date();
    const currentBorrow = borrowRecords.find((record) => record.borrowId === borrowId);
    if (!currentBorrow) {
      setExtensionError('Borrow record not found.');
      return;
    }

    const currentEndTime = new Date(currentBorrow.endTime);
    if (newEndTimeDate <= currentDate) {
      setExtensionError('New end time must be a future date.');
      return;
    }
    if (newEndTimeDate <= currentEndTime) {
      setExtensionError('New end time must be after the current end time.');
      return;
    }
    if (currentBorrow.status !== 'borrowed') {
      setExtensionError('Cannot extend a borrow that is not in "borrowed" status.');
      return;
    }

    setLoading(true); // Start spinner
    try {
      const token = await getToken();
      const response = await extendBorrow(
        { borrowId, newEndTime: newEndTimeDate.toISOString() },
        token
      );
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: response.message,
          confirmButtonText: 'OK',
        });
        onSuccess();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to extend borrow. Please try again.',
        confirmButtonText: 'OK',
      });
      setExtensionError(error.response?.data?.message || 'Failed to extend borrow. Please try again.');
    } finally {
      setLoading(false); // Stop spinner
    }
  };

  return (
    <Modal
      title="Extend Borrow"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={400}
    >
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">New End Time</label>
          <Input
            type="datetime-local"
            value={newEndTime}
            onChange={(e) => setNewEndTime(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            disabled={loading} // Disable input while loading
          />
        </div>
        {extensionError && <p className="text-red-500 text-sm mb-4">{extensionError}</p>}
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="mr-2 bg-gray-300 px-4 py-2 rounded"
            disabled={loading} // Disable cancel button while loading
          >
            Cancel
          </button>
          <button
            onClick={handleExtendBorrow}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading} // Disable confirm button while loading
          >
            {loading ? <Spin size="small" /> : 'Confirm Extend'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExtendBorrowModal;