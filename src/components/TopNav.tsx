import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import shizenLogo from "@/assets/shizen-logo.png";
import NotificationBell from "@/components/NotificationBell";
import { LogOut, Home, QrCode, Users, Bell, Calendar, ClipboardCheck } from "lucide-react";

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isProfessor = usuario?.role === "professor";

  const navItems = isProfessor
    ? [
        { icon: Home, label: "Painel", path: "/sensei" },
        { icon: QrCode, label: "Abrir Aula", path: "/sensei/qrcode" },
        { icon: Users, label: "Alunos", path: "/sensei/alunos" },
        { icon: Bell, label: "Comunicados", path: "/sensei/comunicados" },
        { icon: Calendar, label: "Calendário", path: "/sensei/calendario" },
        { icon: ClipboardCheck, label: "Avaliações", path: "/sensei/avaliacao" },
      ]
    : [
        { icon: Home, label: "Painel", path: "/dashboard" },
        { icon: ClipboardCheck, label: "Evolução", path: "/evolucao" },
        { icon: Calendar, label: "Presença", path: "/presenca" },
      ];

  return (
    <nav className="w-full bg-foreground/90 backdrop-blur-md border-b border-border/20 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(isProfessor ? "/sensei" : "/dashboard")}>
          <img src={shizenLogo} alt="Shizen" className="w-8 h-8 object-contain rounded-full" />
          <div className="leading-tight">
            <p className="text-primary-foreground text-sm font-serif font-bold">極真空手</p>
            <p className="text-primary-foreground/60 text-[10px]">Dojo Shizen</p>
          </div>
        </div>

        {/* Center: Nav links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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

        {/* Right: Bell + User + Logout */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="text-right">
            <p className="text-primary-foreground text-sm font-medium">{usuario?.nome}</p>
            <p className="text-primary text-[10px] font-bold">{usuario?.faixa}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
