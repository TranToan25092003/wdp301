import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { testRouter } from "./routers/client/Test.router";
import { ClerkProvider } from "@clerk/clerk-react";
import HomeLayout, { homeLayoutLoader } from "./pages/HomeLayout";
import ErrorPage from "./components/global/Error";
import { Toaster } from "sonner";
import HomePage, { homepageLoader } from "./pages/HomePage";
import ProductDetail, { productDetailLoader } from "./pages/ProductDetail";
import CategoryPage, { categoryPageLoader } from "./pages/CategoryPage";
import { authenTicationLoader } from "./utils/authentication.loader";
import { useEffect } from "react";
import DashboardLayout from "@/pages/admin/AdminLayout";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <ErrorPage />,
    loader: homeLayoutLoader,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: homepageLoader,
      },
      {
        path: "/item/:itemId",
        element: <ProductDetail />,
        loader: productDetailLoader,
      },
      {
        path: "/category/:categoryId",
        element: <CategoryPage />,
        loader: categoryPageLoader,
      },
      {
        path: "/admin",
        element: <DashboardLayout></DashboardLayout>,
        errorElement: <ErrorPage></ErrorPage>,
        loader: authenTicationLoader,
      },
    ],
  },

  testRouter,
]);

function App() {
  if (!PUBLISHABLE_KEY) {
    return <h1>Server was closed. See you around</h1>;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <Toaster></Toaster>
      <RouterProvider router={router} />
    </ClerkProvider>
  );
}

export default App;
