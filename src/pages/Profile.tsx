import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import shizenLogo from "@/assets/shizen-logo.png";
import { LogOut } from "lucide-react";

const Profile = () => {
  const { usuario, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <MobileLayout showBrush={true}>
      <PageHeader title="Perfil" showBack={false} />

      <div className="flex-1 overflow-y-auto pb-20 bg-dojo-paper">
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

          <button onClick={handleSignOut} className="dojo-btn w-full mt-4">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>

      <BottomNav role={usuario?.role === "professor" ? "professor" : "aluno"} />
    </MobileLayout>
  );
};

export default Profile;
