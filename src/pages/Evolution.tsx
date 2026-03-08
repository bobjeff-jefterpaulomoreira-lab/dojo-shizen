import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, TrendingUp, Award, Calendar, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

type StatusType = "aprovado" | "acompanhamento" | "nao_iniciado";

const CATEGORIAS = ["Todas", "Kihon", "Kata", "Kumite", "Idogeiko"];

const TECNICAS_POR_CATEGORIA: Record<string, { nome: string; desc: string }[]> = {
  Kihon: [
    { nome: "Mae Geri", desc: "Chute Frontal" },
    { nome: "Mawashi Geri", desc: "Chute Circular" },
    { nome: "Yoko Geri", desc: "Chute Lateral" },
    { nome: "Ushiro Geri", desc: "Chute para Trás" },
    { nome: "Soto Uke", desc: "Defesa Externa" },
    { nome: "Uchi Uke", desc: "Defesa Interna" },
    { nome: "Gedan Barai", desc: "Defesa Baixa" },
    { nome: "Age Uke", desc: "Defesa Alta" },
    { nome: "Seiken", desc: "Soco Básico" },
    { nome: "Uraken", desc: "Soco com Dorso" },
    { nome: "Shuto Uchi", desc: "Golpe com Mão Aberta" },
  ],
  Kata: [
    { nome: "Taikyoku Sono Ichi", desc: "Forma Básica 1" },
    { nome: "Taikyoku Sono Ni", desc: "Forma Básica 2" },
    { nome: "Taikyoku Sono San", desc: "Forma Básica 3" },
    { nome: "Pinan Sono Ichi", desc: "Pinan 1" },
    { nome: "Pinan Sono Ni", desc: "Pinan 2" },
    { nome: "Pinan Sono San", desc: "Pinan 3" },
    { nome: "Pinan Sono Yon", desc: "Pinan 4" },
    { nome: "Pinan Sono Go", desc: "Pinan 5" },
    { nome: "Sanchin", desc: "Kata de Respiração" },
    { nome: "Tensho", desc: "Mãos Rotativas" },
    { nome: "Gekisai Dai", desc: "Kata Avançado" },
    { nome: "Gekisai Sho", desc: "Kata Avançado" },
  ],
  Kumite: [
    { nome: "Sanbon Kumite", desc: "3 Passos" },
    { nome: "Ippon Kumite", desc: "1 Passo" },
    { nome: "Jiyu Kumite", desc: "Luta Livre" },
    { nome: "Yakusoku Kumite", desc: "Combinado" },
    { nome: "Shiai Kumite", desc: "Competição" },
  ],
  Idogeiko: [
    { nome: "Ido Geiko Mae Geri", desc: "Movimento com Chute Frontal" },
    { nome: "Ido Geiko Mawashi Geri", desc: "Movimento com Chute Circular" },
    { nome: "Ido Geiko Yoko Geri", desc: "Movimento com Chute Lateral" },
    { nome: "Ido Geiko Oi Tsuki", desc: "Movimento com Soco Direto" },
    { nome: "Ido Geiko Gyaku Tsuki", desc: "Movimento com Soco Invertido" },
    { nome: "Ido Geiko Soto Uke", desc: "Movimento com Defesa Externa" },
    { nome: "Ido Geiko Uchi Uke", desc: "Movimento com Defesa Interna" },
    { nome: "Ido Geiko Gedan Barai", desc: "Movimento com Defesa Baixa" },
    { nome: "Ido Geiko Combinações", desc: "Combinações em Movimento" },
  ],
};

const BELT_COLORS: Record<string, string> = {
  branca: "#CCCCCC",
  amarela: "#DAA520",
  vermelha: "#CC0000",
  laranja: "#FF8C00",
  azul: "#1E90FF",
  verde: "#228B22",
  marrom: "#8B4513",
  roxa: "#6A0DAD",
  preta: "#111111",
};

const BELT_ORDER = ["branca", "amarela", "laranja", "azul", "verde", "roxa", "marrom", "preta"];

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

  useEffect(() => {
    if (!usuario) return;

    const fetchAvaliacoes = async () => {
      const { data } = await supabase
        .from("avaliacoes")
        .select("tecnica, status, observacoes")
        .eq("aluno_id", usuario.id);
      const map = new Map<string, { status: StatusType; obs: string | null }>();
      (data || []).forEach((a: any) => map.set(a.tecnica, { status: a.status, obs: a.observacoes }));
      setAvaliacoes(map);
    };

    const fetchPresencas = async () => {
      const now = new Date();
      const mStart = format(startOfMonth(now), "yyyy-MM-dd");
      const mEnd = format(endOfMonth(now), "yyyy-MM-dd");

      const { count: mesCount } = await supabase
        .from("presencas")
        .select("*", { count: "exact", head: true })
        .eq("aluno_id", usuario.id)
        .eq("presente", true)
        .gte("data", mStart)
        .lte("data", mEnd);

      const { count: totalCount } = await supabase
        .from("presencas")
        .select("*", { count: "exact", head: true })
        .eq("aluno_id", usuario.id)
        .eq("presente", true);

      setPresencasMes(mesCount || 0);
      setTotalPresencas(totalCount || 0);
    };

    fetchAvaliacoes();
    fetchPresencas();
  }, [usuario]);

  const allTecnicas = useMemo(() => {
    const items: { nome: string; desc: string; categoria: string }[] = [];
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
      const key = t.nome;
      // Also try matching with description format from Assessment
      const fullKey = `${t.nome} (${t.desc})`;
      const av = avaliacoes.get(key) || avaliacoes.get(fullKey);
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
        const fullKey = `${t.nome} (${t.desc})`;
        const av = avaliacoes.get(t.nome) || avaliacoes.get(fullKey);
        if (av?.status === "aprovado") aprovado++;
      });
      result[cat] = { total: tecnicas.length, aprovado };
    });
    return result;
  }, [avaliacoes]);

  const getStatus = (tecnica: { nome: string; desc: string }): StatusType => {
    const fullKey = `${tecnica.nome} (${tecnica.desc})`;
    const av = avaliacoes.get(tecnica.nome) || avaliacoes.get(fullKey);
    return av?.status || "nao_iniciado";
  };

  const getObs = (tecnica: { nome: string; desc: string }): string | null => {
    const fullKey = `${tecnica.nome} (${tecnica.desc})`;
    const av = avaliacoes.get(tecnica.nome) || avaliacoes.get(fullKey);
    return av?.obs || null;
  };

  const faixa = usuario?.faixa?.toLowerCase() || "branca";
  const beltColor = BELT_COLORS[faixa] || "#888";
  const currentBeltIndex = BELT_ORDER.indexOf(faixa);
  const nextBelt = currentBeltIndex < BELT_ORDER.length - 1 ? BELT_ORDER[currentBeltIndex + 1] : null;

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
