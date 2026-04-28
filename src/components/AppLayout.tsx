import { Outlet } from "react-router-dom";
import { Bell, Search, ChevronDown } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b bg-card/60 backdrop-blur px-4 sticky top-0 z-30">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Qidirish: buyurtma, mahsulot, do'kon..." className="pl-9 h-9 bg-muted/40 border-0 focus-visible:ring-1" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-md bg-muted/40 text-xs">
                <span className="text-muted-foreground">USD:</span>
                <span className="font-semibold">12 650 so'm</span>
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <button className="flex items-center gap-2 px-2 h-9 rounded-md hover:bg-muted/60 transition">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-gradient-brand text-primary-foreground text-xs">AD</AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col leading-tight items-start">
                  <span className="text-xs font-medium">Admin</span>
                  <span className="text-[10px] text-muted-foreground">CEO</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </header>
          <main className="flex-1 p-6 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
