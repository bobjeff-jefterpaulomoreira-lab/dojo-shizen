import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import karatekaBack from "@/assets/karateka-back.jpg";
import { QrCode, Users, FileBarChart, ClipboardCheck } from "lucide-react";

const TeacherDashboard = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const buttons = [
    { icon: QrCode, label: "Abrir Aula", subtitle: "(QR Code)", path: "/sensei/qrcode" },
    { icon: Users, label: "Alunos", subtitle: "", path: "/sensei/alunos" },
    { icon: FileBarChart, label: "Relatório", subtitle: "Mensal", path: "/sensei/relatorio" },
    { icon: ClipboardCheck, label: "Avaliações", subtitle: "", path: "/sensei/avaliacao" },
  ];

  return (
    <MobileLayout showBrush={true}>
      {/* Red header with dojo bg */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${karatekaBack})` }} />
        <div className="absolute inset-0" style={{ backgroundColor: "hsla(0, 100%, 27%, 0.75)" }} />
        <div className="relative z-10 px-5 pt-8 pb-6">
          <h1 className="text-xl font-serif font-bold text-primary-foreground">
            Bem-vindo, Sensei {usuario?.nome || ""}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 bg-dojo-paper">
        {/* Grid 2x2 with RED buttons */}
        <div className="px-5 py-5 grid grid-cols-2 gap-4">
          {buttons.map((btn, i) => (
            <button
              key={btn.path}
              onClick={() => navigate(btn.path)}
              className="flex flex-col items-center justify-center py-7 gap-3 rounded-2xl shadow-md transition-all active:scale-95 animate-fade-in hover:shadow-lg"
              style={{
                backgroundColor: "hsl(0, 100%, 27%)",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <btn.icon className="text-primary-foreground" size={32} />
              <div className="text-center">
                <p className="font-serif font-bold text-primary-foreground text-sm">{btn.label}</p>
                {btn.subtitle && (
                  <p className="text-[10px] text-primary-foreground/60">{btn.subtitle}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav role="professor" />
    </MobileLayout>
  );
};

export default TeacherDashboard;
