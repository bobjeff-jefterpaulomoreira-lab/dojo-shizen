import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import shizenLogo from "@/assets/shizen-logo.png";
import { LogOut, FileText, Lock, Save } from "lucide-react";
import { useState } from "react";

const Profile = () => {
  const { usuario, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [novaSenha, setNovaSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaSenha || novaSenha.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    setSalvandoSenha(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvandoSenha(false);
    if (error) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setNovaSenha("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <MobileLayout showBrush={true} showNav={true} fullWidth={true}>
      <PageHeader title="Perfil" showBack={false} />

      <div className="flex-1 overflow-y-auto pb-24 bg-dojo-paper">
        <div className="px-5 pt-5">
          {/* Avatar area */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-3 shadow-md">
              <img src={shizenLogo} alt="" className="w-12 h-12 object-contain" />
            </div>
            <h2 className="text-lg font-serif font-bold text-foreground">{usuario?.nome}</h2>
            <p className="text-xs text-muted-foreground">{usuario?.email}</p>
            <span className="mt-2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full capitalize">
              {usuario?.role === "professor" ? "🥋 Sensei" : "🥋 Aluno"}
            </span>
          </div>

          <div className="dojo-card mb-3">
            <p className="text-xs text-muted-foreground">Faixa</p>
            <p className="font-serif font-bold text-foreground">{usuario?.faixa}</p>
          </div>

          <div className="dojo-card mb-3">
            <p className="text-xs text-muted-foreground mb-2">Progresso</p>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${usuario?.progresso_faixa || 0}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{usuario?.progresso_faixa || 0}%</p>
          </div>

          {usuario?.role === "aluno" && (
            <button
              onClick={() => navigate("/documentos")}
              className="dojo-card w-full flex items-center gap-3 py-3 px-4 mb-3"
            >
              <FileText size={18} className="text-primary" />
              <span className="font-medium text-foreground text-sm">Meus Documentos</span>
            </button>
          )}

          {usuario?.role === "professor" && (
            <form onSubmit={handleAlterarSenha} className="dojo-card mb-3">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={16} className="text-primary" />
                <span className="font-medium text-foreground text-sm">Alterar Senha</span>
              </div>
              <input
                type="password"
                placeholder="Nova senha (min. 6 caracteres)"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-3"
              />
              <button
                type="submit"
                disabled={salvandoSenha}
                className="dojo-btn w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {salvandoSenha ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          )}

          <button onClick={handleSignOut} className="dojo-btn w-full mt-1">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>

      
    </MobileLayout>
  );
};

export default Profile;
