import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main/Main";
import Home from "../Pages/Dashboard/Home";
import MyPigeon from "../components/myPigeon/MyPigeon";
import AddNewPigeon from "../components/myPigeon/components/AddNewPigeon";
import ViewPigeon from "../components/myPigeon/components/ViewPigeon";
import ExportPdfSinglePigeon from "../components/myPigeon/components/ExportPdfSinglePigeon";
import PigeonManagement from "../components/pigeonManagement/PigeonManagement";
import PigeonPedigreeChart from "../components/pedigreeChart/PedigreeChartContainer";
import VerifyBreeder from "../components/verifyBreeder/VerifyBreeder";
import LoginCredentials from "../components/loginCredentials/LoginCredentials";
import PackagesPlans from "../components/subscriptionPackage/Subscription";
import ReportingAnalytics from "../components/reportingAnalytics/ReportingAnalytics";
import AdminProfile from "../Pages/Dashboard/AdminProfile/AdminProfile";
import Notifications from "../Pages/Dashboard/Notifications";
import Auth from "../Layout/Auth/Auth";
import Login from "../Pages/Auth/Login";
import ForgotPassword from "../Pages/Auth/ForgotPassword";
import VerifyOtp from "../Pages/Auth/VerifyOtp";
import ResetSuccess from "../Pages/Auth/ResetSuccess";
import SetPassword from "../Pages/Auth/SetPassword";
import NotFound from "../NotFound";
import { Navigate } from "react-router-dom";
import { Profiler } from "react";
import ProtectedRoute from "./ProtectedRoute";
import TermsAndCondition from "../Pages/Dashboard/TermsAndCondition";
import ChangePassword from "../Pages/Dashboard/AdminProfile/ChangePassword";

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
        path: "/export-pdf/:id",
        element: <ExportPdfSinglePigeon />,
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
        path: "/terms-and-conditions",
        element: <TermsAndCondition />,
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
