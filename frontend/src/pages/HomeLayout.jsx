import React from "react";
import Providers from "./Providers";
import Navbar from "@/components/navbar/Navbar";
import Container from "@/components/global/Container";
import { Outlet, useNavigation } from "react-router-dom";
import Loading from "@/components/global/Loading";
import { Toaster } from "sonner";
import AppFooter from "@/components/global/Footer";
import { getAllCategoriesWithStats } from "@/API/duc.api/category.api";
import { useLoaderData } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { useEffect } from "react";
import { customFetch } from "@/utils/customAxios";

export const homeLayoutLoader = async () => {
  try {
    const res = await getAllCategoriesWithStats();

    const footerResponse = await customFetch("/admin/contact");

    return { categories: res.data, footerInfo: footerResponse.data.data };
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return { categories: [] };
  }
};

const HomeLayout = () => {
  const { setActive } = useClerk();

  useEffect(() => {
    setActive({
      organization: "org_2xoxDQqucb3Sq0MiAoLGmEvCW87",
    });
  }, []);

  const { state } = useNavigation();
  const { categories } = useLoaderData();
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
          <AppFooter />
        </Providers>
      </div>
    </>
  );
};

export default HomeLayout;
