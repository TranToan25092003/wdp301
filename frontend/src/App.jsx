import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { testRouter } from "./routers/client/Test.router";
import { ClerkProvider, SignedIn } from "@clerk/clerk-react";
import HomeLayout from "./pages/HomeLayout";
import ErrorPage from "./components/global/Error";
import { Toaster } from "sonner";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <ErrorPage />,
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
