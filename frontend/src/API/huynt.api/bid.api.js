//bid.api.js
import { customFetch } from "@/utils/customAxios";

export const placeBid = async (bidData) => {
  const response = await customFetch.post("/bids", bidData);
  return response.data;
};
