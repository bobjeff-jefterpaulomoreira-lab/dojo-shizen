import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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

interface PresencaJoin {
  id: string;
  data: string;
  presente: boolean;
  hora_entrada: string | null;
  hora_saida: string | null;
  aluno_id: string;
  usuarios: { nome: string; faixa: string };
}

const AttendanceReport = () => {
  const { usuario } = useAuth();
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [alunosStats, setAlunosStats] = useState<AlunoStats[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openStudents, setOpenStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split("T")[0];
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split("T")[0];

      try {
        if (usuario.role === "professor") {
          const { data, error } = await supabase
            .from("presencas")
            .select(`
              id, data, presente, hora_entrada, hora_saida, aluno_id,
              usuarios!inner(nome, faixa)
            `)
            .eq("unidade_id", usuario.unidade_id)
            .gte("data", startOfMonth)
            .lte("data", endOfMonth)
            .order("data", { ascending: true });

          if (error) throw error;

          if (data) {
            const typed = data as unknown as PresencaJoin[];
            const presencasComNome = typed.map(p => ({
              id: p.id,
              data: p.data,
              presente: p.presente,
              hora_entrada: p.hora_entrada,
              hora_saida: p.hora_saida,
              aluno_nome: p.usuarios.nome,
              aluno_faixa: p.usuarios.faixa,
            }));

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

            const alunosArray = Array.from(alunoMap.values()).map(aluno => ({
              ...aluno,
              percentual: aluno.totalAulas > 0 ? (aluno.totalPresencas / aluno.totalAulas) * 100 : 0
            })).sort((a, b) => a.nome.localeCompare(b.nome));

            setAlunosStats(alunosArray);
          }
        } else {
          const { data, error } = await supabase
            .from("presencas")
            .select("id, data, presente, hora_entrada, hora_saida")
            .eq("aluno_id", usuario.id)
            .gte("data", startOfMonth)
            .lte("data", endOfMonth)
            .order("data", { ascending: true });

          if (error) throw error;
          setPresencas((data as Presenca[]) || []);
        }
      } catch (err) {
        toast.error("Erro ao carregar presenças. Tente novamente.");
      } finally {
        setLoading(false);
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
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-full h-20 rounded-xl" />)}
            </div>
          ) : isProfessor ? (
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
                            aluno.presencas.map((p) => {
                              const duracao = calcDuration(p.hora_entrada, p.hora_saida);
                              return (
                                <div key={p.id} className="flex items-center justify-between py-1.5 gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Calendar size={12} className="text-muted-foreground shrink-0" />
                                    <span className="text-xs text-foreground">
                                      {new Date(p.data + "T00:00:00").toLocaleDateString("pt-BR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {formatTime(p.hora_entrada) && (
                                      <span className="flex items-center gap-0.5 text-[10px] text-green-700">
                                        <LogIn size={10} />
                                        {formatTime(p.hora_entrada)}
                                      </span>
                                    )}
                                    {formatTime(p.hora_saida) && (
                                      <span className="flex items-center gap-0.5 text-[10px] text-red-600">
                                        <LogOut size={10} />
                                        {formatTime(p.hora_saida)}
                                      </span>
                                    )}
                                    {duracao && (
                                      <span className="flex items-center gap-0.5 text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                                        <Clock size={10} />
                                        {duracao}
                                      </span>
                                    )}
                                    {p.presente ? (
                                      <Check size={14} className="text-dojo-green" strokeWidth={2} />
                                    ) : (
                                      <X size={14} className="text-dojo-red-status" strokeWidth={2} />
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )
          ) : (
            presencas.length === 0 ? (
              <div className="dojo-card text-center py-8">
                <p className="text-muted-foreground text-sm">Nenhum registro encontrado.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {presencas.map((p, i) => {
                  const duracao = calcDuration(p.hora_entrada, p.hora_saida);
                  return (
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
                        {formatTime(p.hora_entrada) && (
                          <span className="flex items-center gap-0.5 text-[11px] text-green-700">
                            <LogIn size={11} />
                            {formatTime(p.hora_entrada)}
                          </span>
                        )}
                        {formatTime(p.hora_saida) && (
                          <span className="flex items-center gap-0.5 text-[11px] text-red-600">
                            <LogOut size={11} />
                            {formatTime(p.hora_saida)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {duracao && (
                          <span className="flex items-center gap-0.5 text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                            <Clock size={10} />
                            {duracao}
                          </span>
                        )}
                        {p.presente ? (
                          <Check size={18} className="text-dojo-green" strokeWidth={3} />
                        ) : (
                          <X size={18} className="text-dojo-red-status" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default AttendanceReport;
