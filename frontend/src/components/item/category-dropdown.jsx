// components/navbar/CategoryDropdown.tsx

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; 
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { List } from "lucide-react";



const CategoryDropdown = ({categories}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <List className="w-6 h-6" />  <ChevronDown className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>All Categories</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {categories.map((cat, index) => (
          <Link key={index} to={cat.path}>
            <DropdownMenuItem>{cat.name}</DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryDropdown;
