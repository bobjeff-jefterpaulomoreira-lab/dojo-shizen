import { Home, TrendingUp, ClipboardList, User } from "lucide-react";
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
    { icon: ClipboardList, label: "Presença", path: "/presenca" },
    { icon: User, label: "Perfil", path: "/perfil" },
  ];

  const professorItems = [
    { icon: Home, label: "Início", path: "/sensei" },
    { icon: ClipboardList, label: "Alunos", path: "/sensei/alunos" },
    { icon: TrendingUp, label: "Avaliar", path: "/sensei/avaliacao" },
    { icon: User, label: "Perfil", path: "/perfil" },
  ];

  const items = role === "professor" ? professorItems : alunoItems;

  return (
    <nav className="sticky bottom-0 z-20 border-t border-border bg-card">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
