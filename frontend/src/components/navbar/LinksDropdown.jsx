import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { links } from "@/utils/links";
import {
  SignedOut,
  SignedIn,
  SignInButton,
  SignUpButton,
  useAuth,
} from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { LuAlignLeft } from "react-icons/lu";
import UserIcon from "@/components/navbar/UserIcon";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import SignOutLink from "./SignOutLink";

const LinkDropdown = () => {
  const { orgRole } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"outline"}
          className="flex gap-4 max-w-[120px] py-6 px-4"
          style={{
            border: "2px solid #bbf7d0",
          }}
        >
          <LuAlignLeft
            className="w-7 h-7 text-black"
            style={{ color: "#000000", strokeWidth: "2.5" }}
          ></LuAlignLeft>

          <UserIcon></UserIcon>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="center" sideOffset={10}>
        <SignedOut>
          <DropdownMenuItem className="py-3 text-base">
            <SignInButton mode="modal">
              <button className="w-full text-left">Login</button>
            </SignInButton>
          </DropdownMenuItem>

          <DropdownMenuSeparator></DropdownMenuSeparator>
          <DropdownMenuItem className="py-3 text-base">
            <SignUpButton mode="modal">
              <button className="w-full text-left">Register</button>
            </SignUpButton>
          </DropdownMenuItem>
        </SignedOut>
        <SignedIn>
          {links.map((link) => {
            if (link.href.includes("/admin")) {
              if (orgRole == "org:admin" || orgRole == "org:admin_secondary") {
                return (
                  <DropdownMenuItem key={link.href} className="py-3 text-base">
                    <Link to={link.href} className="capitalize w-full">
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                );
              } else return null;
            }

            return (
              <DropdownMenuItem key={link.href} className="py-3 text-base">
                <Link to={link.href} className="capitalize w-full">
                  {link.label}
                </Link>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator></DropdownMenuSeparator>
          <DropdownMenuItem className="py-3 text-base">
            <SignOutLink></SignOutLink>
          </DropdownMenuItem>
        </SignedIn>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LinkDropdown;
