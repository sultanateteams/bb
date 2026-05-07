import { RouterProvider } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { router } from "./router";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <RouterProvider router={router} />
  </TooltipProvider>
);

export default App;
