import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const TopUp = () => {
  const [coinAmount, setCoinAmount] = useState("0");
  const [paymentInfo, setPaymentInfo] = useState("");
  const navigate = useNavigate();

  const handleTopUp = () => {
    const total = coinAmount == 0 ? paymentInfo : coinAmount;

    if (total == 0) {
      toast("please enter total coin you want to top up");
      return;
    }

    navigate(`/checkout?total=${total}`);
  };

  return (
    <div className="min-h-screen  p-4 flex items-center justify-center">
      <Card className=" text-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-[#1DCD9F] mb-4">
          Top Up Coins
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-[#1DCD9F] text-sm mb-2 block">
              Select Coin Amount
            </label>
            <Select value={coinAmount} onValueChange={setCoinAmount}>
              <SelectTrigger className="bg-[#222222] border-[#169976] text-white w-full">
                <SelectValue placeholder="Select coins" />
              </SelectTrigger>
              <SelectContent className="bg-[#222222] text-white border-[#169976]">
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="100">100 Coins (100.000VND)</SelectItem>
                <SelectItem value="500">500 Coins (450.000VND)</SelectItem>
                <SelectItem value="1000">1000 Coins (900.000VND)</SelectItem>
                <SelectItem value="5000">5000 Coins (4.500.000VND)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[#1DCD9F] text-sm mb-2 block">
              Enter coin:{" "}
              {new Intl.NumberFormat("vi-VN").format(paymentInfo * 1000) +
                " VND"}
            </label>
            <Input
              className="bg-[#222222] border-[#169976] text-white w-full"
              disabled={coinAmount != 0 ? true : false}
              placeholder="Number coin"
              value={paymentInfo}
              onChange={(e) => setPaymentInfo(e.target.value)}
            />
          </div>
          <Button
            className="bg-[#169976] text-white hover:bg-[#1DCD9F] w-full"
            onClick={handleTopUp}
          >
            Confirm Top Up
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TopUp;
