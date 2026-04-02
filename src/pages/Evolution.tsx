import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, TrendingUp, Award, Calendar, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { BELT_COLORS, BELT_ORDER, CATEGORIAS, TECNICAS_POR_CATEGORIA } from "@/lib/constants";

type StatusType = "aprovado" | "acompanhamento" | "nao_iniciado";

const statusConfig: Record<StatusType, { label: string; icon: typeof CheckCircle2; colorClass: string; dotClass: string }> = {
  aprovado: { label: "Aprovado", icon: CheckCircle2, colorClass: "text-dojo-green", dotClass: "bg-dojo-green" },
  acompanhamento: { label: "Em Acompanhamento", icon: Clock, colorClass: "text-dojo-yellow", dotClass: "bg-dojo-yellow" },
  nao_iniciado: { label: "Não Iniciado", icon: XCircle, colorClass: "text-dojo-red-status", dotClass: "bg-dojo-red-status" },
};

const Evolution = () => {
  const { usuario } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<Map<string, { status: StatusType; obs: string | null }>>(new Map());
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [presencasMes, setPresencasMes] = useState(0);
  const [totalPresencas, setTotalPresencas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [avalRes, mesRes, totalRes] = await Promise.all([
          supabase.from("avaliacoes").select("tecnica, status, observacoes").eq("aluno_id", usuario.id),
          supabase.from("presencas").select("*", { count: "exact", head: true })
            .eq("aluno_id", usuario.id).eq("presente", true)
            .gte("data", format(startOfMonth(new Date()), "yyyy-MM-dd"))
            .lte("data", format(endOfMonth(new Date()), "yyyy-MM-dd")),
          supabase.from("presencas").select("*", { count: "exact", head: true })
            .eq("aluno_id", usuario.id).eq("presente", true),
        ]);

        if (avalRes.error) throw avalRes.error;
        if (mesRes.error) throw mesRes.error;
        if (totalRes.error) throw totalRes.error;

        const map = new Map<string, { status: StatusType; obs: string | null }>();
        (avalRes.data || []).forEach((a) => map.set(a.tecnica, { status: a.status as StatusType, obs: a.observacoes }));
        setAvaliacoes(map);
        setPresencasMes(mesRes.count || 0);
        setTotalPresencas(totalRes.count || 0);
      } catch {
        toast.error("Erro ao carregar dados de evolução.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [usuario]);

  const allTecnicas = useMemo(() => {
    const items: { nome: string; desc: string; label: string; categoria: string }[] = [];
    Object.entries(TECNICAS_POR_CATEGORIA).forEach(([cat, tecnicas]) => {
      tecnicas.forEach((t) => items.push({ ...t, categoria: cat }));
    });
    return items;
  }, []);

  const tecnicasFiltradas = categoriaAtiva === "Todas"
    ? allTecnicas
    : allTecnicas.filter((t) => t.categoria === categoriaAtiva);

  const stats = useMemo(() => {
    let aprovado = 0, acompanhamento = 0, naoIniciado = 0;
    const total = allTecnicas.length;
    allTecnicas.forEach((t) => {
      const av = avaliacoes.get(t.label) || avaliacoes.get(t.nome) || avaliacoes.get(`${t.nome} (${t.desc})`);
      if (av?.status === "aprovado") aprovado++;
      else if (av?.status === "acompanhamento") acompanhamento++;
      else naoIniciado++;
    });
    return { aprovado, acompanhamento, naoIniciado, total, percentAprovado: total > 0 ? Math.round((aprovado / total) * 100) : 0 };
  }, [avaliacoes, allTecnicas]);

  const categoryStats = useMemo(() => {
    const result: Record<string, { total: number; aprovado: number }> = {};
    Object.entries(TECNICAS_POR_CATEGORIA).forEach(([cat, tecnicas]) => {
      let aprovado = 0;
      tecnicas.forEach((t) => {
        const av = avaliacoes.get(t.label) || avaliacoes.get(t.nome) || avaliacoes.get(`${t.nome} (${t.desc})`);
        if (av?.status === "aprovado") aprovado++;
      });
      result[cat] = { total: tecnicas.length, aprovado };
    });
    return result;
  }, [avaliacoes]);

  const getStatus = (tecnica: { nome: string; desc: string; label: string }): StatusType => {
    const av = avaliacoes.get(tecnica.label) || avaliacoes.get(tecnica.nome) || avaliacoes.get(`${tecnica.nome} (${tecnica.desc})`);
    return (av?.status as StatusType) || "nao_iniciado";
  };

  const getObs = (tecnica: { nome: string; desc: string; label: string }): string | null => {
    const av = avaliacoes.get(tecnica.label) || avaliacoes.get(tecnica.nome) || avaliacoes.get(`${tecnica.nome} (${tecnica.desc})`);
    return av?.obs || null;
  };

  const faixa = usuario?.faixa?.toLowerCase() || "branca";
  const beltColor = BELT_COLORS[faixa] || "#888";
  const currentBeltIndex = BELT_ORDER.indexOf(faixa);
  const nextBelt = currentBeltIndex < BELT_ORDER.length - 1 ? BELT_ORDER[currentBeltIndex + 1] : null;

  if (loading) {
    return (
      <MobileLayout showBrush={false} showNav={true} fullWidth={true}>
        <PageHeader title="Minha Evolução" showBack={true} />
        <div className="flex-1 overflow-y-auto pb-24 bg-dojo-paper px-4 pt-3 space-y-3">
          <Skeleton className="w-full h-32 rounded-2xl" />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-full h-14 rounded-xl" />)}
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBrush={false} showNav={true} fullWidth={true}>
      <PageHeader title="Minha Evolução" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-24 bg-dojo-paper">
        {/* Belt & Progress Header */}
        <div className="mx-4 mt-3 rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${beltColor}22, ${beltColor}08)`, border: `1px solid ${beltColor}30` }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${beltColor}20` }}>
              <Award size={24} style={{ color: beltColor }} />
            </div>
            <div className="flex-1">
              <p className="font-serif font-bold text-foreground text-base capitalize">Faixa {usuario?.faixa}</p>
              {nextBelt && (
                <p className="text-xs text-muted-foreground">Próxima: Faixa <span className="capitalize">{nextBelt}</span></p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{stats.percentAprovado}%</p>
              <p className="text-[10px] text-muted-foreground">concluído</p>
            </div>
          </div>
          <Progress value={stats.percentAprovado} className="h-2" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 px-4 mt-3">
          <div className="dojo-card flex flex-col items-center py-3">
            <div className="w-8 h-8 rounded-full bg-dojo-green/15 flex items-center justify-center mb-1">
              <CheckCircle2 size={16} className="text-dojo-green" />
            </div>
            <p className="text-lg font-bold text-foreground">{stats.aprovado}</p>
            <p className="text-[10px] text-muted-foreground">Aprovado</p>
          </div>
          <div className="dojo-card flex flex-col items-center py-3">
            <div className="w-8 h-8 rounded-full bg-dojo-yellow/15 flex items-center justify-center mb-1">
              <Clock size={16} className="text-dojo-yellow" />
            </div>
            <p className="text-lg font-bold text-foreground">{stats.acompanhamento}</p>
            <p className="text-[10px] text-muted-foreground leading-tight text-center">Acompan.</p>
          </div>
          <div className="dojo-card flex flex-col items-center py-3">
            <div className="w-8 h-8 rounded-full bg-dojo-red-status/15 flex items-center justify-center mb-1">
              <XCircle size={16} className="text-dojo-red-status" />
            </div>
            <p className="text-lg font-bold text-foreground">{stats.naoIniciado}</p>
            <p className="text-[10px] text-muted-foreground">Pendente</p>
          </div>
        </div>

        {/* Attendance & Summary Row */}
        <div className="grid grid-cols-2 gap-2 px-4 mt-2">
          <div className="dojo-card flex items-center gap-2.5 py-3 px-3">
            <Calendar size={18} className="text-primary shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">{presencasMes}</p>
              <p className="text-[10px] text-muted-foreground">Presenças este mês</p>
            </div>
          </div>
          <div className="dojo-card flex items-center gap-2.5 py-3 px-3">
            <TrendingUp size={18} className="text-primary shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">{totalPresencas}</p>
              <p className="text-[10px] text-muted-foreground">Total de presenças</p>
            </div>
          </div>
        </div>

        {/* Category Progress */}
        <div className="px-4 mt-4">
          <h3 className="font-serif font-bold text-foreground text-sm mb-2">Progresso por Categoria</h3>
          <div className="space-y-2">
            {Object.entries(categoryStats).map(([cat, data]) => {
              const pct = data.total > 0 ? Math.round((data.aprovado / data.total) * 100) : 0;
              return (
                <div key={cat} className="dojo-card py-2.5 px-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-semibold text-foreground text-xs">{cat}</span>
                    <span className="text-[10px] text-muted-foreground">{data.aprovado}/{data.total} — {pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 mt-5">
          <h3 className="font-serif font-bold text-foreground text-sm mb-2">Técnicas</h3>
          <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                  categoriaAtiva === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Techniques List */}
        <div className="px-4 mt-2 space-y-1.5 pb-4">
          {tecnicasFiltradas.map((t, i) => {
            const status = getStatus(t);
            const obs = getObs(t);
            const cfg = statusConfig[status];
            const Icon = cfg.icon;
            return (
              <div
                key={`${t.categoria}-${t.nome}`}
                className="dojo-card flex items-center gap-3 py-2.5 px-3 border-l-[3px] animate-fade-in"
                style={{
                  borderLeftColor: status === "aprovado" ? "hsl(var(--dojo-green))" : status === "acompanhamento" ? "hsl(var(--dojo-yellow))" : "hsl(var(--dojo-red-status))",
                  animationDelay: `${i * 0.03}s`,
                }}
              >
                <div className={cn("shrink-0", cfg.colorClass)}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-bold text-foreground text-xs">{t.nome}</p>
                  <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                  {obs && <p className="text-[10px] text-muted-foreground italic mt-0.5">"{obs}"</p>}
                </div>
                <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", cfg.dotClass, "text-white",
                  status === "acompanhamento" && "text-foreground"
                )}>
                  {status === "aprovado" ? "✓" : status === "acompanhamento" ? "●" : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Evolution;
