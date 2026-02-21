import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Aluno {
  id: string;
  nome: string;
  faixa: string;
  progresso_faixa: number;
}

const StudentList = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  useEffect(() => {
    const fetch = async () => {
      if (!usuario) return;
      const { data } = await supabase
        .from("usuarios")
        .select("id, nome, faixa, progresso_faixa")
        .eq("role", "aluno")
        .eq("unidade_id", usuario.unidade_id);
      setAlunos((data as Aluno[]) || []);
    };
    fetch();
  }, [usuario]);

  return (
    <MobileLayout showBrush={true}>
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-5 pt-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-foreground mb-4">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          <div className="flex items-center gap-2 mb-6">
            <Users className="text-primary" size={24} />
            <h1 className="text-2xl font-serif font-bold text-foreground">Alunos</h1>
          </div>

          {alunos.length === 0 ? (
            <div className="dojo-card text-center py-8">
              <p className="text-muted-foreground text-sm">Nenhum aluno cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alunos.map((a, i) => (
                <div
                  key={a.id}
                  className="dojo-card animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-serif font-bold text-foreground">{a.nome}</p>
                      <p className="text-xs text-muted-foreground">Faixa: {a.faixa}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">{a.progresso_faixa}%</span>
                    </div>
                  </div>
                  <div className="progress-bar-track mt-2">
                    <div className="progress-bar-fill" style={{ width: `${a.progresso_faixa}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav role="professor" />
    </MobileLayout>
  );
};

export default StudentList;
