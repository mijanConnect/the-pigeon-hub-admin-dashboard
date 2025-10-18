import { createBrowserRouter } from "react-router-dom";
import Auth from "../Layout/Auth/Auth";
import Main from "../Layout/Main/Main";
import Home from "../Pages/Dashboard/Home";
import Users from "../Pages/Dashboard/Subsciber";
import Admin from "../Pages/Dashboard/Admin";
import Category from "../Pages/Dashboard/PushNotification";
import Events from "../Pages/Dashboard/UpdatePassword";
import Banner from "../Pages/Dashboard/Banner";
import AboutUs from "../Pages/Dashboard/AboutUs";
import PrivacyPolicy from "../Pages/Dashboard/PrivacyPolicy";
import TermsAndConditions from "../Pages/Dashboard/TermsAndCondition";
import ChangePassword from "../Pages/Auth/ChangePassword";
import Login from "../Pages/Auth/Login";
import ForgotPassword from "../Pages/Auth/ForgotPassword";
import VerifyOtp from "../Pages/Auth/VerifyOtp";
import ResetPassword from "../Pages/Auth/SetPassword";
import NotFound from "../NotFound";
import Notifications from "../Pages/Dashboard/Notifications";
import SubCategory from "../Pages/Dashboard/SubCategory";
import AdminProfile from "../Pages/Dashboard/AdminProfile/AdminProfile";
import RetailerTable from "../Pages/Dashboard/Retailer";
import WholesealerTable from "../Pages/Dashboard/Wholesealer";
import SalesManagement from "../Pages/Dashboard/SalesManagement";
import Retailer from "../Pages/Dashboard/Retailer";
import SaleRepsManagement from "../Pages/Dashboard/SaleRepsManagement";
import ViewSalesReps from "../components/SalesRepsManagement/detailsSalesReps/ViewSalesReps";
import LoyaltyProgram from "../Pages/Dashboard/LoyaltyProgram";
import SubscriptionTable from "../components/subscriber/SubscriberTable";
import OrderManagementContainer from "../components/orderMangement/OrderManagementContainer";
import CategoryManagement from "../components/category/CategoryManagement";
import UserManagement from "../components/userMangement/UserManagement";
import ProductManagement from "../components/productManagement/ProductsManagement";
import FAQSection from "../components/faq/Faq";
import SubscriptionPackagePage from "../Pages/Dashboard/Subscription";
import PackagesPlans from "../Pages/Dashboard/Subscription";
import SubCategoryManagement from "../Pages/Dashboard/SubCategory";
import Contact from "../Pages/Dashboard/Contact";
import ColorManagement from "../components/colorManage/ColorManagement";
import SizeManagement from "../components/sizeManagement/SizeManagement";
import ResetSuccess from "../Pages/Auth/ResetSuccess";
import SetPassword from "../Pages/Auth/SetPassword";
import CustomerManagement from "../components/customerManagement/customerManagement";
import TierSystem from "../components/TierSystem/TierSystem";
import PromotionManagement from "../components/promotionManagement/PromotionManagement";
import SalesRepPortal from "../components/salesRepPortal/SalesRepPortal";
import AuditLogs from "../components/auditLogs/AuditLogs";
import LoginCredentials from "../components/loginCredentials/LoginCredentials";
import ReportingAnalytics from "../components/reportingAnalytics/ReportingAnalytics";
import PushNotifications from "../components/pushNotifications/PushNotifications";
import { Navigate } from "react-router-dom";
import MyPigeon from "../components/myPigeon/MyPigeon";
import PigeonManagement from "../components/pigeonManagement/PigeonManagement";
import VerifyBreeder from "../components/verifyBreeder/VerifyBreeder";
import { Profiler } from "react";
import ProtectedRoute from "./ProtectedRoute";
import PigeonPedigreeChart from "../components/pedigreeChart/PedigreeChartContainer";
import AddNewPigeon from "../components/myPigeon/addPigeon/AddNewPigeon";
import ViewPigeon from "../components/myPigeon/addPigeon/ViewPigeon";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Main />
      </ProtectedRoute>
    ),
    // element: <Main />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/my-pigeon",
        element: <MyPigeon />,
      },
      {
        path: "/add-pigeon",
        element: <AddNewPigeon />,
      },
      {
        path: "/add-pigeon/:id",
        element: <AddNewPigeon />,
      },
      {
        path: "/view-pigeon/:id",
        element: <ViewPigeon />,
      },
      {
        path: "/pigeon-management",
        element: <PigeonManagement />,
      },
      {
        path: "/pigeon-management/:id",
        element: <PigeonPedigreeChart />,
      },
      {
        path: "/verify-breeder",
        element: <VerifyBreeder />,
      },
      {
        path: "/user-management",
        element: <LoginCredentials />,
      },
      {
        path: "/subscription",
        element: <PackagesPlans />,
      },
      {
        path: "/reportingAnalytics",
        element: <ReportingAnalytics />,
      },
      {
        path: "/settings",
        element: <AdminProfile />,
      },
      {
        path: "/terms-and-conditions",
        element: <TermsAndConditions />,
      },
      {
        path: "/change-password",
        element: <ChangePassword />,
      },
      {
        path: "/profile",
        element: <AdminProfile />,
      },
      {
        path: "/notification",
        element: <Notifications />,
      },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
    children: [
      {
        path: "/auth",
        element: <Login />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "verify-otp",
        element: <VerifyOtp />,
      },
      {
        path: "reset-success",
        element: <ResetSuccess />,
      },
      {
        path: "set-password",
        element: <SetPassword />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
