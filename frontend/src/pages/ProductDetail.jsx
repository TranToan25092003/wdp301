import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  ShoppingCart,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getItemDetailById, getItemsByCategory } from "@/API/duc.api/item.api";
import { useLoaderData, useNavigate } from "react-router-dom";
import ProductList from "@/components/item/item-list";
import { Tag } from "antd";
import BorrowModal from "@/components/item/borrow-modal";
import BuyModal from "@/components/item/buy-modal";
import { Carousel } from "antd";
import { Clock } from "lucide-react";
import { CheckSquare } from "lucide-react";
import { RotateCcw } from "lucide-react";
import { Gavel } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import AuthRequiredModal from "../components/global/AuthRequiredModal";
import { Truck } from "lucide-react";
import ConfirmBuyReceiptModal from "@/components/item/confirm-buy-receipt-modal";
import { getBuyRecordByItemId } from "@/API/duc.api/buy.api";
import { filterNonDisplayableItems } from "@/lib/utils";

const statusConfig = {
  Available: { icon: CheckCircle, color: "text-green-600", label: "Available" },
  Pending: { icon: Clock, color: "text-yellow-600", label: "Pending" },
  Approved: { icon: CheckSquare, color: "text-blue-600", label: "Approved" },
  Rejected: { icon: XCircle, color: "text-red-600", label: "Rejected" },
  Sold: { icon: Tag, color: "text-purple-600", label: "Sold" },
  Borrowed: { icon: RotateCcw, color: "text-orange-600", label: "Borrowed" },
  Returned: { icon: CheckCircle, color: "text-teal-600", label: "Returned" },
  Auctioning: { icon: Gavel, color: "text-indigo-600", label: "Auctioning" },
  "Pending Delivery": {
    icon: Truck,
    color: "text-gray-600",
    label: "Pending Delivery",
  },
  "Awaiting Receipt": {
    icon: Truck,
    color: "text-orange-600",
    label: "Awaiting Receipt",
  },
};

export const productDetailLoader = async ({ params }) => {
  try {
    const data = await getItemDetailById(params.itemId);

    // Nếu sản phẩm có trạng thái pending hoặc rejected, chuyển hướng về trang chủ
    const status = data.data?.statusId?.name?.toLowerCase();
    if (status === "pending" || status === "rejected") {
      throw new Response("Product not available", { status: 404 });
    }

    const relatedItemsData = await getItemsByCategory(data.data.categoryId._id);
    // Lọc các sản phẩm liên quan có trạng thái pending hoặc rejected
    const relatedItems = filterNonDisplayableItems(
      relatedItemsData.data.filter((i) => i._id !== data.data._id)
    );

    return {
      product: data.data,
      relatedItems,
    };
  } catch (error) {
    console.error("Failed to load product:", error);
    throw new Response("Product not found", { status: 404 });
  }
};

export default function ProductDetail() {
  const { product, relatedItems } = useLoaderData();
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [confirmReceiptModalOpen, setConfirmReceiptModalOpen] = useState(false);
  const [buyId, setBuyId] = useState(null); // State to store buyId
  const navigate = useNavigate();
  const { isSignedIn, getToken, userId } = useAuth();

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  console.log(buyId);
  useEffect(() => {
    const fetchBuyRecord = async () => {
      try {
        // Check both status types that need the buyer's attention
        if (
          product.statusId?.name === "Pending Delivery" ||
          product.statusId?.name === "Awaiting Receipt"
        ) {
          if (isSignedIn) {
            console.log("Checking buy record for item:", product._id);
            const token = await getToken();
            if (!token) {
              console.log("No authentication token available");
              return;
            }

            const response = await getBuyRecordByItemId(product._id, token);
            console.log("Buy record response:", response);

            if (response.success) {
              // If current user is the buyer, set buyId
              if (response.data.buyer === userId) {
                console.log(
                  "User is buyer - setting buyId:",
                  response.data._id
                );
                setBuyId(response.data._id);
              }
            }
          }
        } else {
          setBuyId(null); // Reset buyId for other statuses
        }
      } catch (error) {
        console.error("Error fetching buy record:", error);
      }
    };

    fetchBuyRecord();
  }, [product, getToken, userId, isSignedIn]);

  // Handle image display
  const renderImages = () => {
    if (!product.images || product.images.length === 0) {
      return (
        <img
          src="/fallback.jpg"
          alt={product.name}
          className="rounded-md object-cover w-full h-auto border-2 border-gray-200"
        />
      );
    }

    if (product.images.length === 1) {
      return (
        <img
          src={product.images[0]}
          alt={product.name}
          className="rounded-md object-cover w-full h-auto border-2 border-gray-200"
        />
      );
    }

    return (
      <Carousel
        autoplay
        dots={{ className: "carousel-dots" }}
        style={{ height: "400px", width: "100%" }}
      >
        {product.images.map((image, index) => (
          <div key={index}>
            <img
              src={image}
              alt={`${product.name}-${index}`}
              style={{ objectFit: "cover", height: "400px", width: "100%" }}
              className="rounded-md border-2 border-gray-200"
            />
          </div>
        ))}
      </Carousel>
    );
  };

  // Render seller information
  const renderSellerInfo = () => {
    if (!product.ownerInfo) {
      return (
        <p className="text-sm text-gray-700">
          No seller information available.
        </p>
      );
    }

    const { name, imageUrl, hasImage, emailAddresses, phoneNumbers } =
      product.ownerInfo;

    const handleChatClick = () => {
      if (isSignedIn) {
        navigate(`/chat?seller=${product.owner}`);
      } else {
        setAuthModalOpen(true);
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          {hasImage && imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"></div>
          )}

          {/* Tên người bán và nút nhắn tin */}
          <div className="flex-1 flex justify-between items-center">
            <p className="text-lg font-semibold">
              {name || "Anonymous Seller"}
            </p>
            {/* Nút nhắn tin nếu có product.owner và name khác "Anonymous Seller" */}
            {product.owner && name && name !== "Anonymous Seller" && (
              <Button type="primary" onClick={handleChatClick}>
                Nhắn tin với người bán
              </Button>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <p className="text-sm text-gray-700 font-medium">Email:</p>
          {emailAddresses?.length > 0 ? (
            <ul className="text-sm text-gray-700 list-disc pl-5">
              {emailAddresses.map((email, index) => (
                <li key={index}>{email}</li>
              ))}
            </ul>
          ) : (
            <ul className="text-sm text-gray-700 list-disc pl-5">
              <li>Unknown</li>
            </ul>
          )}
        </div>

        {/* Phone */}
        <div>
          <p className="text-sm text-gray-700 font-medium">Phone:</p>
          {phoneNumbers?.length > 0 ? (
            <ul className="text-sm text-gray-700 list-disc pl-5">
              {phoneNumbers.map((phone, index) => (
                <li key={index}>{phone}</li>
              ))}
            </ul>
          ) : (
            <ul className="text-sm text-gray-700 list-disc pl-5">
              <li>Unknown</li>
            </ul>
          )}
        </div>
      </div>
    );
  };

  const status = product.statusId?.name || "Unknown";
  const {
    icon: StatusIcon,
    color: statusColor,
    label: statusLabel,
  } = statusConfig[status] || {
    icon: XCircle,
    color: "text-gray-600",
    label: "Unknown",
  };

  const handleConfirmReceiptSuccess = async () => {
    // Refresh product details after confirmation
    const token = await getToken();
    const data = await getItemDetailById(product._id, token);
    if (data.success) {
      navigate(0); // Reload the page to reflect updated status
    }
  };

  // Render a special banner for the buyer when status is "Awaiting Receipt"
  const renderReceiptBanner = () => {
    if (product.statusId?.name === "Awaiting Receipt" && buyId) {
      return (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 my-4 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="text-orange-500 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-orange-800 font-medium">
                Hành động cần thiết
              </h3>
              <p className="text-orange-700 mt-1">
                Người bán đã xác nhận giao hàng. Vui lòng xác nhận bạn đã nhận
                được hàng sau khi kiểm tra sản phẩm.
              </p>
              <Button
                className="mt-3 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => setConfirmReceiptModalOpen(true)}
              >
                <CheckCircle size={16} className="mr-2" />
                Xác nhận đã nhận hàng
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div>{renderImages()}</div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="text-xl font-semibold text-primary">
            {formatPrice(product.price)}
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Rate Type: </span>
            <span className="font-medium uppercase">{product.ratePrice}</span>
          </div>
          <div>
            <Tag color="blue" className="text-2xl">
              {product.typeId?.name || "Unknown Type"}
            </Tag>
          </div>
          <div className="flex items-center gap-2 my-2">
            <StatusIcon className={statusColor} size={24} />
            <span className={`${statusColor} font-medium text-lg`}>
              {statusLabel}
            </span>

            {/* Add extra info for Awaiting Receipt status */}
            {product.statusId?.name === "Awaiting Receipt" && buyId && (
              <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Chờ xác nhận nhận hàng
              </span>
            )}

            {product.statusId?.name === "Pending Delivery" && buyId && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Đang giao hàng
              </span>
            )}
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Seller: </span>
            <span className="font-medium">
              {product.ownerInfo?.name || "Anonymous Seller"}
            </span>
          </div>

          {/* Display button based on status and user role */}
          <div className="pt-4">
            {product.typeId?.name === "Sell" &&
              (product.statusId?.name === "Available" ||
                product.statusId?.name === "Approved") && (
                <>
                  <Button
                    className="flex items-center gap-2"
                    onClick={() => setBuyModalOpen(true)}
                    disabled={isPurchasing}
                  >
                    <ShoppingCart size={18} />
                    Buy Now
                  </Button>
                  <BuyModal
                    open={buyModalOpen}
                    onClose={() => setBuyModalOpen(false)}
                    product={product}
                    setIsPurchasing={setIsPurchasing}
                  />
                </>
              )}

            {product.typeId?.name === "Borrow" &&
              (product.statusId?.name === "Available" ||
                product.statusId?.name === "Approved") && (
                <>
                  <Button
                    className="flex items-center gap-2"
                    onClick={() => setBorrowModalOpen(true)}
                  >
                    <ShoppingCart size={18} /> Borrow now
                  </Button>
                  <BorrowModal
                    open={borrowModalOpen}
                    onClose={() => setBorrowModalOpen(false)}
                    product={product}
                  />
                </>
              )}

            {product.typeId?.name === "Auction" &&
              product.statusId?.name === "Available" && (
                <>
                  <Button className="flex items-center gap-2">
                    <ShoppingCart size={18} /> Place Bid
                  </Button>
                </>
              )}

            {/* Show receipt confirmation button for awaiting receipt status */}
            {product.statusId?.name === "Awaiting Receipt" && buyId && (
              <div>
                <p className="text-sm text-orange-600 mb-2">
                  <AlertTriangle size={14} className="inline mr-1" />
                  Người bán đã xác nhận giao hàng! Vui lòng xác nhận khi bạn đã
                  nhận được hàng.
                </p>
                <Button
                  className="flex items-center gap-2 mt-2 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => setConfirmReceiptModalOpen(true)}
                >
                  <CheckCircle size={18} />
                  Xác nhận đã nhận hàng
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {renderReceiptBanner()}

      <Tabs defaultValue="description" className="w-full mt-4">
        <TabsList className="w-full flex justify-start">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="seller">Seller Info</TabsTrigger>
        </TabsList>

        <TabsContent value="description">
          <section className="border rounded-lg p-4 bg-white shadow-sm mt-2">
            <h3 className="text-lg font-semibold mb-2">Product Description</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {product.description || "No description provided."}
            </p>
          </section>
        </TabsContent>

        <TabsContent value="seller">
          <section className="border rounded-lg p-4 bg-white shadow-sm mt-2">
            <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
            {renderSellerInfo()}
          </section>
        </TabsContent>
      </Tabs>

      {/* Related Products Section */}
      {relatedItems.length > 0 && (
        <section style={{ marginTop: "2%" }}>
          <ProductList title="Related Products" products={relatedItems} />
        </section>
      )}

      {/* Auth Required Modal */}
      <AuthRequiredModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        featureName="nhắn tin với người bán"
        returnUrl={window.location.pathname}
      />

      {/* Confirm Buy Receipt Modal */}
      <ConfirmBuyReceiptModal
        visible={confirmReceiptModalOpen}
        onCancel={() => setConfirmReceiptModalOpen(false)}
        onSuccess={handleConfirmReceiptSuccess}
        buyId={buyId}
      />
    </div>
  );
}
