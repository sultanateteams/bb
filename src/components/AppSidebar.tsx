import {
  LayoutDashboard, Warehouse, Factory, Package, ShoppingCart, ArrowDownToLine,
  ArrowUpFromLine, Boxes, Sprout, UserCog, Building2, Store, UserRound, Truck,
  Settings,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const operations = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Ombor", url: "/ombor", icon: Warehouse },
  { title: "ICH (Ishlab chiqarish)", url: "/ich", icon: Factory },
  { title: "WL (White Label)", url: "/wl", icon: Package },
  { title: "Buyurtma", url: "/buyurtma", icon: ShoppingCart },
];

const finance = [
  { title: "Kirim", url: "/kirim", icon: ArrowDownToLine },
  { title: "Chiqim", url: "/chiqim", icon: ArrowUpFromLine },
];

const catalogs = [
  { title: "Mahsulot turlari", url: "/mahsulot-turlari", icon: Boxes },
  { title: "Xomashiyo turlari", url: "/xomashiyo-turlari", icon: Sprout },
  { title: "Ta'minotchilar", url: "/tamirotchilar", icon: Truck },
];

const partners = [
  { title: "CEO (Hodimlar)", url: "/ceo", icon: UserCog },
  { title: "Diler", url: "/diler", icon: Building2 },
  { title: "Do'kon", url: "/dokon", icon: Store },
  { title: "Savdo vakili", url: "/savdo-vakili", icon: UserRound },
  { title: "Haydovchi", url: "/haydovchi", icon: Truck },
];

const settings = [
  { title: "Sozlamalar", url: "/sozlamalar", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (path: string) => path === "/" ? pathname === "/" : pathname.startsWith(path);

  const renderGroup = (label: string, items: typeof operations) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 px-3">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium hover:bg-sidebar-accent/60">
                <NavLink to={item.url} end={item.url === "/"}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-md bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">B</div>
        {!collapsed && (
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-sidebar-accent-foreground font-semibold text-sm truncate">Biznes Boshqaruv</span>
            <span className="text-sidebar-foreground/60 text-[11px]">ICH · WL · TM</span>
          </div>
        )}
      </div>
      <SidebarContent className="py-2">
        {renderGroup("Operatsiyalar", operations)}
        {renderGroup("Moliya", finance)}
        {renderGroup("Kataloglar", catalogs)}
        {renderGroup("Hamkorlar", partners)}
        {renderGroup("Tizim", settings)}
      </SidebarContent>
    </Sidebar>
  );
}
