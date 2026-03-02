import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATEGORIAS = ["Todas", "Kihon", "Kata", "Kumite", "Idogeiko"];
type StatusType = "aprovado" | "acompanhamento" | "nao_iniciado";

const TECNICAS_POR_CATEGORIA: Record<string, string[]> = {
  Kihon: [
    "Mae Geri (Chute Frontal)",
    "Mawashi Geri (Chute Circular)",
    "Yoko Geri (Chute Lateral)",
    "Ushiro Geri (Chute para Trás)",
    "Soto Uke (Defesa Externa)",
    "Uchi Uke (Defesa Interna)",
    "Gedan Barai (Defesa Baixa)",
    "Age Uke (Defesa Alta)",
    "Seiken (Soco Básico)",
    "Uraken (Soco com Dorso)",
    "Shuto Uchi (Golpe com Mão Aberta)",
  ],
  Kata: [
    "Taikyoku Sono Ichi",
    "Taikyoku Sono Ni",
    "Taikyoku Sono San",
    "Pinan Sono Ichi",
    "Pinan Sono Ni",
    "Pinan Sono San",
    "Pinan Sono Yon",
    "Pinan Sono Go",
    "Sanchin",
    "Tensho",
    "Gekisai Dai",
    "Gekisai Sho",
  ],
  Kumite: [
    "Sanbon Kumite (3 passos)",
    "Ippon Kumite (1 passo)",
    "Jiyu Kumite (Luta Livre)",
    "Yakusoku Kumite (Combinado)",
    "Shiai Kumite (Competição)",
  ],
  Idogeiko: [
    "Ido Geiko Mae Geri",
    "Ido Geiko Mawashi Geri",
    "Ido Geiko Yoko Geri",
    "Ido Geiko Oi Tsuki",
    "Ido Geiko Gyaku Tsuki",
    "Ido Geiko Soto Uke",
    "Ido Geiko Uchi Uke",
    "Ido Geiko Gedan Barai",
    "Ido Geiko Combinações",
  ],
};

interface Aluno {
  id: string;
  nome: string;
  faixa: string;
}

interface Avaliacao {
  id: string;
  tecnica: string;
  status: string;
  observacoes: string | null;
  created_at: string;
  categoria?: string;
}

const BELT_COLORS: Record<string, string> = {
  branca: "#888",
  amarela: "#DAA520",
  vermelha: "#CC0000",
  laranja: "#FF8C00",
  azul: "#1E90FF",
  verde: "#228B22",
  marrom: "#8B4513",
  roxa: "#6A0DAD",
  preta: "#111",
};

const Assessment = () => {
  const { usuario } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedAluno, setSelectedAluno] = useState<string>("");
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Nova avaliação form
  const [novaTecnica, setNovaTecnica] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("Kihon");
  const [novoStatus, setNovoStatus] = useState<StatusType>("nao_iniciado");
  const [novaObs, setNovaObs] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedAlunoData = alunos.find((a) => a.id === selectedAluno);

  // Fetch ALL students (RLS already handles access)
  useEffect(() => {
    const fetchAlunos = async () => {
      if (!usuario) return;
      const { data } = await supabase
        .from("usuarios")
        .select("id, nome, faixa")
        .eq("role", "aluno")
        .order("nome");
      setAlunos((data as Aluno[]) || []);
      if (data && data.length > 0 && !selectedAluno) {
        setSelectedAluno(data[0].id);
      }
    };
    fetchAlunos();
  }, [usuario]);

  // Fetch avaliacoes for selected student
  useEffect(() => {
    const fetchAvaliacoes = async () => {
      if (!selectedAluno) return;
      const { data } = await supabase
        .from("avaliacoes")
        .select("*")
        .eq("aluno_id", selectedAluno)
        .order("created_at", { ascending: false });
      setAvaliacoes((data as Avaliacao[]) || []);
    };
    fetchAvaliacoes();
  }, [selectedAluno]);

  const alunosFiltrados = alunos.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const avaliacoesFiltradas = categoriaAtiva === "Todas"
    ? avaliacoes
    : avaliacoes.filter((av) => (av as any).categoria === categoriaAtiva || av.tecnica.toLowerCase().includes(categoriaAtiva.toLowerCase()));

  const handleNovaAvaliacao = async () => {
    if (!novaTecnica.trim()) {
      toast.error("Informe a técnica");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("avaliacoes").insert({
      aluno_id: selectedAluno,
      tecnica: novaTecnica,
      status: novoStatus,
      observacoes: novaObs || null,
    } as any);

    if (error) {
      toast.error("Erro ao salvar avaliação");
    } else {
      toast.success("Avaliação criada!");
      setShowModal(false);
      setNovaTecnica("");
      setNovaObs("");
      setNovoStatus("nao_iniciado");
      // Refresh
      const { data } = await supabase
        .from("avaliacoes")
        .select("*")
        .eq("aluno_id", selectedAluno)
        .order("created_at", { ascending: false });
      setAvaliacoes((data as Avaliacao[]) || []);
    }
    setSaving(false);
  };

  const statusColor = (s: string) => {
    if (s === "aprovado") return "bg-green-500";
    if (s === "acompanhamento") return "bg-yellow-500";
    return "bg-red-600";
  };

  const statusLabel = (s: string) => {
    if (s === "aprovado") return "Aprovado";
    if (s === "acompanhamento") return "Em Acompanhamento";
    return "Não Iniciado";
  };

  return (
    <MobileLayout showBrush={true} showNav={true} fullWidth={true}>
      <PageHeader title="Avalie o progresso técnico dos alunos" showBack={true} />

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-background">
        {/* Sidebar - Student List */}
        <div className="w-full md:w-[280px] md:min-w-[280px] border-r border-border bg-card flex flex-col md:h-full">
          <div className="px-4 pt-4 pb-2">
            <h3 className="font-bold text-foreground text-sm mb-3">Selecionar Aluno</h3>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-20 md:pb-4">
            {alunosFiltrados.map((a) => {
              const isSelected = a.id === selectedAluno;
              const beltKey = a.faixa.toLowerCase();
              const beltColor = BELT_COLORS[beltKey] || "#888";
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedAluno(a.id)}
                  className={`w-full text-left px-4 py-3 transition-colors border-l-4 ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-l-primary"
                      : "hover:bg-muted border-l-transparent"
                  }`}
                >
                  <p className={`font-semibold text-sm ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                    {a.nome}
                  </p>
                  <p className="text-xs" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : beltColor }}>
                    Faixa {a.faixa}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-4">
          <div className="p-5">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-lg">
                {selectedAlunoData?.nome || "Aluno"}
              </h2>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
              >
                <Plus size={16} />
                Nova Avaliação
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaAtiva(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    categoriaAtiva === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Avaliacoes list */}
            {avaliacoesFiltradas.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm">Nenhuma avaliação registrada</p>
                <p className="text-xs mt-1">Clique em "Nova Avaliação" para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {avaliacoesFiltradas.map((av) => (
                  <div key={av.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`w-3 h-3 rounded-full ${statusColor(av.status)}`} />
                      <p className="font-semibold text-foreground text-sm">{av.tecnica}</p>
                      <span className="ml-auto text-xs text-muted-foreground">{statusLabel(av.status)}</span>
                    </div>
                    {av.observacoes && (
                      <p className="text-xs text-muted-foreground mt-1 pl-6">{av.observacoes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nova Avaliação */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Avaliação — {selectedAlunoData?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoria</label>
              <select
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-border bg-background text-sm text-foreground"
              >
                {CATEGORIAS.filter((c) => c !== "Todas").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Técnica</label>
              <select
                value={novaTecnica}
                onChange={(e) => setNovaTecnica(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-border bg-background text-sm text-foreground"
              >
                <option value="">Selecione...</option>
                {(TECNICAS_POR_CATEGORIA[novaCategoria] || []).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <div className="flex gap-3">
                {[
                  { value: "aprovado" as StatusType, label: "Aprovado", color: "bg-green-500" },
                  { value: "acompanhamento" as StatusType, label: "Acompanhamento", color: "bg-yellow-500" },
                  { value: "nao_iniciado" as StatusType, label: "Não Iniciado", color: "bg-red-600" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNovoStatus(opt.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      novoStatus === opt.value ? "border-primary bg-primary/10" : "border-border"
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Observações</label>
              <textarea
                value={novaObs}
                onChange={(e) => setNovaObs(e.target.value)}
                rows={2}
                placeholder="Opcional..."
                className="w-full py-2 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>
            <button
              onClick={handleNovaAvaliacao}
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Avaliação"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Assessment;
