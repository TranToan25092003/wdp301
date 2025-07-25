//auction.api.js
import { customFetch } from "@/utils/customAxios";

export const getAllAuctions = async () => {
  const response = await customFetch.get("/auctions/");
  return response.data;
};

export const deleteAuctionById = async (auctionId) => {
  const response = await customFetch.delete(`/auctions/delete/${auctionId}`);
  return response.data;
};

export const createAuction = async (auctionData) => {
  const response = await customFetch.post("/auctions/create", auctionData);
  return response.data;
};

export const getAuctionDetailById = async (auctionId) => {
  const response = await customFetch.get(`/auctions/auction/${auctionId}`);
  return response.data;
};

export const getAuctionById = async (auctionId) => {
  const response = await customFetch.get(`/auctions/${auctionId}`);
  return response.data;
};

export const updateAuction = async (auctionId, auctionData) => {
  const response = await customFetch.put(`/auctions/${auctionId}`, auctionData);
  return response.data;
};

export const getAuctionByItemId = async (itemId) => {
  try {
    const response = await customFetch.get(`/auctions/by-item/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching auction by itemId:", error);
    throw error;
  }
};
