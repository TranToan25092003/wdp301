import React, { useState } from "react";
import { Form, useActionData, useNavigate } from "react-router-dom";

const AddAuction = () => {
  const actionData = useActionData();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    startPrice: "",
    itemId: "",
    statusId: "",
  });

  React.useEffect(() => {
    if (actionData?.success) {
      navigate("/auctions");
    }
  }, [actionData, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Auction</h1>
      {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
      <Form method="post" className="flex flex-col gap-2 max-w-md">
        <input
          type="datetime-local"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="datetime-local"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="startPrice"
          value={formData.startPrice}
          onChange={handleChange}
          placeholder="Start Price"
          className="border p-2 rounded"
          required
          step="0.01"
          min="0"
        />
        <input
          type="text"
          name="itemId"
          value={formData.itemId}
          onChange={handleChange}
          placeholder="Item ID"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="statusId"
          value={formData.statusId}
          onChange={handleChange}
          placeholder="Status ID"
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Auction
        </button>
      </Form>
    </div>
  );
};

export default AddAuction;
