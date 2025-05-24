import { customFetch } from "@/utils/customAxios";

export const getAllItems = async () => {
  const response = await customFetch.get("/items");
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

export const getItemDetailById = async (itemId) => {
  const res = await customFetch.get(`/items/${itemId}`);
  return res.data;
};