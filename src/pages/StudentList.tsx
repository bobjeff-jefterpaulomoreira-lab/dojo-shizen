import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";


interface Aluno {
  id: string;
  nome: string;
  faixa: string;
  progresso_faixa: number;
}

const StudentList = () => {
  const { usuario } = useAuth();
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
    <MobileLayout showBrush={true} showNav={true} fullWidth={true}>
      <PageHeader title="Alunos" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-20 bg-dojo-paper">
        <div className="px-5 pt-5">
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
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-serif font-bold text-foreground text-sm">{a.nome}</p>
                      <p className="text-[10px] text-muted-foreground">Faixa: {a.faixa}</p>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{a.progresso_faixa}%</span>
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

      
    </MobileLayout>
  );
};

export default StudentList;
