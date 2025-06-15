import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import { purchaseItem } from "@/API/duc.api/buy.api";

const BuyModal = ({ open, onClose, product, setIsPurchasing }) => {
  const navigate = useNavigate();
  const { isSignedIn, getToken } = useAuth();

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const handlePurchase = async () => {
    if (!isSignedIn) {
      onClose();
      await Swal.fire({
        icon: "warning",
        title: "You must sign in",
        text: "Please sign in before purchasing this item.",
        confirmButtonText: "OK",
      });
      return;
    }

    onClose();

    const result = await Swal.fire({
      title: `Confirm Purchase`,
      html: `
        <p>Do you want to purchase <strong>"${product.name}"</strong>?</p>
        <p>Total: <strong>${formatPrice(product.price)}</strong></p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed to payment",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setIsPurchasing(true);
      setIsPurchasing(true);
      try {
        const token = await getToken();
        const response = await purchaseItem(product._id, token);
        console.log(response)
        await Swal.fire({
          icon: "success",
          title: "Purchase Successful!",
          text: "Your purchase has been completed.",
          confirmButtonText: "OK",
        });
        navigate("/");
      } catch (error) {
        console.error("Purchase error:", error);
        const errorMessage =
          error?.response?.data?.message || "Failed to complete purchase. Please try again.";
        await Swal.fire({
          icon: "error",
          title: "Purchase Failed",
          text: errorMessage,
          confirmButtonText: "OK",
        });
      } finally {
        setIsPurchasing(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase "{product?.name}"</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <img
            src={product?.images[0] || "/fallback.jpg"}
            alt={product?.name}
            className="rounded-md object-cover w-full h-48 border-2 border-gray-200"
          />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {product?.description || "No description provided."}
            </p>
            <p className="text-lg font-semibold text-primary">
              Price: {formatPrice(product?.price)}
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handlePurchase}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BuyModal;