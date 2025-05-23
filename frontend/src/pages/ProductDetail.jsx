import React from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ShoppingCart, CheckCircle, XCircle } from "lucide-react";
import imgSample from "/assets/sample.jpg"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const product = {
  id: "123",
  name: "Wireless Headphones",
  description:
    "High-quality wireless headphones with noise cancellation and long battery life.",
  price: 1499000,
  image: imgSample,
  status: "available", // or "notAvailable"
  seller: {
    name: "John Doe",
    contact: "johndoe@example.com",
    location: "Hanoi, Vietnam",
  },
  rate: "Per Day",
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function ProductDetail() {
  return (
    <div className="container mx-auto p-6">
      <Card className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Image */}
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="rounded-md object-cover w-full h-auto border-2 border-gray-200"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">{product.description}</p>

          <div className="text-xl font-semibold text-primary">
            {formatPrice(product.price)}
          </div>

          <div className="flex items-center gap-2">
            {product.status === "available" ? (
              <>
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-green-600 font-medium">Available</span>
              </>
            ) : (
              <>
                <XCircle className="text-red-600" size={20} />
                <span className="text-red-600 font-medium">Not Available</span>
              </>
            )}
          </div>

          <div>
            <span className="text-sm text-muted-foreground">Rate Type: </span>
            <span className="font-medium">{product.rate}</span>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">Seller: </span>
            <span className="font-medium">{product.seller.name}</span>
          </div>

          {/* Add to Cart */}
          <div className="pt-4">
            <Button disabled={product.status !== "available"} className="flex items-center gap-2">
              <ShoppingCart size={18} />
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="description" className="w-full mt-4">
        <TabsList className="w-full flex justify-start">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="seller">Seller Info</TabsTrigger>
        </TabsList>

        <TabsContent value="description">
          <section className="border rounded-lg p-4 bg-white shadow-sm mt-2">
            <h3 className="text-lg font-semibold mb-2">Product Description</h3>
            <p className="text-sm text-gray-700">
              {product.description || "No description provided."}
            </p>
          </section>
        </TabsContent>

        <TabsContent value="seller">
          <section className="border rounded-lg p-4 bg-white shadow-sm mt-2">
            <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
            <p className="text-sm text-gray-700">Name: {product.seller.name}</p>
            <p className="text-sm text-gray-700">Contact: {product.seller.contact}</p>
            <p className="text-sm text-gray-700">Location: {product.seller.location}</p>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
