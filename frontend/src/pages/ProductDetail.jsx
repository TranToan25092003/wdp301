import React from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ShoppingCart, CheckCircle, XCircle } from "lucide-react";
import imgSample from "/assets/sample.jpg"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getItemDetailById, getItemsByCategory } from "@/API/duc.api/item.api";
import { useLoaderData } from 'react-router-dom'
import ProductList from "@/components/item/item-list";

export const productDetailLoader = async ({ params }) => {
  try {
    const data = await getItemDetailById(params.itemId);
    const relatedItemsData = await getItemsByCategory(data.data.categoryId._id);
    const relatedItems = relatedItemsData.data.filter(i => i._id !== data.data._id);
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

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  console.log(product)

  return (
    <div className="container mx-auto p-6">
      <Card className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div>
          <img
            src={product.images[0] || "/fallback.jpg"}
            alt={product.name}
            className="rounded-md object-cover w-full h-auto border-2 border-gray-200"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">{product.description}</p>
          <div className="text-xl font-semibold text-primary">
            {formatPrice(product.price)}
          </div>
          <div className="flex items-center gap-2">
            {product.statusId?.name === "Available" ? (
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
            <span className="font-medium">{product.ratePrice}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Seller ID: </span>
            <span className="font-medium">{product.owner}</span>
          </div>
          <div className="pt-4">
            <Button
              disabled={product.statusId?.name !== "Available"}
              className="flex items-center gap-2"
            >
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
            <p className="text-sm text-gray-700">ID: {product.owner}</p>
          </section>
        </TabsContent>
      </Tabs>

      {/* Related Products Section */}
      {relatedItems.length > 0 && (
        <section style={{marginTop: "2%"}}>
          <ProductList title="Related Products" products={relatedItems} />
        </section>
      )}

    </div>
  );
}
