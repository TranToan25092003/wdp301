import { customFetch } from "@/utils/customAxios";

export const purchaseItem = async (itemId, token) => {
  const response = await customFetch.post(
    "/buys",
    { itemId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getAllBuyRecord = async (token) => {
  const response = await customFetch.get("/buys", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const confirmBuyItemReceipt = async (buyId, token) => {
  try {
    console.log(
      "Confirming receipt for buyId:",
      buyId,
      "with token:",
      token ? "Valid token" : "Missing token"
    );
    // Change the endpoint to match the backend router
    const response = await customFetch.patch(
      `/buys/${buyId}`,
      {}, // Empty body
      {
    headers: {
      Authorization: `Bearer ${token}`,
    },
      }
    );
  return response.data;
  } catch (error) {
    console.error("Error in confirmBuyItemReceipt:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to confirm receipt",
    };
  }
};

export const getBuyRecordByItemId = async (itemId, token) => {
  try {
    console.log("Fetching buy record for itemId:", itemId);
  const response = await customFetch.get(`/buys/item/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
  } catch (error) {
    console.error("Error fetching buy record:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch buy record",
    };
  }
};
