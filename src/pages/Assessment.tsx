import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { Save } from "lucide-react";
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
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedAluno, setSelectedAluno] = useState<string>("");
  const [avaliacoes, setAvaliacoes] = useState<Record<string, StatusType>>({});
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedNome = alunos.find(a => a.id === selectedAluno)?.nome || "";

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
      const { data: existing } = await supabase
        .from("avaliacoes")
        .select("id")
        .eq("aluno_id", selectedAluno)
        .eq("tecnica", tecnica)
        .maybeSingle();

      if (existing) {
        await supabase.from("avaliacoes").update({ status, observacoes } as any).eq("id", existing.id);
      } else {
        await supabase.from("avaliacoes").insert({ aluno_id: selectedAluno, tecnica, status, observacoes } as any);
      }
    }

    setSaving(false);
    toast.success("Avaliação salva com sucesso!");
  };

  const radioOptions: { value: StatusType; label: string; dot: string }[] = [
    { value: "aprovado", label: "Aprovado", dot: "bg-dojo-green" },
    { value: "acompanhamento", label: "Em Acompanhamento", dot: "bg-dojo-yellow" },
    { value: "nao_iniciado", label: "Reprovado", dot: "bg-dojo-red-status" },
  ];

  return (
    <MobileLayout showBrush={true}>
      <PageHeader
        title={selectedNome ? `Avaliar ${selectedNome}` : "Avaliação Técnica"}
        showBack={true}
      />

      <div className="flex-1 overflow-y-auto pb-20 bg-dojo-paper">
        <div className="px-5 pt-5">
          {/* Select Aluno */}
          <div className="mb-5">
            <select
              value={selectedAluno}
              onChange={(e) => setSelectedAluno(e.target.value)}
              className="w-full py-3 px-4 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            >
              <option value="">Escolha um aluno...</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>{a.nome} — {a.faixa}</option>
              ))}
            </select>
          </div>

          {/* Techniques with radio buttons */}
          <div className="space-y-4 mb-5">
            {TECNICAS.map((tecnica) => (
              <div key={tecnica} className="dojo-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${
                    avaliacoes[tecnica] === "aprovado" ? "bg-dojo-green" :
                    avaliacoes[tecnica] === "acompanhamento" ? "bg-dojo-yellow" :
                    "bg-dojo-red-status"
                  }`} />
                  <p className="font-serif font-bold text-foreground text-sm">{tecnica}</p>
                </div>
                <div className="space-y-2 pl-1">
                  {radioOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => setAvaliacoes((prev) => ({ ...prev, [tecnica]: opt.value }))}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        avaliacoes[tecnica] === opt.value ? "border-primary" : "border-border"
                      }`}>
                        {avaliacoes[tecnica] === opt.value && (
                          <div className={`w-3 h-3 rounded-full ${opt.dot}`} />
                        )}
                      </div>
                      <span className="text-sm text-foreground">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Observations */}
          <div className="mb-5">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Observação:</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              placeholder="Bom progresso!"
              className="w-full py-2.5 px-4 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <button onClick={handleSave} disabled={saving} className="dojo-btn w-full mb-6">
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
