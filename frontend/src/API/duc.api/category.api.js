import { customFetch } from "@/utils/customAxios";

export const getAllCategoriesWithStats = async () => {
  const response = await customFetch.get("/categories");
  return response.data;
};

// Add a new function to get categories without stats for forms
export const getAllCategories = async () => {
  try {
    const response = await customFetch.get("/categories");

    if (response.data && response.data.success && response.data.data) {
      // Format the categories consistently for forms
      return {
        success: true,
        data: response.data.data.map((category) => ({
          _id: category._id,
          name: category.title || category.name, // Use title or fallback to name
          value: category._id,
          label: category.title || category.name,
        })),
      };
    }

    return { success: false, message: "Invalid category data format" };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, message: error.message };
  }
};
