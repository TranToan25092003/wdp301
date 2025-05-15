import { SignOutButton } from "@clerk/clerk-react";
import React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const SignOutLink = () => {
  const handleLogout = () => {
    toast("Logout successful");
  };

  return (
    <SignOutButton redirectUrl="/">
      <Link href={"/"} className="w-full text-left" onClick={handleLogout}>
        Logout
      </Link>
    </SignOutButton>
  );
};

export default SignOutLink;
