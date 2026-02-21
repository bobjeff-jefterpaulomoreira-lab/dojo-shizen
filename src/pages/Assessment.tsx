import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TECNICAS = ["Mae Geri", "Soto Uke", "Mawashi Geri"];
type StatusType = "aprovado" | "acompanhamento" | "nao_iniciado";

interface Aluno {
  id: string;
  nome: string;
  faixa: string;
}

const Assessment = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedAluno, setSelectedAluno] = useState<string>("");
  const [avaliacoes, setAvaliacoes] = useState<Record<string, StatusType>>({});
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAlunos = async () => {
      if (!usuario) return;
      const { data } = await supabase
        .from("usuarios")
        .select("id, nome, faixa")
        .eq("role", "aluno")
        .eq("unidade_id", usuario.unidade_id);
      setAlunos((data as Aluno[]) || []);
    };
    fetchAlunos();
  }, [usuario]);

  const handleSave = async () => {
    if (!selectedAluno) {
      toast.error("Selecione um aluno");
      return;
    }
    setSaving(true);

    for (const tecnica of TECNICAS) {
      const status = avaliacoes[tecnica] || "nao_iniciado";
      // Upsert: check if exists
      const { data: existing } = await supabase
        .from("avaliacoes")
        .select("id")
        .eq("aluno_id", selectedAluno)
        .eq("tecnica", tecnica)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("avaliacoes")
          .update({ status, observacoes } as any)
          .eq("id", existing.id);
      } else {
        await supabase
          .from("avaliacoes")
          .insert({ aluno_id: selectedAluno, tecnica, status, observacoes } as any);
      }
    }

    setSaving(false);
    toast.success("Avaliação salva com sucesso!");
  };

  const statusOptions: { value: StatusType; label: string; color: string }[] = [
    { value: "aprovado", label: "Aprovado", color: "bg-dojo-green" },
    { value: "acompanhamento", label: "Acompanhamento", color: "bg-dojo-yellow" },
    { value: "nao_iniciado", label: "Não Iniciado", color: "bg-dojo-red-status" },
  ];

  return (
    <MobileLayout showBrush={true}>
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-5 pt-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-foreground mb-4">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          <h1 className="text-2xl font-serif font-bold text-foreground mb-6">
            Avaliação Técnica
          </h1>

          {/* Select Aluno */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Selecionar Aluno</label>
            <select
              value={selectedAluno}
              onChange={(e) => setSelectedAluno(e.target.value)}
              className="w-full py-3 px-4 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Escolha um aluno...</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} — {a.faixa}
                </option>
              ))}
            </select>
          </div>

          {/* Techniques */}
          <div className="space-y-4 mb-6">
            {TECNICAS.map((tecnica) => (
              <div key={tecnica} className="dojo-card">
                <p className="font-serif font-bold text-foreground mb-3">{tecnica}</p>
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setAvaliacoes((prev) => ({ ...prev, [tecnica]: opt.value }))
                      }
                      className={`text-xs font-bold px-3 py-2 rounded-full border-2 transition-all ${
                        avaliacoes[tecnica] === opt.value
                          ? `${opt.color} text-white border-transparent scale-105`
                          : "bg-card text-foreground border-border"
                      }`}
                    >
                      {opt.value === "aprovado" && "🟢 "}
                      {opt.value === "acompanhamento" && "🟡 "}
                      {opt.value === "nao_iniciado" && "🔴 "}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Observations */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Adicione observações..."
              className="w-full py-3 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="dojo-btn w-full mb-6"
          >
            <Save size={18} />
            {saving ? "Salvando..." : "Salvar Avaliação"}
          </button>
        </div>
      </div>

      <BottomNav role="professor" />
    </MobileLayout>
  );
};

export default Assessment;
