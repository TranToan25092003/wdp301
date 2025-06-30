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
  const response = await customFetch.get(
    "/buys",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

