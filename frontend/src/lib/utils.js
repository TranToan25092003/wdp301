import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format price in Vietnamese Dong (VND)
export function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);
}

// Function to format date
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Lọc bỏ các sản phẩm có trạng thái pending hoặc rejected
 * @param {Array} items - Mảng các sản phẩm cần lọc
 * @returns {Array} - Mảng các sản phẩm đã lọc
 */
export const filterNonDisplayableItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items.filter((item) => {
    const status =
      item?.statusId?.name?.toLowerCase() || item?.status?.toLowerCase();
    return status !== "pending" && status !== "rejected";
  });
};

/**
 * Lọc các phiên đấu giá dựa trên trạng thái của sản phẩm và phiên đấu giá
 * @param {Array} auctions - Mảng các phiên đấu giá cần lọc
 * @returns {Array} - Mảng các phiên đấu giá đã lọc
 */
export const filterNonDisplayableAuctions = (auctions) => {
  if (!Array.isArray(auctions)) return [];

  return auctions.filter((auction) => {
    // Kiểm tra trạng thái của sản phẩm trong đấu giá
    const itemStatus =
      auction?.itemId?.statusId?.name?.toLowerCase() ||
      auction?.itemId?.status?.toLowerCase();

    // Kiểm tra trạng thái của phiên đấu giá
    const auctionStatus = auction?.status?.toLowerCase();

    // Chỉ hiển thị các phiên đấu giá có sản phẩm không phải pending/rejected
    // và phiên đấu giá đang hoạt động
    return (
      itemStatus !== "pending" &&
      itemStatus !== "rejected" &&
      auctionStatus !== "cancelled" &&
      auctionStatus !== "deleted"
    );
  });
};
