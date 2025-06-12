import { customFetch } from "@/utils/customAxios";

export const getAllTypes = async () => {
  const response = await customFetch.get("/types");
  return response.data;
};