import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { testRouter } from "./routers/client/Test.router";
import { ClerkProvider } from "@clerk/clerk-react";
import HomeLayout, { homeLayoutLoader } from "./pages/HomeLayout";
import ErrorPage from "./components/global/Error";
import { Toaster } from "sonner";
import HomePage, { homepageLoader } from "./pages/HomePage";
import ProductDetail, { productDetailLoader } from "./pages/ProductDetail";
import CategoryPage, { categoryPageLoader } from "./pages/CategoryPage";
import AuctionList, { auctionListLoader } from "./pages/AuctionList";
import AuctionDetail, { auctionDetailLoader } from "./pages/AuctionDetail";
import { authenTicationLoader } from "./utils/authentication.loader";
import DashboardLayout from "@/pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Items, { itemsAdminLoader } from "./pages/admin/Items";
import BrowseItem, { browseLoader } from "./pages/admin/BrowseItem";
import AdminReport, { adminReportLoader } from "./pages/admin/AdminReport";
import TopUp, { TopUpLoader } from "./pages/TopUpCoin";
import CheckOut from "./pages/stripe/CheckOut";
import PaymentSuccess, { paymentLoader } from "./pages/stripe/RedirectPage";
import CreatePost from "./pages/CreatePost";
import EditContact, { contactLoader } from "./pages/admin/ContactInfo";
import FilterPage, { filterPageLoader } from "./pages/FilterPage";
import CreateReportPage from "./pages/CreateReportPage";
import ReportDetail, { reportDetailLoader } from "./pages/admin/ReportDetail";
import SellerList from "./pages/SellerList";
import GlobalLoginLogger from "./components/global/GlobalLoginLogger";
// IMPORT COMPONENT VÀ LOADER MỚI CHO THỐNG KÊ
import DashboardStats, {
  dashboardStatsLoader,
} from "./pages/admin/DashboardStats";
import About from "./pages/About";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import ChatBox from "./pages/ChatBox";
import AuctionAdmin, { auctionAdminLoader } from "./pages/admin/AuctionAdmin";
import {
  AuctionAdminDetail,
  auctionAdminDetailLoader,
} from "./pages/admin/AuctionDetail.admin";
import {
  ItemDetailDashboard,
  itemDetailDashboardLoader,
} from "./pages/admin/ItemDetailDashboard";
import {
  TransactionAdminDashboard,
  transactionAdminDashboardLoader,
} from "./pages/admin/TransactionAdmin";
import {
  CategoryAdminDashboard,
  categoryAdminDashboardLoader,
} from "./pages/admin/CategoryAdminDashboard";
import ActivityLogList from "./pages/admin/ActivityLogList";
import ItemFeedbackReport, { itemFeedbackReportLoader } from "./pages/admin/ItemFeedbackReport";
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
        loader: filterPageLoader,
      },
      {
        path: "/auctions",
        element: <AuctionList />,
        loader: auctionListLoader,
      },
      {
        path: "/auctions/:auctionId",
        element: <AuctionDetail />,
        loader: auctionDetailLoader,
      },

      // top up coin router
      {
        path: "/topup",
        loader: TopUpLoader,
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

      // create post router
      {
        path: "/create-post",
        element: <CreatePost></CreatePost>,
      },
      {
        path: "/report",
        element: <CreateReportPage />,
      },
      {
        path: "/history",
        element: <TransactionHistoryPage />,
      },
      {
        path: "/chat",
        element: <ChatBox />,
      },
      {
        path: "/sellers",
        element: <SellerList />,
      },

      // admin routers
      {
        path: "/admin",
        element: <DashboardLayout></DashboardLayout>,
        errorElement: <ErrorPage></ErrorPage>,
        loader: authenTicationLoader,
        children: [
          // { index: true, element: <Dashboard /> }, // Dashboard component hiện tại
          {
            index: true,
            element: <DashboardStats />,
            loader: dashboardStatsLoader,
          },

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

          // admin report page
          {
            path: "report",
            element: <AdminReport></AdminReport>,
            loader: adminReportLoader,
          },
          {
            path: "/admin/reports/:reportId",
            element: <ReportDetail />,
            loader: reportDetailLoader,
          },
          // contact info
          {
            path: "contact",
            element: <EditContact></EditContact>,
            loader: contactLoader,
          },

          // auction
          {
            path: "auction-items",
            element: <AuctionAdmin></AuctionAdmin>,
            loader: auctionAdminLoader,
          },

          // auction detail
          {
            path: "auction/detail/:id",
            element: <AuctionAdminDetail></AuctionAdminDetail>,
            loader: auctionAdminDetailLoader,
          },

          {
            path: "items/detail/:id",
            element: <ItemDetailDashboard></ItemDetailDashboard>,
            loader: itemDetailDashboardLoader,
          },
          {
            path: "transaction",
            element: <TransactionAdminDashboard></TransactionAdminDashboard>,
            loader: transactionAdminDashboardLoader,
          },
          {
            path: "category",
            element: <CategoryAdminDashboard></CategoryAdminDashboard>,
            loader: categoryAdminDashboardLoader,
          },
          {
            path: "activity-logs", // Đường dẫn để truy cập trang này: /admin/activity-logs
            element: <ActivityLogList />,
          },
          {
          path: "item-feedback",
          element: <ItemFeedbackReport />,
          loader: itemFeedbackReportLoader,
}
        ],
      },
      {
        path: "/about",
        element: <About />,
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
      <GlobalLoginLogger />
      <RouterProvider router={router} />
    </ClerkProvider>
  );
}

export default App;
