import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { LogOut, User } from "lucide-react";

const Profile = () => {
  const { usuario, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <MobileLayout showBrush={true}>
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-5 pt-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4">
              <User className="text-primary-foreground" size={36} />
            </div>
            <h1 className="text-xl font-serif font-bold text-foreground">{usuario?.nome}</h1>
            <p className="text-sm text-muted-foreground">{usuario?.email}</p>
            <span className="mt-2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full capitalize">
              {usuario?.role === "professor" ? "🥋 Sensei" : "🥋 Aluno"}
            </span>
          </div>

          <div className="dojo-card mb-4">
            <p className="text-sm text-muted-foreground">Faixa</p>
            <p className="font-serif font-bold text-foreground">{usuario?.faixa}</p>
          </div>

          <div className="dojo-card mb-4">
            <p className="text-sm text-muted-foreground">Progresso</p>
            <div className="progress-bar-track mt-2">
              <div className="progress-bar-fill" style={{ width: `${usuario?.progresso_faixa || 0}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">{usuario?.progresso_faixa || 0}%</p>
          </div>

          <button onClick={handleSignOut} className="dojo-btn w-full mt-6">
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
