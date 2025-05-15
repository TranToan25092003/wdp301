import React from "react";
import Providers from "./providers";
import Navbar from "@/components/navbar/Navbar";
import Container from "@/components/global/Container";
import { Outlet, useNavigation } from "react-router-dom";
import Loading from "@/components/global/Loading";
import { Toaster } from "sonner";

const HomeLayout = () => {
  const { state } = useNavigation();

  return (
    <>
      <Toaster position="bottom-right" richColors expand closeButton />
      <div className={` antialiased`}>
        <Providers>
          <Navbar></Navbar>
          <Container className={"mt-4"}>
            {state === "loading" ? (
              <>
                <Loading></Loading>
              </>
            ) : (
              <Outlet></Outlet>
            )}
          </Container>
        </Providers>
      </div>
    </>
  );
};

export default HomeLayout;
