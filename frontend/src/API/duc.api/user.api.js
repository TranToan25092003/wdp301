import { customFetch } from "@/utils/customAxios";

export const getUserInformation = async (userId) => {
  const response = await customFetch.get(`/users/${userId}`);
  return response.data;
};
