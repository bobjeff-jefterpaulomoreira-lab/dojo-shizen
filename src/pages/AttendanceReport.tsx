import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Presenca {
  id: string;
  data: string;
  presente: boolean;
}

const AttendanceReport = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [mesAtual, setMesAtual] = useState("");

  useEffect(() => {
    const fetchPresencas = async () => {
      if (!usuario) return;
      const now = new Date();
      setMesAtual(now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }));

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

      const { data } = await supabase
        .from("presencas")
        .select("id, data, presente")
        .eq("aluno_id", usuario.id)
        .gte("data", startOfMonth)
        .lte("data", endOfMonth)
        .order("data", { ascending: true });

      setPresencas((data as Presenca[]) || []);
    };
    fetchPresencas();
  }, [usuario]);

  const isAluno = usuario?.role === "aluno";

  return (
    <MobileLayout showBrush={true}>
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-5 pt-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-foreground mb-4">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          <h1 className="text-2xl font-serif font-bold text-foreground mb-1">
            Relatório de Presença
          </h1>
          <p className="text-sm text-muted-foreground mb-6 capitalize">{mesAtual}</p>

          {presencas.length === 0 ? (
            <div className="dojo-card text-center py-8">
              <p className="text-muted-foreground text-sm">Nenhum registro encontrado neste mês.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {presencas.map((p, i) => (
                <div
                  key={p.id}
                  className="dojo-card flex items-center justify-between animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="text-sm font-medium text-foreground">
                    {new Date(p.data + "T00:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                  {p.presente ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-dojo-green">
                      <Check size={16} /> Presente
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-dojo-red-status">
                      <X size={16} /> Ausente
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav role={isAluno ? "aluno" : "professor"} />
    </MobileLayout>
  );
};

export default AttendanceReport;
