import { ReactNode } from "react";
import brushRedBottom from "@/assets/brush-red-bottom.png";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/lib/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Calendar, ClipboardCheck, ClipboardList, Clock, Home, LogOut, QrCode, Users } from "lucide-react";
import shizenLogo from "@/assets/shizen-logo.png";

interface MobileLayoutProps {
  children: ReactNode;
  showBrush?: boolean;
  bgImage?: string;
  darkOverlay?: boolean;
  className?: string;
  showNav?: boolean;
  fullWidth?: boolean;
}

const MobileLayout = ({
  children,
  showBrush = true,
  bgImage,
  darkOverlay = true,
  className = "",
  showNav = false,
  fullWidth = false,
}: MobileLayoutProps) => {
  const { usuario, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = usuario?.role === "professor" ? "professor" : "aluno";

  const professorQuickItems = [
    { icon: Home, label: "Painel", path: "/sensei" },
    { icon: Bell, label: "Comunicados", path: "/sensei/comunicados" },
    { icon: Calendar, label: "Calendário", path: "/sensei/calendario" },
    { icon: Clock, label: "Aulas", path: "/sensei/aulas" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center">
      {/* Desktop top nav - hidden on mobile */}
      {showNav && (
        <div className="hidden md:block w-full sticky top-0 z-50">
          <TopNav />
        </div>
      )}

      {/* Mobile top header - hidden on desktop */}
      {showNav && (
        <div className="md:hidden w-full sticky top-0 z-50 bg-foreground/90 backdrop-blur-md border-b border-border/20">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Logo + name */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate(role === "professor" ? "/sensei" : "/dashboard")}
            >
              <img src={shizenLogo} alt="Shizen" className="w-8 h-8 object-contain rounded-full" />
              <div className="leading-tight">
                <p className="text-primary-foreground text-sm font-serif font-bold">極真空手</p>
                <p className="text-primary-foreground/60 text-[10px]">Dojo Shizen</p>
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-1">
              <NotificationBell />
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Sensei quick actions (mobile) */}
          {role === "professor" && (
            <div className="px-2 pb-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                {professorQuickItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                      }`}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div
        className={`${fullWidth ? "w-full" : "w-full max-w-[430px] md:max-w-full"} relative overflow-hidden flex-1 min-h-0 ${className}`}
        style={{ position: "relative" }}
      >
        {bgImage && (
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}
        {bgImage && darkOverlay && (
          <div className="absolute inset-0 z-[1]" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} />
        )}
        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          {children}
        </div>
        {showBrush && (
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
            <img
              src={brushRedBottom}
              alt=""
              className="w-full h-12 object-cover object-bottom opacity-40"
            />
          </div>
        )}
      </div>

      {/* Mobile bottom nav - hidden on desktop */}
      {showNav && (
        <div className={`md:hidden w-full ${fullWidth ? "" : "max-w-[430px]"} sticky bottom-0 z-30`}>
          <BottomNav role={role} />
        </div>
      )}
    </div>
  );
};

export default MobileLayout;


