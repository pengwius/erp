import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  LayoutDashboard,
  FileText,
  Settings,
  Palette,
  Wrench,
  ChevronDown,
  Search,
} from "lucide-react";

export const Layout: any = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Settings: true,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleMenu = (name: string) => {
    setExpandedMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Invoices",
      path: "/invoices",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "Settings",
      icon: <Settings className="w-5 h-5" />,
      subItems: [
        {
          name: "Appearance",
          path: "/settings/appearance",
          icon: <Palette className="w-4 h-4" />,
        },
        {
          name: "Advanced",
          path: "/settings/advanced",
          icon: <Wrench className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-base-100 text-base-content font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-base-50 border-r border-base-200 flex flex-col transition-all duration-300 z-20 ${isSidebarOpen ? "w-64" : "w-20"}`}
      >
        <div className="h-16 flex items-center justify-center border-b border-base-200 px-4">
          <span
            className={`font-bold text-lg tracking-wider text-base-content transition-opacity duration-200 ${isSidebarOpen ? "opacity-100" : "hidden"}`}
          >
            ERP
          </span>
          <span
            className={`font-bold text-lg tracking-wider text-primary transition-opacity duration-200 ${!isSidebarOpen ? "opacity-100" : "hidden"}`}
          >
            ERP
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto w-full py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <div key={item.name} className="flex flex-col gap-1">
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex w-full items-center ${isSidebarOpen ? "justify-between px-3" : "justify-center px-0"} py-2.5 rounded-lg transition-colors text-base-content/70 hover:bg-base-200 hover:text-base-content`}
                    title={!isSidebarOpen ? item.name : undefined}
                  >
                    <div
                      className={`flex items-center ${isSidebarOpen ? "gap-3" : ""}`}
                    >
                      <div className="flex-shrink-0">{item.icon}</div>
                      {isSidebarOpen && (
                        <span className="truncate whitespace-nowrap">
                          {item.name}
                        </span>
                      )}
                    </div>
                    {isSidebarOpen && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${expandedMenus[item.name] ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  {isSidebarOpen && expandedMenus[item.name] && (
                    <div
                      className="ml-6 pl-2 border-l-2 flex flex-col gap-1 mt-1 overflow-hidden animate-fade-in"
                      style={{
                        borderLeftColor:
                          "color-mix(in srgb, var(--primary) 30%, transparent)",
                      }}
                    >
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.name}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isActive
                                ? "font-medium"
                                : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                            }`
                          }
                          style={({ isActive }) =>
                            isActive
                              ? {
                                  backgroundColor:
                                    "color-mix(in srgb, var(--primary) 10%, transparent)",
                                  color: "var(--primary)",
                                }
                              : undefined
                          }
                        >
                          <div className="flex-shrink-0">{subItem.icon}</div>
                          <span className="truncate text-sm">
                            {subItem.name}
                          </span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path!}
                  className={({ isActive }) =>
                    `flex items-center ${isSidebarOpen ? "px-3 gap-3" : "justify-center px-0"} py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "font-medium"
                        : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? {
                          backgroundColor:
                            "color-mix(in srgb, var(--primary) 10%, transparent)",
                          color: "var(--primary)",
                        }
                      : undefined
                  }
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  {isSidebarOpen && (
                    <span className="truncate whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-base-200">
          <div
            className={`flex items-center ${isSidebarOpen ? "gap-3" : "justify-center"}`}
          >
            <div className="avatar">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-medium"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--primary) 10%, transparent)",
                  color: "var(--primary)",
                }}
              >
                JD
              </div>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-base-content">
                  John Doe
                </p>
                <p className="text-xs truncate text-base-content/60">
                  Administrator
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-base-100/80 backdrop-blur-sm border-b border-base-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="p-2 -ml-2 rounded-lg text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors"
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex text-sm text-base-content/60">
              <span
                className="hover:text-base-content cursor-pointer transition-colors"
                onClick={() => navigate("/")}
              >
                Home
              </span>
              <span className="mx-2">/</span>
              <span className="text-base-content font-medium capitalize">
                {location.pathname.split("/").filter(Boolean).pop() ||
                  "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 w-64 bg-base-200/50 border border-transparent focus:border-base-300 focus:bg-base-100 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-200/30 p-6">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
