import { customFetch } from "@/utils/customAxios";

export const getAllStatuses = async () => {
  const response = await customFetch.get("/statuses");
  return response.data;
};
