import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { Check, X, ChevronLeft, ChevronRight, ChevronDown, User, Calendar } from "lucide-react";

interface Presenca {
  id: string;
  data: string;
  presente: boolean;
  aluno_nome?: string;
  aluno_faixa?: string;
}

interface AlunoStats {
  nome: string;
  faixa: string;
  totalPresencas: number;
  totalAulas: number;
  percentual: number;
  presencas: Presenca[];
}

const AttendanceReport = () => {
  const { usuario } = useAuth();
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [alunosStats, setAlunosStats] = useState<AlunoStats[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openStudents, setOpenStudents] = useState<string[]>([]);
  const mesAtual = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const changeMonth = (delta: number) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + delta);
      return d;
    });
  };

  const toggleStudent = (studentName: string) => {
    setOpenStudents(prev => 
      prev.includes(studentName) 
        ? prev.filter(name => name !== studentName)
        : [...prev, studentName]
    );
  };

  useEffect(() => {
    const fetchPresencas = async () => {
      if (!usuario) return;

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split("T")[0];
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split("T")[0];

      if (usuario.role === "professor") {
        // Para professores: buscar presenças de todos os alunos da unidade
        const { data } = await supabase
          .from("presencas")
          .select(`
            id, data, presente, aluno_id,
            usuarios!inner(nome, faixa)
          `)
          .eq("unidade_id", usuario.unidade_id)
          .gte("data", startOfMonth)
          .lte("data", endOfMonth)
          .order("data", { ascending: true });

        if (data) {
          // Processar dados para agrupar por aluno
          const presencasComNome = data.map(p => ({
            id: p.id,
            data: p.data,
            presente: p.presente,
            aluno_nome: (p.usuarios as any).nome,
            aluno_faixa: (p.usuarios as any).faixa
          }));

          // Agrupar por aluno e calcular estatísticas
          const alunoMap = new Map<string, AlunoStats>();
          
          presencasComNome.forEach(p => {
            if (!p.aluno_nome) return;
            
            if (!alunoMap.has(p.aluno_nome)) {
              alunoMap.set(p.aluno_nome, {
                nome: p.aluno_nome,
                faixa: p.aluno_faixa || "Branca",
                totalPresencas: 0,
                totalAulas: 0,
                percentual: 0,
                presencas: []
              });
            }

            const stats = alunoMap.get(p.aluno_nome)!;
            stats.presencas.push(p);
            stats.totalAulas++;
            if (p.presente) stats.totalPresencas++;
          });

          // Calcular percentuais e ordenar por nome
          const alunosArray = Array.from(alunoMap.values()).map(aluno => ({
            ...aluno,
            percentual: aluno.totalAulas > 0 ? (aluno.totalPresencas / aluno.totalAulas) * 100 : 0
          })).sort((a, b) => a.nome.localeCompare(b.nome));

          setAlunosStats(alunosArray);
        }
      } else {
        // Para alunos: continuar como antes
        const { data } = await supabase
          .from("presencas")
          .select("id, data, presente")
          .eq("aluno_id", usuario.id)
          .gte("data", startOfMonth)
          .lte("data", endOfMonth)
          .order("data", { ascending: true });

        setPresencas((data as Presenca[]) || []);
      }
    };
    fetchPresencas();
  }, [usuario, currentDate]);

  const isAluno = usuario?.role === "aluno";

  return (
    <MobileLayout showBrush={true} showNav={true} fullWidth={true}>
      <PageHeader title="Relatório de Presença" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-24 bg-dojo-paper">
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

      
    </MobileLayout>
  );
};

export default AttendanceReport;
