import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Ombor from "@/pages/Ombor";
import OmborImportTarixi from "@/pages/OmborImportTarixi";
import ICH from "@/pages/ICH";
import WL from "@/pages/WL";
import Buyurtma from "@/pages/Buyurtma";
import BuyurtmaDetail from "@/pages/BuyurtmaDetail";
import Chiqim from "@/pages/Chiqim";
import Kirim from "@/pages/Kirim";
import ExpenseTypes from "@/pages/ExpenseTypes";
import { MahsulotTurlari, XomashiyoTurlari } from "@/pages/Catalogs";
import XomashiyoTurlariPage from "@/pages/XomashiyoTurlari/XomashiyoTurlariPage";
import { CEO, Diler, Dokon, SavdoVakili, Haydovchi, Sozlamalar } from "@/pages/Partners";
import { Tamirotchilar } from "@/pages/Tamirotchilar";
import TamirotchilarDetail from "@/pages/TamirotchilarDetail";
import Kreditorlik from "@/pages/Kreditorlik";
import NotFound from "@/pages/NotFound";
import RequireAuth from "@/components/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Navigate to="/auth" replace />,
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        element: <AppLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "profile", element: <Profile /> },
          { path: "ombor", element: <Ombor /> },
          { path: "ombor/import-tarixi", element: <OmborImportTarixi /> },
          { path: "ich", element: <ICH /> },
          { path: "wl", element: <WL /> },
          { path: "buyurtma", element: <Buyurtma /> },
          { path: "buyurtma/:id", element: <BuyurtmaDetail /> },
          { path: "kirim", element: <Kirim /> },
          { path: "chiqim", element: <Chiqim /> },
          { path: "expense-types", element: <ExpenseTypes /> },
          { path: "tamirotchilar", element: <Tamirotchilar /> },
          { path: "tamirotchilar/:id", element: <TamirotchilarDetail /> },
          { path: "mahsulot-turlari", element: <MahsulotTurlari /> },
          { path: "xomashiyo-turlari", element: <XomashiyoTurlariPage /> },
          { path: "ceo", element: <CEO /> },
          { path: "diler", element: <Diler /> },
          { path: "dokon", element: <Dokon /> },
          { path: "savdo-vakili", element: <SavdoVakili /> },
          { path: "haydovchi", element: <Haydovchi /> },
          { path: "sozlamalar", element: <Sozlamalar /> },
          { path: "kreditorlik", element: <Kreditorlik /> },
          { path: "home", element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
