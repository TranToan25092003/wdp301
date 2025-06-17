import { customFetch } from "@/utils/customAxios";

export const getAllCategoriesWithStats = async () => {
  const response = await customFetch.get("/categories");
  return response.data;
};
