"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { formatPrice } from "../../lib/utils";

export default function FilterBar({ filters, onFilterChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = ["Electronics", "Tools", "Sports", "Books", "Other"];

  const handleReset = () => {
    onFilterChange({
      category: "",
      status: "",
      priceRange: [0, 1000000],
      rate: "",
      isFree: false,
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} />
            <h2 className="font-medium">Filters</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <span>Less</span>
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                <span>More</span>
                <ChevronDown size={16} />
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex  flex-col items-center m-1 p-1">
            <Label htmlFor="category" className={"mb-1"}>
              Category
            </Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) =>
                onFilterChange({ category: value === "all" ? "" : value })
              }
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex  flex-col items-center m-1 p-1">
            <Label htmlFor="status" className={"mb-1"}>
              Status
            </Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                onFilterChange({ status: value === "all" ? "" : value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="notAvailable">Not Available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex  flex-col items-center m-1 p-1">
            <Label htmlFor="rate" className={"mb-1"}>
              Rate Type
            </Label>
            <Select
              value={filters.rate || "all"}
              onValueChange={(value) =>
                onFilterChange({ rate: value === "all" ? "" : value })
              }
            >
              <SelectTrigger id="rate">
                <SelectValue placeholder="All Rates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rates</SelectItem>
                <SelectItem value="day">Per Day</SelectItem>
                <SelectItem value="hour">Per Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4 mt-4 pt-4 border-t">
            <div>
              <div className="flex justify-between mb-2">
                <Label>Price Range</Label>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(filters.priceRange[0])} -{" "}
                  {formatPrice(filters.priceRange[1])}
                </span>
              </div>
              <Slider
                defaultValue={[0, 1000000]}
                max={1000000}
                step={50000}
                value={filters.priceRange}
                onValueChange={(value) => onFilterChange({ priceRange: value })}
                className="my-4"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFree"
                checked={filters.isFree}
                onCheckedChange={(checked) =>
                  onFilterChange({ isFree: checked })
                }
              />
              <Label htmlFor="isFree">Show only free items</Label>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
