import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import QRCode from "react-qr-code";
import karatekaDojo from "@/assets/karateka-dojo.jpg";
import { Button } from "@/components/ui/button";
import { X, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QRCodePage = () => {
  const { usuario } = useAuth();
  const [token, setToken] = useState("");
  const [date, setDate] = useState("");
  const [aulaId, setAulaId] = useState("");
  const [aulaAtiva, setAulaAtiva] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const buscarOuCriarAula = async () => {
      if (!usuario) return;

      // Primeiro, busca uma aula ativa existente
      const { data: aulaExistente } = await supabase
        .from("aulas")
        .select("*")
        .eq("professor_id", usuario.id)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (aulaExistente) {
        // Usa aula existente
        setToken(aulaExistente.token);
        setAulaId(aulaExistente.id);
        setDate(new Date(aulaExistente.data).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }));
        setAulaAtiva(true);
      } else {
        // Cria nova aula
        const newToken = crypto.randomUUID();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

        const { data: novaAula } = await supabase.from("aulas").insert({
          professor_id: usuario.id,
          unidade_id: usuario.unidade_id,
          token: newToken,
          expires_at: expiresAt.toISOString(),
        }).select().single();

        if (novaAula) {
          setToken(newToken);
          setAulaId(novaAula.id);
          setDate(now.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }));
          setAulaAtiva(true);
        }
      }
    };

    buscarOuCriarAula();
  }, [usuario]);

  const fecharAula = async () => {
    if (!aulaId) return;

    const { error } = await supabase
      .from("aulas")
      .update({ expires_at: new Date().toISOString() })
      .eq("id", aulaId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fechar a aula",
        variant: "destructive",
      });
      return;
    }

    setAulaAtiva(false);
    toast({
      title: "Aula Fechada",
      description: "A aula foi encerrada com sucesso",
    });
  };

  const abrirNovaAula = async () => {
    if (!usuario) return;

    const newToken = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

    const { data: novaAula, error } = await supabase.from("aulas").insert({
      professor_id: usuario.id,
      unidade_id: usuario.unidade_id,
      token: newToken,
      expires_at: expiresAt.toISOString(),
    }).select().single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível abrir nova aula",
        variant: "destructive",
      });
      return;
    }

    if (novaAula) {
      setToken(newToken);
      setAulaId(novaAula.id);
      setDate(now.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }));
      setAulaAtiva(true);
      toast({
        title: "Nova Aula Aberta",
        description: "QR Code gerado com sucesso",
      });
    }
  };

  return (
    <MobileLayout showBrush={true} showNav={true} fullWidth={true}>
      <PageHeader title="Registrar Presença" showBack={true} />

      <div className="flex-1 bg-dojo-paper px-5 py-6 pb-24">
        <div className="dojo-card p-6 flex flex-col items-center gap-5 animate-fade-in">
          {token ? (
            <div className="bg-card p-3 rounded-xl border border-border">
              <QRCode value={token} size={180} />
            </div>
          ) : (
            <div className="w-[180px] h-[180px] bg-muted rounded-xl animate-pulse" />
          )}

          <p className="text-sm text-foreground font-medium text-center">
            Escaneie para marcar presença
          </p>

          <div className="text-center">
            <p className="font-serif font-bold text-foreground text-lg">Aula de Karatê</p>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>

          <p className="text-[10px] text-muted-foreground/60">
            Token válido por 60 minutos
          </p>
        </div>

        {/* Karateka image */}
        <div className="mt-5 rounded-2xl overflow-hidden shadow-md">
          <img src={karatekaDojo} alt="Karateka" className="w-full h-48 object-cover" />
        </div>
      </div>
    </MobileLayout>
  );
};

export default QRCodePage;
