import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLoaderData } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ErrorPage from "@/components/global/Error";
import { customFetch } from "@/utils/customAxios";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import SheetComponent from "@/components/item/SheetComponent";
import { useState } from "react";

/**
 * ====================================
 * loader
 * ====================================
 */
export const browseLoader = async () => {
  try {
    const browseItemData = await customFetch("/admin/items/browse");

    return {
      data: browseItemData.data.data,
    };
  } catch (error) {
    return {
      message: "something wrong",
    };
  }
};

/**
 * ====================================
 * Page
 * ====================================
 */
export const BrowseItem = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [submit, setSubmit] = useState(false);

  const { message, data } = useLoaderData();

  if (message) {
    return <ErrorPage errorCode={"400"} message={message}></ErrorPage>;
  }

  const products = data;

  return (
    <div className="min-h-screen  p-4">
      <div className=" rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-semibold text-[#1DCD9F] mb-4">
          Waiting list
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
                    <AlertDialog>
                      <AlertDialogTrigger
                        className="bg-[#169976] text-white hover:bg-[#1DCD9F] 
  px-4 py-2 rounded-full cursor-pointer w-9 h-9 
  flex items-center justify-center"
                      >
                        {submit == true ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-4 border-b-4 bg-red-600 border-white"></div>
                        ) : (
                          "⛏"
                        )}
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This item will be available for everyone in system
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className={"cursor-pointer"}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className={"bg-green-400 cursor-pointer"}
                            onClick={async () => {
                              try {
                                setSubmit(true);
                                await customFetch.post("/admin/items/approve", {
                                  itemId: product._id,
                                  approve: true,
                                });

                                toast("Item approve successfully");
                                setSubmit(false);
                                navigate(location.pathname, { replace: true });
                              } catch (error) {
                                toast("error in approve item");
                              }
                            }}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <SheetComponent itemId={product._id}></SheetComponent>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BrowseItem;
