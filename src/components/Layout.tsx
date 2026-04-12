import { useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ScanBarcode,
  Settings,
  Palette,
  Wrench,
  ChevronRight,
  Search,
  LogOut,
  User,
} from "lucide-react";
import { useOnboarding } from "../hooks/useOnboarding";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback } from "./ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const menuItems = [
  {
    name: "nav.dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "nav.invoices",
    path: "/invoices",
    icon: FileText,
  },
  {
    name: "nav.products",
    path: "/products",
    icon: ScanBarcode,
  },
  {
    name: "nav.settings",
    icon: Settings,
    subItems: [
      {
        name: "nav.appearance",
        path: "/settings/appearance",
        icon: Palette,
      },
      {
        name: "nav.company",
        path: "/settings/company",
        icon: FileText,
      },
      {
        name: "nav.advanced",
        path: "/settings/advanced",
        icon: Wrench,
      },
    ],
  },
];

export const Layout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { needsOnboarding } = useOnboarding();

  useEffect(() => {
    if (needsOnboarding === true) {
      navigate("/onboarding");
    }
  }, [needsOnboarding, navigate]);

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="h-16 flex items-center justify-center border-b px-4 transition-[height] ease-linear">
          <div className="flex w-full items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              E
            </div>
            <span className="font-bold text-lg tracking-wider truncate group-data-[collapsible=icon]:hidden">
              ERP System
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("common.application")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) =>
                  item.subItems ? (
                    <Collapsible
                      key={item.name}
                      defaultOpen
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          render={
                            <SidebarMenuButton tooltip={t(item.name)}>
                              <item.icon className="h-4 w-4" />
                              <span>{t(item.name)}</span>
                              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          }
                        />
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down data-[closed]:animate-collapsible-up data-[open]:animate-collapsible-down">
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.name}>
                                <SidebarMenuSubButton
                                  isActive={location.pathname === subItem.path}
                                  render={
                                    <NavLink to={subItem.path}>
                                      <subItem.icon className="h-4 w-4" />
                                      <span>{t(subItem.name)}</span>
                                    </NavLink>
                                  }
                                />
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        tooltip={t(item.name)}
                        isActive={location.pathname === item.path}
                        render={
                          <NavLink to={item.path}>
                            <item.icon className="h-4 w-4" />
                            <span>{t(item.name)}</span>
                          </NavLink>
                        }
                      />
                    </SidebarMenuItem>
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">John Doe</span>
                        <span className="truncate text-xs">
                          {t("common.administrator")}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  }
                />
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">John Doe</span>
                        <span className="truncate text-xs">
                          {t("common.administrator")}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    {t("common.account")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("common.log_out")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div className="hidden sm:flex items-center text-sm text-muted-foreground ml-2">
              <span
                className="hover:text-foreground cursor-pointer transition-colors"
                onClick={() => navigate("/")}
              >
                {t("common.home")}
              </span>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium capitalize">
                {location.pathname.split("/").filter(Boolean).pop() ||
                  t("nav.dashboard")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder={t("common.search")}
                className="pl-9 pr-4 py-1.5 w-64 bg-muted/50 border border-transparent focus:border-input focus:bg-background rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/30 p-6">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
