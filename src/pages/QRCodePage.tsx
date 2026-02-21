import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import QRCode from "react-qr-code";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QRCodePage = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const createAula = async () => {
      if (!usuario) return;
      const newToken = crypto.randomUUID();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 60 min

      await supabase.from("aulas").insert({
        professor_id: usuario.id,
        unidade_id: usuario.unidade_id,
        token: newToken,
        expires_at: expiresAt.toISOString(),
      } as any);

      setToken(newToken);
      setDate(now.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }));
    };

    createAula();
  }, [usuario]);

  return (
    <MobileLayout showBrush={true}>
      <div className="flex-1 flex flex-col px-5 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-foreground mb-6">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="dojo-card w-full max-w-sm p-8 flex flex-col items-center gap-6 animate-fade-in">
            <h2 className="font-serif font-bold text-xl text-foreground">Aula Aberta</h2>

            {token ? (
              <div className="bg-card p-4 rounded-xl border border-border">
                <QRCode value={token} size={200} />
              </div>
            ) : (
              <div className="w-[200px] h-[200px] bg-muted rounded-xl animate-pulse" />
            )}

            <p className="text-sm text-muted-foreground text-center">
              Escaneie para marcar presença
            </p>
            <p className="text-xs text-muted-foreground text-center capitalize">{date}</p>
            <p className="text-xs text-muted-foreground/60">
              Válido por 60 minutos
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default QRCodePage;
