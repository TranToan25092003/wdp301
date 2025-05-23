import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { testRouter } from "./routers/client/Test.router";
import { ClerkProvider, SignedIn } from "@clerk/clerk-react";
import HomeLayout, { homeLayoutLoader } from "./pages/HomeLayout";
import ErrorPage from "./components/global/Error";
import { Toaster } from "sonner";
import HomePage, { homepageLoader } from "./pages/HomePage";
import ProductDetail, { productDetailLoader } from "./pages/ProductDetail";
import CategoryPage, { categoryPageLoader } from "./pages/CategoryPage";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

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
        loader: homepageLoader
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
      }
    ]
  },
  testRouter,
]);

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Toaster></Toaster>
      <RouterProvider router={router} />
    </ClerkProvider>
  );
}

export default App;
