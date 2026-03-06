import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, Layers, CreditCard, Settings, HelpCircle, LogOut } from "lucide-react";
import revliskitLogo from "@/assets/revliskit-logo.png";

const navItems = [
  { icon: LayoutGrid, label: "Projects", path: "/dashboard" },
  { icon: Layers, label: "Templates", path: "/dashboard" },
  { icon: CreditCard, label: "Credits", path: "/dashboard" },
  { icon: Settings, label: "Settings", path: "/dashboard" },
  { icon: HelpCircle, label: "Help Center", path: "/dashboard" },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border flex flex-col glass-strong shrink-0">
        <div
          className="flex items-center gap-2 px-5 h-12 border-b border-border cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={revliskitLogo} alt="Revliskit logo" className="w-7 h-7 rounded-lg object-contain" />
          <span className="font-display text-base font-bold tracking-tight">Revliskit</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path && item.label === "Projects";
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <div className="glass rounded-lg p-3 mb-3">
            <p className="text-xs font-medium mb-1">Free Plan</p>
            <p className="text-xs text-muted-foreground">1 of 1 project used</p>
            <div className="w-full h-1.5 rounded-full bg-muted mt-2">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default AppLayout;
