import { Button } from "@/components/ui/button";
import { FaBan } from "react-icons/fa";

import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNavigate, useLocation } from "react-router-dom";

import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { customFetch } from "@/utils/customAxios";

const SheetComponent = ({ itemId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [submit, setSubmit] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="bg-[#af0b0b] text-white hover:bg-[#ffffff] hover:text-red-600 px-4 py-2 rounded-3xl ml-2 cursor-pointer"
          size={"icon"}
        >
          <FaBan />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Enter reason</SheetTitle>
          <SheetDescription>Reason reject this items</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="reason">Description</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
              }}
              className={"h-100 border-2"}
            />
          </div>
        </div>
        <SheetFooter>
          <Button
            type="button"
            disabled={submit}
            className={"cursor-pointer"}
            onClick={async () => {
              try {
                setSubmit(true);
                await customFetch.post("/admin/items/approve", {
                  itemId: itemId,
                  approve: false,
                  reason: reason,
                });
                toast("Item declined successfully");
                navigate(location.pathname, { replace: true });
              } catch (error) {
                toast("error in reject items");
              }
            }}
          >
            {submit == true ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              "Send"
            )}
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SheetComponent;
