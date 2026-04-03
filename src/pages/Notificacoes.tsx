import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Bell, Send, Users, User, Award, Building, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FAIXAS } from "@/lib/constants";

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  destinatario_tipo: string;
  destinatario_filtro: Record<string, string> | null;
  created_at: string;
}

interface Aluno {
  id: string;
  nome: string;
  faixa: string;
  unidade_id: string;
}

interface Unidade {
  id: string;
  nome: string;
}

const TIPOS = [
  { value: "geral", label: "Aviso Geral", icon: Bell },
  { value: "evento", label: "Evento", icon: Users },
  { value: "aula", label: "Nova Aula", icon: Award },
  { value: "urgente", label: "Urgente", icon: Send },
];

const Notificacoes = () => {
  const { usuario } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState("geral");
  const [destinatarioTipo, setDestinatarioTipo] = useState("todos");
  const [selectedAluno, setSelectedAluno] = useState("");
  const [selectedFaixa, setSelectedFaixa] = useState("");
  const [selectedUnidade, setSelectedUnidade] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [notifRes, alunosRes, unidadesRes] = await Promise.all([
        supabase.from("notificacoes").select("*").order("created_at", { ascending: false }),
        supabase.from("usuarios").select("id, nome, faixa, unidade_id").eq("role", "aluno"),
        supabase.from("unidades").select("id, nome").order("nome"),
      ]);
      if (notifRes.error) throw notifRes.error;
      if (alunosRes.error) throw alunosRes.error;
      if (unidadesRes.error) throw unidadesRes.error;
      setNotificacoes((notifRes.data as Notificacao[]) || []);
      setAlunos((alunosRes.data as Aluno[]) || []);
      setUnidades((unidadesRes.data as Unidade[]) || []);
    } catch {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitulo("");
    setMensagem("");
    setTipo("geral");
    setDestinatarioTipo("todos");
    setSelectedAluno("");
    setSelectedFaixa("");
    setSelectedUnidade("");
  };

  const handleSend = async () => {
    if (!titulo.trim() || !mensagem.trim() || !usuario) return;

    // Validate filter selection
    if (destinatarioTipo === "aluno" && !selectedAluno) {
      toast.error("Selecione o aluno destinatário.");
      return;
    }
    if (destinatarioTipo === "faixa" && !selectedFaixa) {
      toast.error("Selecione a faixa destinatária.");
      return;
    }
    if (destinatarioTipo === "unidade" && !selectedUnidade) {
      toast.error("Selecione a academia destinatária.");
      return;
    }

    let filtro: Record<string, string> | null = null;
    if (destinatarioTipo === "aluno" && selectedAluno) {
      filtro = { aluno_id: selectedAluno };
    } else if (destinatarioTipo === "faixa" && selectedFaixa) {
      filtro = { faixa: selectedFaixa };
    } else if (destinatarioTipo === "unidade" && selectedUnidade) {
      filtro = { unidade_id: selectedUnidade };
    }

    setSending(true);
    try {
      const { error } = await supabase.from("notificacoes").insert({
        titulo: titulo.trim(),
        mensagem: mensagem.trim(),
        tipo,
        professor_id: usuario.id,
        destinatario_tipo: destinatarioTipo,
        destinatario_filtro: filtro,
      });

      if (error) throw error;

      toast.success("Notificação enviada!");
      setShowDialog(false);
      resetForm();
      fetchData();
    } catch {
      toast.error("Erro ao enviar notificação.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta notificação?")) return;
    try {
      const { error } = await supabase.from("notificacoes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Notificação excluída.");
      fetchData();
    } catch {
      toast.error("Erro ao excluir notificação.");
    }
  };

  const getDestinatarioLabel = (n: Notificacao) => {
    if (n.destinatario_tipo === "todos") return "Todos os alunos";
    if (n.destinatario_tipo === "aluno") {
      const aluno = alunos.find((a) => a.id === n.destinatario_filtro?.aluno_id);
      return aluno ? aluno.nome : "Aluno específico";
    }
    if (n.destinatario_tipo === "faixa") return `Faixa ${n.destinatario_filtro?.faixa}`;
    if (n.destinatario_tipo === "unidade") {
      const unidade = unidades.find((u) => u.id === n.destinatario_filtro?.unidade_id);
      return unidade ? `Dojo ${unidade.nome}` : "Unidade";
    }
    return "—";
  };

  const getTipoIcon = (t: string) => {
    const found = TIPOS.find((x) => x.value === t);
    return found ? found.icon : Bell;
  };

  return (
    <MobileLayout showBrush={false} showNav={true} fullWidth={true}>
      <PageHeader title="Notificações" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-24 bg-dojo-paper">
        <div className="px-4 pt-4 space-y-3">
          <button
            onClick={() => setShowDialog(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-primary-foreground font-bold text-sm shadow-lg transition-all active:scale-95"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          >
            <Send size={18} />
            Nova Notificação
          </button>

          {loadingData ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-full h-20 rounded-xl" />)}
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="dojo-card text-center py-8">
              <Bell size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">Nenhuma notificação enviada.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notificacoes.map((n, i) => {
                const Icon = getTipoIcon(n.tipo);
                return (
                  <div
                    key={n.id}
                    className="dojo-card animate-fade-in"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: n.tipo === "urgente" ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}
                      >
                        <Icon size={18} className="text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-bold text-foreground text-sm">{n.titulo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.mensagem}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                            {getDestinatarioLabel(n)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(n.created_at), "dd/MM · HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) { setShowDialog(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-md bg-background max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Nova Notificação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {TIPOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Título</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Treino especial sábado" />
            </div>

            <div>
              <Label>Mensagem</Label>
              <Textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Escreva a mensagem..." rows={3} />
            </div>

            <div>
              <Label>Enviar para</Label>
              <Select value={destinatarioTipo} onValueChange={(v) => { setDestinatarioTipo(v); setSelectedAluno(""); setSelectedFaixa(""); setSelectedUnidade(""); }}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="todos">
                    <span className="flex items-center gap-2"><Users size={14} /> Todos os Alunos</span>
                  </SelectItem>
                  <SelectItem value="unidade">
                    <span className="flex items-center gap-2"><Building size={14} /> Por Academia</span>
                  </SelectItem>
                  <SelectItem value="faixa">
                    <span className="flex items-center gap-2"><Award size={14} /> Por Faixa</span>
                  </SelectItem>
                  <SelectItem value="aluno">
                    <span className="flex items-center gap-2"><User size={14} /> Aluno Específico</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {destinatarioTipo === "unidade" && (
              <div>
                <Label>Academia</Label>
                <Select value={selectedUnidade} onValueChange={setSelectedUnidade}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {unidades.map((u) => (
                      <SelectItem key={u.id} value={u.id}>Dojo {u.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {destinatarioTipo === "faixa" && (
              <div>
                <Label>Faixa</Label>
                <Select value={selectedFaixa} onValueChange={setSelectedFaixa}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {FAIXAS.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {destinatarioTipo === "aluno" && (
              <div>
                <Label>Aluno</Label>
                <Select value={selectedAluno} onValueChange={setSelectedAluno}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {alunos.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending || !titulo.trim() || !mensagem.trim()}
              className="dojo-btn w-full text-sm disabled:opacity-50"
            >
              {sending ? "Enviando..." : "Enviar Notificação"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Notificacoes;
