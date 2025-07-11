import { customFetch } from "@/utils/customAxios";

export const createBorrow = async (borrowData, token) => {
  const response = await customFetch.post("/borrows", borrowData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getAllBorrowRecord = async (token) => {
  const response = await customFetch.get("/borrows", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const extendBorrow = async (body, token) => {
  const response = await customFetch.patch("/borrows/extend", body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const requestForReturnBorrow = async (body, token) => {
  const response = await customFetch.post("/borrows/request-return", body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const confirmReturnBorrow = async (borrowId, token) => {
  const response = await customFetch.patch(`/borrows/confirm-return/${borrowId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
