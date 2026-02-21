import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import karatekaBack from "@/assets/karateka-back.jpg";
import shizenLogo from "@/assets/shizen-logo.png";

const TECNICAS = [
  { id: "Mae Geri", nome: "Mae Geri", desc: "(Chute Frontal)" },
  { id: "Soto Uke", nome: "Soto Uke", desc: "(Bloqueio Médio)" },
  { id: "Mawashi Geri", nome: "Mawashi Geri", desc: "(Chute Circular)" },
];

type StatusType = "aprovado" | "acompanhamento" | "nao_iniciado";

const statusLabel: Record<StatusType, string> = {
  aprovado: "Aprovado",
  acompanhamento: "Em Acompanhamento",
  nao_iniciado: "Não Iniciado",
};

const statusBadgeClass: Record<StatusType, string> = {
  aprovado: "badge-aprovado",
  acompanhamento: "badge-acompanhamento",
  nao_iniciado: "badge-nao-iniciado",
};

const statusColor: Record<StatusType, string> = {
  aprovado: "border-l-dojo-green",
  acompanhamento: "border-l-dojo-yellow",
  nao_iniciado: "border-l-dojo-red-status",
};

const Evolution = () => {
  const { usuario } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<Map<string, StatusType>>(new Map());

  useEffect(() => {
    const fetch = async () => {
      if (!usuario) return;
      const { data } = await supabase
        .from("avaliacoes")
        .select("tecnica, status")
        .eq("aluno_id", usuario.id);

      const map = new Map<string, StatusType>();
      (data || []).forEach((a: any) => map.set(a.tecnica, a.status));
      setAvaliacoes(map);
    };
    fetch();
  }, [usuario]);

  return (
    <MobileLayout showBrush={false} showNav={true} fullWidth={true}>
      {/* Header with bg */}
      <div className="relative overflow-hidden h-64">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${karatekaBack})` }} />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} />
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <img src={shizenLogo} alt="Shizen" className="w-20 h-20 object-contain drop-shadow-lg" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 md:pb-10 bg-dojo-paper -mt-6 rounded-t-3xl relative z-10">
        <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto">
          <h1 className="text-xl font-serif font-bold text-foreground mb-1">Evolução</h1>
          <h2 className="text-sm text-muted-foreground mb-5">Técnicas da Faixa</h2>

          <div className="space-y-3">
            {TECNICAS.map((t, i) => {
              const status = avaliacoes.get(t.id) || "nao_iniciado";
              return (
                <div
                  key={t.id}
                  className={`dojo-card border-l-4 ${statusColor[status]} flex items-center justify-between animate-fade-in`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🥋</span>
                    <div>
                      <p className="font-serif font-bold text-foreground text-sm">{t.nome} {t.desc}</p>
                      <p className="text-[10px] text-muted-foreground">{statusLabel[status]}</p>
                    </div>
                  </div>
                  <span className={statusBadgeClass[status]}>
                    {status === "aprovado" ? "Aprovado" : status === "acompanhamento" ? "EM" : "NI"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Evolution;
