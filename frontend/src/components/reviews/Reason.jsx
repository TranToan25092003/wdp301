import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import Swal from "sweetalert2";
import { customFetch } from "@/utils/customAxios";
import { useAuth } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";

export function Reason({ url, children, lendId }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [reason, setReason] = useState("");

  const handleReject = async () => {
    const result = await Swal.fire({
      title: "Xác nhận phê duyệt",
      text: "Bạn có chắc chắn muốn phê duyệt không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Phê duyệt",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const { data } = await customFetch.put(url, {
          lendId,
          status: "rejected",
          reason,
        });

        // Fake action
        await Swal.fire({
          title: "Thành công!",
          text: "Đã phê duyệt ",
          icon: "success",
          confirmButtonColor: "#22c55e",
        });
        navigate(location.pathname, { replace: true });
      } catch (error) {}
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Reason this supply was rejected</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4 mx-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right text-2xl">
              Reason
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
              }}
              className="col-span-12 border-amber-900"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              onClick={() => {
                handleReject();
              }}
            >
              Send
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
