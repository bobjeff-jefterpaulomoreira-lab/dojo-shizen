import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import paperTexture from "@/assets/paper-texture.jpg";
import { QrCode, Users, FileBarChart, ClipboardCheck } from "lucide-react";

const TeacherDashboard = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const buttons = [
    { icon: QrCode, label: "Abrir Aula", subtitle: "QR Code", path: "/sensei/qrcode", delay: "0.1s" },
    { icon: Users, label: "Alunos", subtitle: "Lista", path: "/sensei/alunos", delay: "0.2s" },
    { icon: FileBarChart, label: "Relatório", subtitle: "Mensal", path: "/sensei/relatorio", delay: "0.3s" },
    { icon: ClipboardCheck, label: "Avaliações", subtitle: "Técnicas", path: "/sensei/avaliacao", delay: "0.4s" },
  ];

  return (
    <MobileLayout bgImage={paperTexture} showBrush={true} darkOverlay={false}>
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Header */}
        <div className="px-5 pt-8 pb-6">
          <p className="text-muted-foreground text-sm">押忍 (Osu)</p>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Bem-vindo, Sensei {usuario?.nome || ""}
          </h1>
        </div>

        {/* Grid 2x2 */}
        <div className="px-5 grid grid-cols-2 gap-4">
          {buttons.map((btn) => (
            <button
              key={btn.path}
              onClick={() => navigate(btn.path)}
              className="dojo-card flex flex-col items-center justify-center py-8 gap-3 hover:shadow-md transition-all animate-fade-in active:scale-95"
              style={{ animationDelay: btn.delay }}
            >
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <btn.icon className="text-primary-foreground" size={26} />
              </div>
              <div className="text-center">
                <p className="font-serif font-bold text-foreground">{btn.label}</p>
                <p className="text-xs text-muted-foreground">{btn.subtitle}</p>
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
