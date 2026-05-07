import { useEffect, useMemo, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import karatekaBack from "@/assets/karateka-back.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { exportCSV, formatBRL, monthKey, monthLabel } from "@/lib/financeiro";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

interface Aluno {
  id: string;
  nome: string;
  unidade_id: string;
}
interface Mens {
  id?: string;
  aluno_id: string;
  unidade_id: string;
  mes_referencia: string;
  valor: number;
  status: string;
  data_pagamento: string | null;
  forma_pagamento: string | null;
}

const Mensalidades = () => {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [mens, setMens] = useState<Record<string, Mens>>({});
  const [valorPadrao, setValorPadrao] = useState<number>(0);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [mesOffset, setMesOffset] = useState(0);

  const mesAtual = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + mesOffset, 1);
    return monthKey(d);
  }, [mesOffset]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: us }, { data: cfg }, { data: ms }] = await Promise.all([
          supabase.from("usuarios").select("id,nome,unidade_id").eq("role", "aluno").order("nome"),
          supabase.from("config_financeiro").select("valor_mensalidade_padrao").maybeSingle(),
          supabase.from("mensalidades").select("*").eq("mes_referencia", mesAtual),
        ]);
        setAlunos((us as Aluno[]) ?? []);
        setValorPadrao(Number(cfg?.valor_mensalidade_padrao ?? 0));
        const map: Record<string, Mens> = {};
        (ms ?? []).forEach((m: any) => { map[m.aluno_id] = m as Mens; });
        setMens(map);
      } catch {
        toast.error("Erro ao carregar mensalidades");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [mesAtual]);

  const upsert = async (aluno: Aluno, patch: Partial<Mens>) => {
    if (savingId) return;
    setSavingId(aluno.id);
    try {
      const existing = mens[aluno.id];
      const row: Mens = {
        ...(existing ?? {
          aluno_id: aluno.id,
          unidade_id: aluno.unidade_id,
          mes_referencia: mesAtual,
          valor: valorPadrao || 0,
          status: "pendente",
          data_pagamento: null,
          forma_pagamento: null,
        }),
        ...patch,
      };
      const { data, error } = await supabase
        .from("mensalidades")
        .upsert(row, { onConflict: "aluno_id,mes_referencia" })
        .select()
        .maybeSingle();
      if (error) throw error;
      setMens((prev) => ({ ...prev, [aluno.id]: data as Mens }));
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar");
    } finally {
      setSavingId(null);
    }
  };

  const exportar = () => {
    const rows = alunos.map((a) => {
      const m = mens[a.id];
      return {
        Aluno: a.nome,
        Mes: monthLabel(mesAtual),
        Valor: m?.valor ?? valorPadrao ?? 0,
        Status: m?.status ?? "pendente",
        DataPagamento: m?.data_pagamento ?? "",
        Forma: m?.forma_pagamento ?? "",
      };
    });
    exportCSV(`mensalidades_${mesAtual}.csv`, rows);
  };

  const salvarValorPadrao = async (v: number) => {
    if (!usuario) return;
    try {
      const { error } = await supabase
        .from("config_financeiro")
        .upsert(
          { unidade_id: usuario.unidade_id, valor_mensalidade_padrao: v, dia_vencimento: 10 },
          { onConflict: "unidade_id" },
        );
      if (error) throw error;
      setValorPadrao(v);
      toast.success("Valor padrão atualizado");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar valor padrão");
    }
  };

  return (
    <MobileLayout bgImage={karatekaBack} darkOverlay showBrush={false} showNav fullWidth>
      <div className="flex-1 px-4 md:px-[8%] pt-6 pb-24">
        <h1 className="text-xl md:text-2xl font-serif font-bold text-primary-foreground mb-3">
          Mensalidades
        </h1>

        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1 bg-primary-foreground/10 rounded-lg p-1">
            <button onClick={() => setMesOffset((o) => o - 1)} className="p-1 text-primary-foreground/80">
              <ChevronLeft size={16} />
            </button>
            <span className="text-primary-foreground text-xs px-2 capitalize">{monthLabel(mesAtual)}</span>
            <button onClick={() => setMesOffset((o) => o + 1)} className="p-1 text-primary-foreground/80">
              <ChevronRight size={16} />
            </button>
          </div>
          <Button size="sm" variant="secondary" onClick={exportar}>
            <Download size={14} className="mr-1" /> CSV
          </Button>
        </div>

        <div className="rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-3 mb-3">
          <label className="text-primary-foreground/70 text-xs">Valor padrão da mensalidade</label>
          <div className="flex gap-2 mt-1">
            <Input
              type="number"
              step="0.01"
              defaultValue={valorPadrao || ""}
              onBlur={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v !== valorPadrao) void salvarValorPadrao(v);
              }}
              className="bg-background"
            />
            <span className="text-primary-foreground/60 text-xs self-center">R$</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl bg-primary-foreground/10" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {alunos.map((a) => {
              const m = mens[a.id];
              const status = m?.status ?? "pendente";
              const valor = m?.valor ?? valorPadrao;
              return (
                <div key={a.id} className="rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-primary-foreground font-medium text-sm">{a.nome}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      status === "pago" ? "bg-green-500/20 text-green-300"
                      : status === "atrasado" ? "bg-destructive/30 text-destructive-foreground"
                      : "bg-primary-foreground/15 text-primary-foreground/80"
                    }`}>{status.toUpperCase()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={valor || ""}
                      placeholder="Valor"
                      onBlur={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v) && v !== valor) void upsert(a, { valor: v });
                      }}
                      className="bg-background h-9 text-xs"
                    />
                    <Select
                      value={status}
                      onValueChange={(v) =>
                        upsert(a, {
                          status: v,
                          data_pagamento: v === "pago" ? new Date().toISOString().slice(0, 10) : null,
                        })
                      }
                    >
                      <SelectTrigger className="bg-background h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={m?.forma_pagamento ?? ""}
                      onValueChange={(v) => upsert(a, { forma_pagamento: v })}
                    >
                      <SelectTrigger className="bg-background h-9 text-xs"><SelectValue placeholder="Forma" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">Pix</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-primary-foreground/50 text-[10px] mt-1">
                    {formatBRL(valor)} · {m?.data_pagamento ? `Pago em ${m.data_pagamento}` : "Sem pagamento"}
                  </p>
                </div>
              );
            })}
            {alunos.length === 0 && (
              <p className="text-primary-foreground/60 text-sm text-center py-8">Nenhum aluno cadastrado.</p>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Mensalidades;