import { useAuth } from "@/lib/auth";
import MobileLayout from "@/components/MobileLayout";
import karatekaBack from "@/assets/karateka-back.jpg";
import shizenLogo from "@/assets/shizen-logo.png";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, FileText, Bell, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const JURAMENTOS = [
  "Treinaremos firmemente o nosso coração e o nosso corpo para termos um espírito inabalável.",
  "Alimentaremos a verdadeira significação do Kyokushin Karatê, para que no devido tempo os nossos sentidos possam atuar melhor.",
  "Com verdadeiro vigor, procuraremos cultivar o espírito de abnegação.",
  "Observaremos as regras de cortesias, respeito aos nossos superiores e abstemos da violência.",
  'Seguiremos nosso "Deus" e eternas verdades, jamais esqueceremos a verdadeira virtude da humildade.',
  "Olharemos para alto, para a sabedoria e para o poder, não procurando outros desejos.",
  "Toda a nossa vida através da disciplina do Kyokushin Karatê, procuraremos preencher a verdadeira significação da filosofia da vida.",
];

const BELT_COLORS: Record<string, string> = {
  branca: "#FFFFFF",
  amarela: "#FFD700",
  vermelha: "#CC0000",
  laranja: "#FF8C00",
  azul: "#1E90FF",
  verde: "#228B22",
  marrom: "#8B4513",
  roxa: "#6A0DAD",
  preta: "#111111",
};

const StudentDashboard = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const beltColor = BELT_COLORS[(usuario?.faixa || "branca").toLowerCase()] || "#FFFFFF";

  const { data: comunicados } = useQuery({
    queryKey: ["comunicados-aluno-dash"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comunicados")
        .select("id, titulo, created_at")
        .order("created_at", { ascending: false })
        .limit(2);
      if (error) throw error;
      return data ?? [];
    },
  });

  const unreadCount = comunicados?.length || 0;

  const quickActions = [
    { icon: QrCode, label: "Presença", onClick: () => navigate("/presenca") },
    { icon: CalendarDays, label: "Calendário", onClick: () => navigate("/calendario") },
    { icon: FileText, label: "Documentos", onClick: () => navigate("/documentos") },
    { icon: Bell, label: "Notificações", badge: unreadCount, onClick: () => navigate("/notificacoes") },
  ];

  return (
    <MobileLayout showBrush={false} showNav={true} fullWidth={true}>
      {/* Dark header with bg */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${karatekaBack})` }} />
        <div className="absolute inset-0" style={{ backgroundColor: "hsla(0, 100%, 10%, 0.85)" }} />
        <div className="relative z-10 px-5 pt-6 pb-5 max-w-3xl mx-auto">
          {/* Logo */}
          <div className="mb-4">
            <img
              src={shizenLogo}
              alt="Shizen Dojo"
              className="w-16 h-16 rounded-full border-2 border-primary-foreground/30 object-cover"
            />
          </div>
          {/* Greeting */}
          <p className="text-primary text-sm font-medium">Olá,</p>
          <h1 className="text-2xl font-serif font-bold text-primary-foreground mt-0.5">
            {usuario?.nome || "Aluno"}
          </h1>
          <p className="text-primary-foreground/50 text-sm mt-0.5">押忍 - Osu!</p>

          {/* Belt card */}
          <div className="mt-4 rounded-xl p-4 flex items-center gap-4" style={{ backgroundColor: "hsl(0 100% 27%)" }}>
            <div className="w-16 h-10 rounded flex-shrink-0" style={{ backgroundColor: beltColor }} />
            <div className="flex-1 min-w-0">
              <p className="text-primary-foreground font-bold text-sm">Faixa {usuario?.faixa || "Branca"}</p>
              <p className="text-primary-foreground/60 text-xs">Progresso: {usuario?.progresso_faixa || 0}%</p>
              <div className="w-full h-2 rounded-full bg-primary-foreground/20 overflow-hidden mt-1.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${usuario?.progresso_faixa || 0}%`,
                    backgroundColor: "white",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-10" style={{ backgroundColor: "hsl(0, 0%, 15%)" }}>
        <div className="px-5 pt-5 pb-6 max-w-3xl mx-auto space-y-5">

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="rounded-xl py-4 flex flex-col items-center gap-2 transition-colors relative"
                style={{ backgroundColor: "hsl(0, 0%, 22%)" }}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsla(0, 100%, 27%, 0.6)" }}>
                    <action.icon size={22} className="text-primary-foreground" />
                  </div>
                  {action.badge ? (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {action.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-primary-foreground/80 text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Últimos Comunicados */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "hsl(0, 100%, 25%)" }}>
            <h2 className="text-primary-foreground font-serif font-bold text-base flex items-center gap-2 mb-3">
              <Bell size={18} />
              Últimos Comunicados
            </h2>
            <div className="space-y-2">
              {comunicados && comunicados.length > 0 ? comunicados.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg px-4 py-3 cursor-pointer hover:bg-white/20 active:bg-white/25 transition-colors"
                  style={{ backgroundColor: "hsla(0, 0%, 100%, 0.1)" }}
                  onClick={() => navigate("/comunicados")}
                >
                  <p className="text-primary-foreground text-sm font-medium truncate">{c.titulo}</p>
                  <p className="text-primary-foreground/50 text-xs mt-0.5">
                    {format(new Date(c.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              )) : (
                <p className="text-primary-foreground/40 text-xs text-center py-4">Nenhum comunicado recente</p>
              )}
            </div>
            <button
              onClick={() => navigate("/comunicados")}
              className="w-full text-center text-primary-foreground/60 text-xs mt-3 py-1 hover:text-primary-foreground transition-colors"
            >
              Toque para ver todos →
            </button>
          </div>

          {/* Juramentos */}
          <div className="rounded-xl p-5" style={{ backgroundColor: "hsl(0 100% 27%)" }}>
            <h2 className="text-primary-foreground font-serif font-bold text-lg flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: "hsla(0, 0%, 100%, 0.15)" }}>
                道
              </span>
              Os 7 Juramentos do Kyokushin
            </h2>
            <div className="space-y-5">
              {JURAMENTOS.map((juramento, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-primary-foreground/40 font-serif font-bold text-sm mt-0.5 shrink-0 w-5 text-right">
                    {i + 1}.
                  </span>
                  <p className="text-primary-foreground/85 text-sm leading-relaxed">{juramento}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-primary-foreground/50 text-lg font-serif mt-6">押忍!</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default StudentDashboard;
