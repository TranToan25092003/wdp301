import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@clerk/clerk-react";
import { createBorrow } from "@/API/duc.api/borrow.api";

const BorrowModal = ({ open, onClose, product }) => {
    const navigate = useNavigate();
    const { isSignedIn, getToken, userId } = useAuth();
    const isHourly = product.ratePrice === "hour";
    const isDaily = product.ratePrice === "day";

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [totalTime, setTotalTime] = useState(0);

    useEffect(() => {
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const now = new Date()
            if (start < now) setTotalTime(0)
            else {
                const diffMs = end - start;

                if (diffMs > 0) {
                    const hours = diffMs / (1000 * 60 * 60);
                    const time = isHourly ? hours : Math.ceil(hours / 24);
                    setTotalTime(time);
                } else {
                    setTotalTime(0);
                }
            }
        }
    }, [startTime, endTime, isHourly, isDaily]);

    const totalPrice = totalTime * product.price;

    const handleConfirm = async () => {
        if (!isSignedIn) {
            onClose()
            await Swal.fire({
                icon: "warning",
                title: "You must sign in",
                text: "Please sign in before borrowing this item.",
                confirmButtonText: "OK",
            });
        }

        else if (!startTime || !endTime || totalTime <= 0) {
            onClose()
            return Swal.fire("Invalid time", "Please select valid start and end times.", "warning");
        }

        else {
            onClose();

            const result = await Swal.fire({
                title: `Confirm Borrowing`,
                html: `
        <p>Do you want to borrow <strong>"${product.name}"</strong> for ${totalTime} ${isHourly ? "hour(s)" : "day(s)"}?</p>
        <p>Total: <strong>${totalPrice.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                })}</strong></p>
      `,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes, proceed to payment",
                cancelButtonText: "Cancel",
            });

            if (result.isConfirmed) {
                const token = await getToken();
                try {
                    const response = await createBorrow(
                        {
                            startTime,
                            endTime,
                            totalTime,
                            totalPrice,
                            borrowers: userId,
                            itemId: product._id,
                        },
                        token
                    );
                    console.log(response)
                    if (response.status === 201)
                        await Swal.fire({
                            icon: "success",
                            title: "Borrow request created!",
                            text: "Your borrow has been successfully submitted.",
                            confirmButtonText: "OK",
                        });
                    navigate("/");
                } catch (error) {
                    console.error("Borrow error:", error);
                    await Swal.fire({
                        icon: "error",
                        title: "Something went wrong",
                        text: error?.response?.data?.message || "Failed to create borrow request.",
                    });
                }
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Borrow "{product.name}"</DialogTitle>
                </DialogHeader>

                {(isHourly || isDaily) ? (
                    <>
                        <div className="grid gap-4 py-2">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Start</Label>
                                <Input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">End</Label>
                                <Input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>

                            {totalTime > 0 && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    {isHourly ? "Hours" : "Days"}: <strong>{totalTime}</strong> <br />
                                    Total:{" "}
                                    <strong>
                                        {totalPrice.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </strong>
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" onClick={onClose}>Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleConfirm}>Confirm</Button>
                        </DialogFooter>
                    </>
                ) : (
                    <p className="text-sm text-red-500">
                        This item is not available for borrowing.
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default BorrowModal;
