import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import toriiImg from "@/assets/torii-bg.jpg";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TECNICAS = ["Mae Geri", "Soto Uke", "Mawashi Geri"];

type StatusType = "aprovado" | "acompanhamento" | "nao_iniciado";

interface Avaliacao {
  tecnica: string;
  status: StatusType;
}

const statusLabel: Record<StatusType, string> = {
  aprovado: "Aprovado",
  acompanhamento: "Em Acompanhamento",
  nao_iniciado: "Não Iniciado",
};

const statusClass: Record<StatusType, string> = {
  aprovado: "badge-aprovado",
  acompanhamento: "badge-acompanhamento",
  nao_iniciado: "badge-nao-iniciado",
};

const Evolution = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);

  useEffect(() => {
    const fetch = async () => {
      if (!usuario) return;
      const { data } = await supabase
        .from("avaliacoes")
        .select("tecnica, status")
        .eq("aluno_id", usuario.id);

      const map = new Map<string, StatusType>();
      (data || []).forEach((a: any) => map.set(a.tecnica, a.status));

      setAvaliacoes(
        TECNICAS.map((t) => ({
          tecnica: t,
          status: map.get(t) || "nao_iniciado",
        }))
      );
    };
    fetch();
  }, [usuario]);

  return (
    <MobileLayout bgImage={toriiImg} showBrush={false}>
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-5 pt-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-foreground mb-4">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          <h1 className="text-2xl font-serif font-bold text-primary-foreground mb-6">
            Evolução Técnica
          </h1>

          <div className="space-y-3">
            {avaliacoes.map((a, i) => (
              <div
                key={a.tecnica}
                className="dojo-card flex items-center justify-between animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div>
                  <p className="font-serif font-bold text-foreground">{a.tecnica}</p>
                  <p className="text-xs text-muted-foreground">{statusLabel[a.status]}</p>
                </div>
                <span className={statusClass[a.status]}>
                  {statusLabel[a.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav role="aluno" />
    </MobileLayout>
  );
};

export default Evolution;
