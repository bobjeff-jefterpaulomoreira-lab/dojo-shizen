import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Search, UserPlus, Pencil, Trash2, X, Check, ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  faixa: string;
  progresso_faixa: number;
  unidade_id: string;
}

interface Unidade {
  id: string;
  nome: string;
}

const FAIXAS = ["Todos", "Branca", "Laranja", "Azul", "Amarela", "Vermelha", "Verde", "Marrom", "Preta"];

const FAIXA_COLORS: Record<string, string> = {
  Branca: "#FFFFFF",
  Laranja: "#FF8C00",
  Azul: "#1E90FF",
  Amarela: "#FFD700",
  Vermelha: "#DC143C",
  Verde: "#228B22",
  Marrom: "#8B4513",
  Preta: "#1a1a1a",
};

const StudentList = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [selectedUnidade, setSelectedUnidade] = useState<string>("todos");
  const [selectedFaixa, setSelectedFaixa] = useState("Todos");
  const [search, setSearch] = useState("");

  // Edit state
  const [editDialog, setEditDialog] = useState(false);
  const [editAluno, setEditAluno] = useState<Aluno | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editFaixa, setEditFaixa] = useState("");
  const [editUnidade, setEditUnidade] = useState("");
  const [editProgresso, setEditProgresso] = useState(0);
  const [saving, setSaving] = useState(false);

  // Transfer state
  const [transferDialog, setTransferDialog] = useState(false);
  const [transferAluno, setTransferAluno] = useState<Aluno | null>(null);
  const [transferUnidade, setTransferUnidade] = useState("");

  const fetchData = async () => {
    if (!usuario) return;

    const { data: unidadesData } = await supabase
      .from("unidades")
      .select("id, nome")
      .order("nome");
    setUnidades((unidadesData as Unidade[]) || []);

    const { data: alunosData } = await supabase
      .from("usuarios")
      .select("id, nome, email, faixa, progresso_faixa, unidade_id")
      .eq("role", "aluno");
    setAlunos((alunosData as Aluno[]) || []);
  };

  useEffect(() => {
    fetchData();
  }, [usuario]);

  const filtered = alunos.filter((a) => {
    if (selectedUnidade !== "todos" && a.unidade_id !== selectedUnidade) return false;
    if (selectedFaixa !== "Todos" && a.faixa !== selectedFaixa) return false;
    if (search && !a.nome.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getUnidadeNome = (uid: string) => unidades.find((u) => u.id === uid)?.nome || "";

  const openEdit = (a: Aluno) => {
    setEditAluno(a);
    setEditNome(a.nome);
    setEditFaixa(a.faixa);
    setEditUnidade(a.unidade_id);
    setEditProgresso(a.progresso_faixa);
    setEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editAluno || !editNome.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("usuarios")
      .update({
        nome: editNome.trim(),
        faixa: editFaixa,
        unidade_id: editUnidade,
        progresso_faixa: editProgresso,
      })
      .eq("id", editAluno.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Dados do aluno atualizados!");
      setEditDialog(false);
      fetchData();
    }
  };

  const handleDelete = async (aluno: Aluno) => {
    if (!confirm(`Deseja realmente excluir o aluno ${aluno.nome}?`)) return;
    const { error } = await supabase.from("usuarios").delete().eq("id", aluno.id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
    } else {
      toast.success("Aluno excluído.");
      fetchData();
    }
  };

  return (
    <MobileLayout showBrush={false} showNav={true} fullWidth={true}>
      <PageHeader title="Alunos" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-20 bg-dojo-paper">
        <div className="px-4 pt-4 space-y-3">
          {/* Unit tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedUnidade("todos")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedUnidade === "todos"
                  ? "text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground"
              }`}
              style={selectedUnidade === "todos" ? { backgroundColor: "hsl(var(--primary))" } : {}}
            >
              Todas Unidades
            </button>
            {unidades.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUnidade(u.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedUnidade === u.id
                    ? "text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground"
                }`}
                style={selectedUnidade === u.id ? { backgroundColor: "hsl(var(--primary))" } : {}}
              >
                Dojo {u.nome}
              </button>
            ))}
          </div>

          {/* Register button */}
          <button
            onClick={() => navigate("/sensei/cadastrar-aluno", { state: { unidade_id: selectedUnidade !== "todos" ? selectedUnidade : undefined } })}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-primary-foreground font-bold text-sm shadow-lg transition-all active:scale-95"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          >
            <UserPlus size={18} />
            Cadastrar Novo Aluno
          </button>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Belt filter - horizontal scroll */}
          <div className="overflow-x-auto scrollbar-thin pb-1">
            <div className="flex gap-2 min-w-max">
              {FAIXAS.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFaixa(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedFaixa === f
                      ? "text-primary-foreground shadow"
                      : "bg-muted text-muted-foreground"
                  }`}
                  style={selectedFaixa === f ? { backgroundColor: "hsl(var(--primary))" } : {}}
                >
                  {f !== "Todos" && (
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-border/30"
                      style={{ backgroundColor: FAIXA_COLORS[f] }}
                    />
                  )}
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Student list */}
          {filtered.length === 0 ? (
            <div className="dojo-card text-center py-8">
              <p className="text-muted-foreground text-sm">Nenhum aluno encontrado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((a, i) => (
                <div
                  key={a.id}
                  className="dojo-card animate-fade-in"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-foreground text-sm">{a.nome}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Dojo {getUnidadeNome(a.unidade_id)} · Faixa {a.faixa}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="w-3 h-3 rounded-full border border-border/30"
                        style={{ backgroundColor: FAIXA_COLORS[a.faixa] || "#999" }}
                      />
                      <span className="text-xs text-muted-foreground font-medium">{a.progresso_faixa}%</span>
                      <button
                        onClick={() => openEdit(a)}
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground ml-1"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(a)}
                        className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${a.progresso_faixa}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={(open) => { if (!open) setEditDialog(false); }}>
        <DialogContent className="sm:max-w-md bg-background">
          <DialogHeader>
            <DialogTitle className="font-serif">Editar Aluno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Nome</Label>
              <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} />
            </div>
            <div>
              <Label>Faixa</Label>
              <Select value={editFaixa} onValueChange={setEditFaixa}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {FAIXAS.filter((f) => f !== "Todos").map((f) => (
                    <SelectItem key={f} value={f}>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FAIXA_COLORS[f] }} />
                        {f}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unidade</Label>
              <Select value={editUnidade} onValueChange={setEditUnidade}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {unidades.map((u) => (
                    <SelectItem key={u.id} value={u.id}>Dojo {u.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Progresso da Faixa (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={editProgresso}
                onChange={(e) => setEditProgresso(Number(e.target.value))}
              />
            </div>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="dojo-btn w-full text-sm"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default StudentList;
