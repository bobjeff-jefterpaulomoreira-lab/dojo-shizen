import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Plus, Calendar, Pencil, Trash2, Image, FileText, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Comunicado {
  id: string;
  professor_id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  data_evento: string | null;
  imagem_url: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

const TIPOS = ["Aviso Geral", "Evento", "Avaliação", "Treino Especial"];

const tipoBadgeColor: Record<string, string> = {
  "Aviso Geral": "bg-muted text-foreground",
  "Evento": "bg-emerald-600 text-white",
  "Avaliação": "bg-amber-500 text-white",
  "Treino Especial": "bg-blue-600 text-white",
};

const Comunicados = () => {
  const { usuario } = useAuth();
  const isProfessor = usuario?.role === "professor";

  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Comunicado | null>(null);

  // Form state
  const [tipo, setTipo] = useState("Aviso Geral");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComunicados = async () => {
    try {
      const { data, error } = await supabase
        .from("comunicados")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setComunicados((data as Comunicado[]) || []);
    } catch {
      toast.error("Erro ao carregar comunicados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComunicados();
  }, []);

  const resetForm = () => {
    setTipo("Aviso Geral");
    setTitulo("");
    setDescricao("");
    setDataEvento("");
    setImagemFile(null);
    setPdfFile(null);
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (c: Comunicado) => {
    setEditing(c);
    setTipo(c.tipo);
    setTitulo(c.titulo);
    setDescricao(c.descricao || "");
    setDataEvento(c.data_evento ? c.data_evento.slice(0, 16) : "");
    setImagemFile(null);
    setPdfFile(null);
    setDialogOpen(true);
  };

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("comunicados").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("comunicados").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toast.error("Título obrigatório");
      return;
    }
    setSubmitting(true);
    try {
      let imagem_url = editing?.imagem_url || null;
      let pdf_url = editing?.pdf_url || null;

      if (imagemFile) imagem_url = await uploadFile(imagemFile, "imagens");
      if (pdfFile) pdf_url = await uploadFile(pdfFile, "pdfs");

      const payload = {
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        data_evento: dataEvento ? new Date(dataEvento).toISOString() : null,
        imagem_url,
        pdf_url,
      };

      if (editing) {
        const { error } = await supabase
          .from("comunicados")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Comunicado atualizado!");
      } else {
        const { error } = await supabase
          .from("comunicados")
          .insert({ ...payload, professor_id: usuario!.id });
        if (error) throw error;
        toast.success("Comunicado publicado!");
      }

      setDialogOpen(false);
      resetForm();
      fetchComunicados();
    } catch (err) {
      toast.error("Erro ao salvar comunicado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este comunicado?")) return;
    try {
      const { error } = await supabase.from("comunicados").delete().eq("id", id);
      if (error) throw error;
      toast.success("Comunicado excluído");
      fetchComunicados();
    } catch {
      toast.error("Erro ao excluir comunicado.");
    }
  };

  const eventos = comunicados.filter((c) => c.tipo === "Evento" && c.data_evento);
  const recentes = comunicados.filter((c) => c.tipo !== "Evento" || !c.data_evento);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <MobileLayout showBrush={true} showNav={true} fullWidth={true}>
      <PageHeader title="Comunicados do Dojo" subtitle="Fique por dentro dos eventos e avisos" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-24" style={{ backgroundColor: "hsl(var(--dojo-paper))" }}>
        <div className="px-4 md:px-8 pt-4 max-w-3xl mx-auto">
          {isProfessor && (
            <button
              onClick={openCreate}
              disabled={submitting}
              className="dojo-btn w-full text-sm mb-6"
            >
              <Plus size={18} />
              Novo Comunicado
            </button>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="w-full h-28 rounded-xl" />)}
            </div>
          ) : (
            <>
              {eventos.length > 0 && (
                <section className="mb-8">
                  <h2 className="font-serif font-bold text-foreground flex items-center gap-2 mb-4 text-base">
                    <Calendar size={18} className="text-primary" />
                    Próximos Eventos
                  </h2>
                  <div className="space-y-3">
                    {eventos.map((c) => (
                      <ComunicadoCard
                        key={c.id}
                        comunicado={c}
                        isProfessor={isProfessor}
                        onEdit={() => openEdit(c)}
                        onDelete={() => handleDelete(c.id)}
                        formatDate={formatDate}
                        variant="evento"
                      />
                    ))}
                  </div>
                </section>
              )}

              <section className="mb-8">
                <h2 className="font-serif font-bold text-foreground flex items-center gap-2 mb-4 text-base">
                  <Bell size={18} className="text-primary" />
                  Comunicados Recentes
                </h2>
                {recentes.length === 0 ? (
                  <div className="dojo-card text-center py-10">
                    <Bell size={36} className="mx-auto text-muted-foreground/40 mb-3" />
                    <p className="font-serif font-bold text-foreground text-sm mb-1">Nenhum comunicado</p>
                    <p className="text-muted-foreground text-xs">
                      Os comunicados e avisos do dojo aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentes.map((c) => (
                      <ComunicadoCard
                        key={c.id}
                        comunicado={c}
                        isProfessor={isProfessor}
                        onEdit={() => openEdit(c)}
                        onDelete={() => handleDelete(c.id)}
                        formatDate={formatDate}
                        variant="recente"
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-md bg-background">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing ? "Editar Comunicado" : "Criar Comunicado"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Título</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do comunicado" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes do comunicado..." rows={4} />
            </div>
            {(tipo === "Evento" || tipo === "Treino Especial") && (
              <div>
                <Label>Data e Hora</Label>
                <Input type="datetime-local" value={dataEvento} onChange={(e) => setDataEvento(e.target.value)} />
              </div>
            )}
            <div>
              <Label>Anexos</Label>
              <div className="flex gap-3 mt-1">
                <label className="flex-1 dojo-card flex flex-col items-center justify-center py-4 cursor-pointer hover:border-primary/50 transition-colors">
                  <Image size={22} className="text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Imagem</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setImagemFile(e.target.files?.[0] || null)} />
                  {imagemFile && <span className="text-[10px] text-primary mt-1 truncate max-w-full px-2">{imagemFile.name}</span>}
                </label>
                <label className="flex-1 dojo-card flex flex-col items-center justify-center py-4 cursor-pointer hover:border-primary/50 transition-colors">
                  <FileText size={22} className="text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">PDF</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                  {pdfFile && <span className="text-[10px] text-primary mt-1 truncate max-w-full px-2">{pdfFile.name}</span>}
                </label>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="dojo-btn w-full text-sm disabled:opacity-50"
            >
              {submitting ? "Publicando..." : editing ? "Salvar Alterações" : "Publicar Comunicado"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

interface ComunicadoCardProps {
  comunicado: Comunicado;
  isProfessor: boolean;
  onEdit: () => void;
  onDelete: () => void;
  formatDate: (d: string) => string;
  variant: "evento" | "recente";
}

const ComunicadoCard = ({ comunicado, isProfessor, onEdit, onDelete, formatDate, variant }: ComunicadoCardProps) => {
  const iconBg = variant === "evento" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-primary";

  return (
    <div className="dojo-card flex gap-3 relative border-l-4" style={{ borderLeftColor: variant === "evento" ? "hsl(var(--dojo-green))" : "hsl(var(--primary))" }}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {variant === "evento" ? <Calendar size={20} /> : <Bell size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tipoBadgeColor[comunicado.tipo] || "bg-muted text-foreground"}`}>
            {comunicado.tipo}
          </span>
        </div>
        <p className="font-serif font-bold text-foreground text-sm leading-tight">{comunicado.titulo}</p>
        {comunicado.data_evento && (
          <p className="text-xs text-primary mt-0.5">{formatDate(comunicado.data_evento)}</p>
        )}
        {!comunicado.data_evento && (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {format(new Date(comunicado.created_at), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        )}
        {comunicado.descricao && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{comunicado.descricao}</p>
        )}
        <div className="flex gap-2 mt-2">
          {comunicado.imagem_url && (
            <a href={comunicado.imagem_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs border rounded-md px-2 py-1 hover:bg-muted transition-colors">
              <Image size={14} /> Ver Imagem
            </a>
          )}
          {comunicado.pdf_url && (
            <a href={comunicado.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs border rounded-md px-2 py-1 hover:bg-muted transition-colors">
              <FileText size={14} /> Ver PDF
            </a>
          )}
        </div>
      </div>
      {isProfessor && (
        <div className="flex flex-col gap-1 shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <Pencil size={16} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Comunicados;
