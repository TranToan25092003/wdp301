import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { Pagination } from "@/components/ui/pagination";
import { PaginationDemo } from "@/components/global/PaginationComp";
import { FaBan } from "react-icons/fa6";
import { useLoaderData } from "react-router-dom";
import { customFetch } from "@/utils/customAxios";
export const itemsAdminLoader = async () => {
  try {
    const rawItemsData = await customFetch("/admin/items");

    const returnItemsData = rawItemsData.data.data;

    return {
      data: returnItemsData,
    };
  } catch (error) {}
};

// const products = [
//   {
//     _id: "682ff1114a0495973b61df65",
//     name: "Dell Laptop XPS 13",
//     price: 500,
//     image: "/assets/sample.jpg",
//     type: "Borrow",
//     status: "Available",
//     category: "Electronics",
//   },
//   {
//     _id: "682ff1244a0495973b61df66",
//     name: "Wooden Dining Table Set",
//     price: 100,
//     image: "/assets/sample.jpg",
//     type: "Borrow",
//     status: "Available",
//     category: "Furniture",
//   },
//   {
//     _id: "682ff13c4a0495973b61df67",
//     name: "Samsung Galaxy Tab S6",
//     price: 20,
//     image: "/assets/sample.jpg",
//     type: "Borrow",
//     status: "Available",
//     category: "Electronics",
//   },
//   {
//     _id: "682ff13c4a0495973b61df67",
//     name: "Samsung Galaxy Tab S6",
//     price: 20,
//     image: "/assets/sample.jpg",
//     type: "Borrow",
//     status: "Available",
//     category: "Electronics",
//   },
//   {
//     _id: "682ff13c4a0495973b61df67",
//     name: "Samsung Galaxy Tab S6",
//     price: 20,
//     image: "/assets/sample.jpg",
//     type: "Borrow",
//     status: "Available",
//     category: "Electronics",
//   },
//   {
//     _id: "682ff13c4a0495973b61df67",
//     name: "Samsung Galaxy Tab S6",
//     price: 20,
//     image: "/assets/sample.jpg",
//     type: "Borrow",
//     status: "Available",
//     category: "Electronics",
//   },
//   {
//     _id: "682ff13c4a0495973b61df67",
//     name: "Samsung Galaxy Tab S6",
//     price: 20,
//     image: "/assets/sample.jpg",
//     type: "Borrow",
//     status: "Available",
//     category: "Electronics",
//   },
//   {
//     _id: "682ff13c4a0495973b61df67",
//     name: "Samsung Galaxy Tab S6",
//     price: 20,
//     image: "/assets/sample.jpg",
//     type: "Borrow",
//     status: "Available",
//     category: "Electronics",
//   },
//   {
//     _id: "682ff13c4a0495973b61df67",
//     name: "Samsung Galaxy Tab S6",
//     price: 20,
//     image: "/assets/sample.jpg",
//     type: "Borrow",
//     status: "Available",
//     category: "Electronics",
//   },
// ];
const Items = () => {
  const { data } = useLoaderData();
  const products = data;

  return (
    <div className="min-h-screen  p-4">
      <div className="grid justify-items-end mb-2">
        <Select className="border-2 border-red-60 ">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectItem value="grapes">Grapes</SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className=" rounded-lg shadow-lg p-4 ">
        <h2 className="text-xl font-semibold text-[#1DCD9F] mb-4">
          Product List
        </h2>
        <Table>
          <TableHeader>
            <TableRow className=" border-[#169976]">
              <TableHead className="text-[#1DCD9F]">Image</TableHead>
              <TableHead className="text-[#1DCD9F]">Name</TableHead>
              <TableHead className="text-[#1DCD9F]">Price</TableHead>
              <TableHead className="text-[#1DCD9F]">Category</TableHead>
              <TableHead className="text-[#1DCD9F]">Type</TableHead>
              <TableHead className="text-[#1DCD9F]">Status</TableHead>
              <TableHead className="text-[#1DCD9F]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id} className="border-[#169976]">
                <TableCell>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.type}</TableCell>
                <TableCell>{product.status}</TableCell>
                <TableCell>
                  <div className="flex justify-center ">
                    <Button
                      className="bg-[#169976] text-white hover:bg-[#1DCD9F] px-4 py-2 rounded-md"
                      onClick={() => alert(`View ${product.name}`)}
                    >
                      View
                    </Button>
                    <Button
                      size={"icon"}
                      className={"hover:bg-white hover:text-red-700 ml-2 mr-0"}
                      variant={"destructive"}
                      onClick={() => alert(`View ${product.name}`)}
                    >
                      <FaBan></FaBan>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>{" "}
      <div className="mt-2">
        <PaginationDemo></PaginationDemo>
      </div>
    </div>
  );
};

export default Items;
