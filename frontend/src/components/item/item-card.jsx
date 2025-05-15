import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { formatPrice } from "../../lib/utils";

export default function ItemCard({ item }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const {
    _id,
    name,
    category,
    images,
    description,
    price,
    rate,
    isFree,
    status,
  } = item;

  const statusColor =
    status === "available"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  const defaultImage = "/placeholder.svg?height=200&width=300";
  const displayImage = images && images.length > 0 ? images[0] : defaultImage;

  // Use "giờ" for hour rate, but keep "day" in English
  const rateText = rate === "day" ? "day" : "giờ";

  const handleConfirmBorrow = () => {
    navigate("/checkout-item", {
      state: {
        borrowerClerkId: userId,
        itemId: item._id,
        name: item.name,
        price: item.price,
        isFree: item.isFree,
        rate: item.rate,
        image: displayImage,
        description: item.description,
      },
    });
  };
  console.log(status);
  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
        <Link to={`/listItem/${_id}`} className="flex-grow flex flex-col">
          <div className="relative h-48 w-full">
            <img
              src={displayImage || "/placeholder.svg"}
              alt={name}
              className="object-cover w-full h-full"
            />
            {isFree && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500">Free</Badge>
              </div>
            )}
          </div>

          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{name}</CardTitle>
              <Badge className={statusColor}>
                {status === "available" ? "Available" : "Not Available"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{category}</p>
          </CardHeader>

          <CardContent className="flex-grow">
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold text-lg">
                {isFree ? "FREE" : `${formatPrice(price)}/${rateText}`}
              </div>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </CardContent>
        </Link>

        <CardFooter className="pt-0">
          <Button
            variant="default"
            className="w-full"
            disabled={status !== "available"}
            onClick={() => setIsDialogOpen(true)}
          >
            {status === "available" ? "Borrow Now" : "Not Available"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Borrow {name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24">
                <img
                  src={displayImage || "/placeholder.svg"}
                  alt={name}
                  className="object-cover w-full h-full rounded-md"
                />
              </div>
              <div>
                <h3 className="font-medium">{name}</h3>
                <p className="text-sm text-muted-foreground">{category}</p>
                <p className="font-bold mt-1">
                  {isFree ? "FREE" : `${formatPrice(price)}/${rateText}`}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm mb-4">
                {description || "No description available."}
              </p>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleConfirmBorrow}>Confirm Borrow</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
