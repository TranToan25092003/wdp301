import React from "react";
import Providers from "./providers";
import Navbar from "@/components/navbar/Navbar";
import Container from "@/components/global/Container";
import { Outlet, useNavigation } from "react-router-dom";
import Loading from "@/components/global/Loading";
import { Toaster } from "sonner";
import AppFooter from "@/components/global/Footer";
import { getAllCategoriesWithStats } from "@/API/duc.api/category.api";
import { useLoaderData } from 'react-router-dom'

export const homeLayoutLoader = async () => {
  try {
    const res = await getAllCategoriesWithStats();
    return { categories: res.data };
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return { categories: [] };
  }
};

const HomeLayout = () => {
  const { state } = useNavigation();
  const { categories } = useLoaderData();
  return (
    <>
      <Toaster position="bottom-right" richColors expand closeButton />
      <div className={` antialiased`}>
        <Providers>
          <Navbar categories={categories}></Navbar>
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
