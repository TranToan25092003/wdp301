import { customFetch } from "@/utils/customAxios";

export const getAllItems = async () => {
  const response = await customFetch.get("/items");
  return response.data;
};

export const getRecentItems = async (page = 1, limit = 8) => {
  const response = await customFetch.get("/items/recent", {
    params: { page, limit },
  });
  return response.data;
};

export const getItemsByCategory = async (categoryId) => {
  const res = await customFetch.get(`/items/category/${categoryId}`);
  return res.data;
};

export const getRecentItemsByCategory = async (categoryId) => {
  const res = await customFetch.get(`/items/category/${categoryId}/recent`);
  return res.data;
};

export const getUserUploadedItems = async (token) => {
  const response = await customFetch.get("/items/uploaded", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getItemDetailById = async (itemId) => {
  const res = await customFetch.get(`/items/${itemId}`);
  return res.data;
};

export const getFilteredItems = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value);
    }
  });
  const response = await customFetch.get(
    `/items/filter?${queryParams.toString()}`
  );
  return response.data;
};

export const createItem = async (itemData) => {
  try {
    console.log("Creating new item with data:", itemData);

    // Validate data trước khi gửi
    if (!itemData.name || !itemData.description || !itemData.price) {
      console.error("Missing required item data fields:", {
        hasName: !!itemData.name,
        hasDescription: !!itemData.description,
        hasPrice: !!itemData.price,
      });
      return {
        success: false,
        message: "Missing required fields: name, description or price",
      };
    }

    const response = await customFetch.post("/items", itemData);
    console.log("Create item response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating item:", error);

    // Xử lý các lỗi chi tiết
    if (error.response) {
      console.error("Server error response:", error.response.data);
      return {
        success: false,
        message: error.response.data.message || "Error creating item",
        error: error.response.data,
      };
    } else if (error.request) {
      console.error("No response received:", error.request);
      return {
        success: false,
        message: "No response from server",
      };
    } else {
      return {
        success: false,
        message: error.message || "Unknown error creating item",
      };
    }
  }
};

export const submitItemEditRequest = async (itemId, editData, token) => {
  try {
    console.log(`Submitting edit request for item ${itemId}:`, editData);
    console.log(`Using token length: ${token.length}`);

    if (!token) {
      console.error("Missing authentication token");
      return {
        success: false,
        message: "Authentication token is missing",
      };
    }

    const response = await customFetch.post(
      `/items/${itemId}/edit-request`,
      editData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(`API response status: ${response.status}`);
    console.log("API response data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in submitItemEditRequest:", error);
    if (error.response) {
      console.error("Error response status:", error.response.status);
      console.error("Error response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    }

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to submit edit request",
    };
  }
};

export const confirmItemDelivery = async (itemId, token) => {
  try {
    console.log("Sending confirmation request for item ID:", itemId);
    const response = await customFetch.post(
      `/items/confirm-delivery/${itemId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error confirming delivery:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to confirm delivery",
    };
  }
};

export const confirmItemReceipt = async (itemId, token) => {
  try {
    console.log("Sending receipt confirmation request for item ID:", itemId);
    const response = await customFetch.post(
      `/items/confirm-receipt/${itemId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error confirming receipt:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to confirm receipt",
    };
  }
};
