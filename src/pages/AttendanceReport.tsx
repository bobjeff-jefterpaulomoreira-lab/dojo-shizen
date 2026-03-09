import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { Check, X, ChevronLeft, ChevronRight, ChevronDown, User, Calendar, Clock, LogIn, LogOut } from "lucide-react";

interface Presenca {
  id: string;
  data: string;
  presente: boolean;
  aluno_nome?: string;
  aluno_faixa?: string;
  hora_entrada?: string | null;
  hora_saida?: string | null;
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
            id, data, presente, hora_entrada, hora_saida, aluno_id,
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
            hora_entrada: (p as any).hora_entrada,
            hora_saida: (p as any).hora_saida,
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
  const isProfessor = usuario?.role === "professor";

  const formatTime = (iso?: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const calcDuration = (entrada?: string | null, saida?: string | null) => {
    if (!entrada || !saida) return null;
    const diff = Math.round((new Date(saida).getTime() - new Date(entrada).getTime()) / 60000);
    if (diff < 0) return null;
    if (diff < 60) return `${diff}min`;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

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
          {isProfessor ? (
            /* Vista do Professor - Lista de Alunos com Estatísticas */
            alunosStats.length === 0 ? (
              <div className="dojo-card text-center py-8">
                <p className="text-muted-foreground text-sm">Nenhum registro encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alunosStats.map((aluno, i) => (
                  <Collapsible key={aluno.nome}>
                    <div 
                      className="dojo-card animate-fade-in"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <CollapsibleTrigger 
                        className="w-full flex items-center justify-between p-0"
                        onClick={() => toggleStudent(aluno.nome)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <User size={16} className="text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-foreground">{aluno.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              Faixa {aluno.faixa} • {aluno.totalPresencas}/{aluno.totalAulas} presenças
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`text-sm font-bold ${
                            aluno.percentual >= 80 ? 'text-dojo-green' : 
                            aluno.percentual >= 60 ? 'text-yellow-600' : 'text-dojo-red-status'
                          }`}>
                            {Math.round(aluno.percentual)}%
                          </div>
                          <ChevronDown size={16} className={`text-muted-foreground transition-transform ${
                            openStudents.includes(aluno.nome) ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-3 pt-3 border-t border-muted">
                        <div className="space-y-2">
                          {aluno.presencas.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              Nenhuma presença registrada
                            </p>
                          ) : (
                            aluno.presencas.map((p) => (
                              <div key={p.id} className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2">
                                  <Calendar size={12} className="text-muted-foreground" />
                                  <span className="text-xs text-foreground">
                                    {new Date(p.data + "T00:00:00").toLocaleDateString("pt-BR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                    })}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {p.presente ? "Presente" : "Ausente"}
                                  </span>
                                </div>
                                {p.presente ? (
                                  <Check size={14} className="text-dojo-green" strokeWidth={2} />
                                ) : (
                                  <X size={14} className="text-dojo-red-status" strokeWidth={2} />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )
          ) : (
            /* Vista do Aluno - Lista de Presenças Individual */
            presencas.length === 0 ? (
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
            )
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default AttendanceReport;
