import { customFetch } from "@/utils/customAxios";

export const createBorrow = async (borrowData, token) => {
  const response = await customFetch.post("/borrows", borrowData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};