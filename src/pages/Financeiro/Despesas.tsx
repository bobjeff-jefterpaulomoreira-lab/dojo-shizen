import { useEffect, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import karatekaBack from "@/assets/karateka-back.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { exportCSV, formatBRL } from "@/lib/financeiro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Plus, Trash2 } from "lucide-react";

interface Lanc {
  id: string;
  categoria: string;
  descricao: string | null;
  valor: number;
  data: string;
  tipo: string;
}

const Despesas = () => {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Lanc[]>([]);
  const [saving, setSaving] = useState(false);

  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = useState("despesa");

  const load = async () => {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from("despesas")
        .select("*")
        .order("data", { ascending: false })
        .limit(200);
      if (error) throw error;
      setItems((rows as Lanc[]) ?? []);
    } catch {
      toast.error("Erro ao carregar lançamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const adicionar = async () => {
    if (saving || !usuario) return;
    const v = parseFloat(valor);
    if (!categoria.trim() || isNaN(v)) {
      toast.error("Informe categoria e valor");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("despesas").insert({
        unidade_id: usuario.unidade_id,
        professor_id: usuario.id,
        categoria: categoria.trim(),
        descricao: descricao.trim() || null,
        valor: v,
        data,
        tipo,
      });
      if (error) throw error;
      setCategoria(""); setDescricao(""); setValor("");
      toast.success("Lançamento adicionado");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const remover = async (id: string) => {
    try {
      const { error } = await supabase.from("despesas").delete().eq("id", id);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao remover");
    }
  };

  const exportar = () => {
    exportCSV(
      "lancamentos.csv",
      items.map((i) => ({
        Data: i.data,
        Tipo: i.tipo,
        Categoria: i.categoria,
        Descricao: i.descricao ?? "",
        Valor: i.valor,
      })),
    );
  };

  return (
    <MobileLayout bgImage={karatekaBack} darkOverlay showBrush={false} showNav fullWidth>
      <div className="flex-1 px-4 md:px-[8%] pt-6 pb-24">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl md:text-2xl font-serif font-bold text-primary-foreground">
            Despesas & Receitas
          </h1>
          <Button size="sm" variant="secondary" onClick={exportar}>
            <Download size={14} className="mr-1" /> CSV
          </Button>
        </div>

        <div className="rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-3 mb-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="bg-background h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="receita_avulsa">Receita avulsa</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="bg-background h-9 text-xs" />
          </div>
          <Input placeholder="Categoria (Aluguel, Material…)" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="bg-background h-9 text-xs" />
          <Input placeholder="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="bg-background h-9 text-xs" />
          <div className="flex gap-2">
            <Input type="number" step="0.01" placeholder="Valor R$" value={valor} onChange={(e) => setValor(e.target.value)} className="bg-background h-9 text-xs" />
            <Button size="sm" onClick={adicionar} disabled={saving}>
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl bg-primary-foreground/10" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      i.tipo === "receita_avulsa" ? "bg-green-500/20 text-green-300" : "bg-destructive/20 text-destructive-foreground"
                    }`}>
                      {i.tipo === "receita_avulsa" ? "RECEITA" : "DESPESA"}
                    </span>
                    <p className="text-primary-foreground text-sm font-medium truncate">{i.categoria}</p>
                  </div>
                  {i.descricao && <p className="text-primary-foreground/60 text-xs truncate">{i.descricao}</p>}
                  <p className="text-primary-foreground/50 text-[10px]">{i.data}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-primary-foreground font-serif font-bold">{formatBRL(i.valor)}</p>
                  <button onClick={() => remover(i.id)} className="text-destructive/80 hover:text-destructive p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-primary-foreground/60 text-sm text-center py-8">Nenhum lançamento ainda.</p>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Despesas;