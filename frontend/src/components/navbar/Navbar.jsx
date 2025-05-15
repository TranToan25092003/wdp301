import React from "react";
import Container from "../global/Container";
import NavSearch from "./NavSearch";
import LinkDropdown from "./LinksDropdown";

const Navbar = () => {
  return (
    <div className="border-b">
      <Container className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap py-8 gap-4">
        <NavSearch></NavSearch>
        <div className="flex gap-4 items-center">
          <LinkDropdown></LinkDropdown>
        </div>
      </Container>
    </div>
  );
};

export default Navbar;
