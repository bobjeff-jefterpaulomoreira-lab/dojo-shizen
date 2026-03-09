import { Home, TrendingUp, ClipboardList, User, Bell, QrCode, Calendar, MessageSquare } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface BottomNavProps {
  role: "aluno" | "professor";
}

const BottomNav = ({ role }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const alunoItems = [
    { icon: Home, label: "Início", path: "/dashboard" },
    { icon: TrendingUp, label: "Evolução", path: "/evolucao" },
    { icon: Bell, label: "Notificações", path: "/notificacoes" },
    { icon: User, label: "Perfil", path: "/perfil" },
  ];

  const professorItems = [
    { icon: Home, label: "Início", path: "/sensei" },
    { icon: QrCode, label: "Aula", path: "/sensei/qrcode" },
    { icon: ClipboardList, label: "Alunos", path: "/sensei/alunos" },
    { icon: MessageSquare, label: "Avisos", path: "/sensei/notificacoes" },
    { icon: TrendingUp, label: "Avaliar", path: "/sensei/avaliacao" },
  ];

  const items = role === "professor" ? professorItems : alunoItems;

  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-2 py-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
