import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Presenca {
  id: string;
  data: string;
  presente: boolean;
}

const AttendanceReport = () => {
  const { usuario } = useAuth();
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const mesAtual = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const changeMonth = (delta: number) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + delta);
      return d;
    });
  };

  useEffect(() => {
    const fetchPresencas = async () => {
      if (!usuario) return;

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split("T")[0];
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split("T")[0];

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
  }, [usuario, currentDate]);

  const isAluno = usuario?.role === "aluno";

  return (
    <MobileLayout showBrush={true}>
      <PageHeader title="Relatório de Presença" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-20 bg-dojo-paper">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-muted">
            <ChevronLeft size={18} className="text-primary" />
          </button>
          <span className="text-sm font-serif font-bold text-primary capitalize">{mesAtual}</span>
          <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-muted">
            <ChevronRight size={18} className="text-primary" />
          </button>
        </div>

        <div className="px-5">
          {presencas.length === 0 ? (
            <div className="dojo-card text-center py-8">
              <p className="text-muted-foreground text-sm">Nenhum registro encontrado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {presencas.map((p, i) => (
                <div
                  key={p.id}
                  className="dojo-card flex items-center justify-between animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground w-12">
                      {new Date(p.data + "T00:00:00").toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    <span className="text-sm text-foreground">
                      {p.presente ? "Presente" : "Ausente"}
                    </span>
                  </div>
                  {p.presente ? (
                    <Check size={18} className="text-dojo-green" strokeWidth={3} />
                  ) : (
                    <X size={18} className="text-dojo-red-status" strokeWidth={3} />
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
