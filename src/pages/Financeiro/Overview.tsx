import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import karatekaBack from "@/assets/karateka-back.jpg";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, monthKey } from "@/lib/financeiro";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingDown, TrendingUp, Users, Receipt, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const FinanceiroOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [receita, setReceita] = useState(0);
  const [pendente, setPendente] = useState(0);
  const [despesa, setDespesa] = useState(0);
  const [inadimplentes, setInadimplentes] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const mes = monthKey(new Date());
        const [{ data: mens }, { data: desp }] = await Promise.all([
          supabase.from("mensalidades").select("valor,status").eq("mes_referencia", mes),
          supabase.from("despesas").select("valor,tipo").gte("data", mes),
        ]);

        let r = 0, p = 0, d = 0, ina = 0;
        (mens ?? []).forEach((m: any) => {
          const v = Number(m.valor) || 0;
          if (m.status === "pago") r += v;
          else { p += v; ina += 1; }
        });
        (desp ?? []).forEach((x: any) => {
          const v = Number(x.valor) || 0;
          if (x.tipo === "receita_avulsa") r += v;
          else d += v;
        });
        setReceita(r);
        setPendente(p);
        setDespesa(d);
        setInadimplentes(ina);
      } catch (e: any) {
        toast.error("Erro ao carregar financeiro");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const saldo = receita - despesa;

  return (
    <MobileLayout bgImage={karatekaBack} darkOverlay showBrush={false} showNav fullWidth>
      <div className="flex-1 px-5 md:px-[10%] pt-6 pb-24">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="text-primary" size={22} />
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground">
            Financeiro
          </h1>
        </div>
        <p className="text-primary-foreground/60 text-xs mb-6">
          Resumo do mês atual
        </p>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl bg-primary-foreground/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Card icon={<TrendingUp size={18} />} label="Receita" value={formatBRL(receita)} />
            <Card icon={<TrendingDown size={18} />} label="Despesas" value={formatBRL(despesa)} />
            <Card icon={<DollarSign size={18} />} label="Saldo" value={formatBRL(saldo)} highlight={saldo >= 0} />
            <Card icon={<AlertTriangle size={18} />} label="Pendente" value={formatBRL(pendente)} warn />
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 p-4">
          <p className="text-primary-foreground/70 text-xs">Inadimplentes este mês</p>
          <p className="text-primary-foreground text-xl font-serif font-bold">
            {loading ? "…" : inadimplentes}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/sensei/financeiro/mensalidades")}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-primary shadow-lg active:scale-95 transition"
          >
            <div className="flex items-center gap-3">
              <Users className="text-primary-foreground" size={22} />
              <div className="text-left">
                <p className="font-serif font-bold text-primary-foreground text-sm">Mensalidades</p>
                <p className="text-[11px] text-primary-foreground/60">Status por aluno</p>
              </div>
            </div>
            <span className="text-primary-foreground/70 text-lg">›</span>
          </button>

          <button
            onClick={() => navigate("/sensei/financeiro/despesas")}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-primary shadow-lg active:scale-95 transition"
          >
            <div className="flex items-center gap-3">
              <Receipt className="text-primary-foreground" size={22} />
              <div className="text-left">
                <p className="font-serif font-bold text-primary-foreground text-sm">Despesas & Receitas</p>
                <p className="text-[11px] text-primary-foreground/60">Lançamentos da unidade</p>
              </div>
            </div>
            <span className="text-primary-foreground/70 text-lg">›</span>
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};

const Card = ({
  icon,
  label,
  value,
  highlight,
  warn,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) => (
  <div
    className={`rounded-2xl p-4 border ${
      warn
        ? "bg-destructive/10 border-destructive/30"
        : highlight
        ? "bg-primary/15 border-primary/30"
        : "bg-primary-foreground/5 border-primary-foreground/10"
    }`}
  >
    <div className="flex items-center gap-2 text-primary-foreground/70 text-xs mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-primary-foreground text-lg font-serif font-bold">{value}</p>
  </div>
);

export default FinanceiroOverview;