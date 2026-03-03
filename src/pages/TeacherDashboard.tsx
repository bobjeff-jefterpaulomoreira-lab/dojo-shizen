import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import shizenLogo from "@/assets/shizen-logo.png";
import karatekaBack from "@/assets/karateka-back.jpg";
import { QrCode, Users, Bell, ClipboardCheck } from "lucide-react";

const TeacherDashboard = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const buttons = [
    { icon: QrCode, label: "Abrir Aula", subtitle: "(QR Code)", path: "/sensei/qrcode" },
    { icon: Users, label: "Alunos", subtitle: "5 cadastrados", path: "/sensei/alunos" },
    { icon: Bell, label: "Comunicados", subtitle: "Eventos e Avisos", path: "/sensei/comunicados" },
    { icon: ClipboardCheck, label: "Avaliações", subtitle: "Técnicas", path: "/sensei/avaliacao" },
  ];

  return (
    <MobileLayout bgImage={karatekaBack} darkOverlay={true} showBrush={false} showNav={true} fullWidth={true}>
      <div className="flex-1 flex flex-col items-start justify-center px-5 py-10">
        {/* Shizen Logo */}
        <div className="w-20 h-20 md:w-24 md:h-24 mb-4 animate-fade-in">
          <img src={shizenLogo} alt="Dojo Shizen" className="w-full h-full object-contain drop-shadow-lg rounded-2xl" />
        </div>

        {/* Welcome text */}
        <p className="text-primary text-xs md:text-sm font-bold tracking-widest uppercase mb-1 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Painel do Sensei
        </p>
        <h1 className="text-2xl md:text-4xl font-serif font-bold text-primary-foreground mb-1 animate-fade-in drop-shadow-md" style={{ animationDelay: "0.15s" }}>
          Bem-vindo, {usuario?.nome?.split(" ")[0] || "Sensei"}
        </h1>
        <p className="text-primary-foreground/60 text-sm mb-8 animate-fade-in font-serif" style={{ animationDelay: "0.2s" }}>
          押忍 - Osu!
        </p>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {buttons.map((btn, i) => (
            <button
              key={btn.path}
              onClick={() => navigate(btn.path)}
              className="flex flex-col items-center justify-center py-8 md:py-10 gap-3 rounded-2xl shadow-lg transition-all active:scale-95 hover:shadow-xl hover:scale-[1.02] animate-fade-in"
              style={{
                backgroundColor: "hsl(var(--primary))",
                animationDelay: `${0.35 + i * 0.08}s`,
              }}
            >
              <btn.icon className="text-primary-foreground" size={32} />
              <div className="text-center">
                <p className="font-serif font-bold text-primary-foreground text-sm">{btn.label}</p>
                <p className="text-[11px] text-primary-foreground/60">{btn.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Osu footer */}
        <p className="text-primary-foreground/40 text-sm font-serif mt-10 animate-fade-in" style={{ animationDelay: "0.7s" }}>
          押忍!
        </p>
      </div>
    </MobileLayout>
  );
};

export default TeacherDashboard;
