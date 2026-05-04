import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Ombor from "./pages/Ombor";
import OmborImportTarixi from "./pages/OmborImportTarixi";
import ICH from "./pages/ICH";
import WL from "./pages/WL";
import Buyurtma from "./pages/Buyurtma";
import BuyurtmaDetail from "./pages/BuyurtmaDetail";
import Chiqim from "./pages/Chiqim";
import Kirim from "./pages/Kirim";
import { MahsulotTurlari, XomashiyoTurlari } from "./pages/Catalogs";
import { CEO, Diler, Dokon, SavdoVakili, Haydovchi, Sozlamalar } from "./pages/Partners";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ombor" element={<Ombor />} />
            <Route path="/ombor/import-tarixi" element={<OmborImportTarixi />} />
            <Route path="/ich" element={<ICH />} />
            <Route path="/wl" element={<WL />} />
            <Route path="/buyurtma" element={<Buyurtma />} />
            <Route path="/kirim" element={<Kirim />} />
            <Route path="/chiqim" element={<Chiqim />} />
            <Route path="/mahsulot-turlari" element={<MahsulotTurlari />} />
            <Route path="/xomashiyo-turlari" element={<XomashiyoTurlari />} />
            <Route path="/ceo" element={<CEO />} />
            <Route path="/diler" element={<Diler />} />
            <Route path="/dokon" element={<Dokon />} />
            <Route path="/savdo-vakili" element={<SavdoVakili />} />
            <Route path="/haydovchi" element={<Haydovchi />} />
            <Route path="/sozlamalar" element={<Sozlamalar />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
