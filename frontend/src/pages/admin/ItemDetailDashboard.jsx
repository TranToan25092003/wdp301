import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { customFetch } from "@/utils/customAxios";
import { useLoaderData } from "react-router-dom";

export const itemDetailDashboardLoader = async ({ params }) => {
  try {
    const { id } = params;

    const response = (await customFetch(`/admin/items/${id}/detail`)).data;

    const itemData = response.data;

    return {
      itemData,
    };
  } catch (error) {
    toast.error("Error at item detail dashboard");
  }
};

// Sample data (replace with actual API data)
// const itemData = {
//   _id: "682ff1114a0495973b61df65",
//   name: "Dell Laptop XPS 13",
//   description:
//     "High-performance Dell XPS 13 laptop with Intel i7, 16GB RAM, perfect for programming and remote work.",
//   price: 500,
//   images: ["/assets/sample.jpg"],
//   type: "Borrow",
//   category: {
//     name: "Electronics",
//     image: "/assets/category-electronics.jpeg",
//   },
//   status: "Available",
//   owner: {
//     id: "user_2xLGz5TgIOkrbOYpofMCfYyvWvt",
//     firstName: "Minh Đức",
//     lastName: "Hà Quốc",
//     email: "haquocminhduc@gmail.com",
//     image:
//       "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yeExHejVVQWgxdlNrZ1V1a3dUaGdDMVZva2kifQ",
//   },
// };

// Animation variants for Framer Motion
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const textVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.2 } },
};

export function ItemDetailDashboard() {
  const { itemData } = useLoaderData();

  const {
    _id,
    name,
    description,
    price,
    images,
    type,
    category,
    status,
    owner,
  } = itemData;

  return (
    <div className="container mx-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-950 dark:to-zinc-900 min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="max-w-4xl mx-auto"
      >
        <Card className="shadow-xl border-0 overflow-hidden bg-white dark:bg-zinc-800 rounded-2xl">
          <CardHeader className="bg-primary/10 dark:bg-primary/20">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Item Image and Core Details */}
            <div className="flex flex-col md:flex-row gap-6">
              <motion.img
                src={images[0]}
                alt={name}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                className="w-full md:w-80 h-64 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
              />
              <motion.div
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 space-y-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Description
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Item ID:
                    </span>{" "}
                    {_id}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Type:
                    </span>{" "}
                    {type}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Price:
                    </span>{" "}
                    ${price}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Status:
                    </span>{" "}
                    <Badge
                      variant={status === "Available" ? "default" : "secondary"}
                      className="hover:bg-primary/80 transition-colors"
                    >
                      {status}
                    </Badge>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Category:
                    </span>{" "}
                    {category.name}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Owner Information */}
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="border-t pt-4 dark:border-zinc-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Owner Information
              </h3>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                  <AvatarImage
                    src={owner.image}
                    alt={`${owner.firstName} ${owner.lastName}`}
                  />
                  <AvatarFallback>
                    {owner.firstName[0]}
                    {owner.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {owner.firstName} {owner.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {owner.email}
                  </p>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
