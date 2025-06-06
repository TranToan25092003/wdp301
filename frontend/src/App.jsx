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
import DashboardLayout from "@/pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Items, { itemsAdminLoader } from "./pages/admin/Items";
import BrowseItem, { browseLoader } from "./pages/admin/BrowseItem";
import TopUp from "./pages/TopUpCoin";
import CheckOut from "./pages/stripe/CheckOut";
import PaymentSuccess, { paymentLoader } from "./pages/stripe/RedirectPage";
import EditContact, { contactLoader } from "./pages/admin/ContactInfo";
import FilterPage from "./pages/FilterPage";

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
        path: "/filter",
        element: <FilterPage />,
      },

      // top up coin router
      {
        path: "/topup",
        element: <TopUp></TopUp>,
      },

      // check out router
      {
        path: "checkout",
        element: <CheckOut></CheckOut>,
      },

      // redirect page
      {
        path: "/coin/confirm",
        element: <PaymentSuccess></PaymentSuccess>,
        loader: paymentLoader,
      },

      // admin routers
      {
        path: "/admin",
        element: <DashboardLayout></DashboardLayout>,
        errorElement: <ErrorPage></ErrorPage>,
        loader: authenTicationLoader,
        children: [
          // home
          { index: true, element: <Dashboard></Dashboard> },

          // all items
          {
            path: "items",
            element: <Items></Items>,
            loader: itemsAdminLoader,
          },

          // browse items
          {
            path: "browse",
            element: <BrowseItem></BrowseItem>,
            loader: browseLoader,
          },

          // contact info
          {
            path: "contact",
            element: <EditContact></EditContact>,
            loader: contactLoader,
          },
        ],
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
