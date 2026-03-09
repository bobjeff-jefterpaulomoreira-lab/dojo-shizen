import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CheckCircle2, XCircle, Loader2, Hand } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type ScanStatus = "idle" | "scanning" | "processing" | "success" | "error";

const ScanQRCode = () => {
  const { usuario } = useAuth();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Check for active class in student's unit
  const { data: aulaAtiva, refetch: refetchAula } = useQuery({
    queryKey: ["aula-ativa", usuario?.unidade_id],
    enabled: !!usuario?.unidade_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aulas")
        .select("id, unidade_id")
        .eq("unidade_id", usuario!.unidade_id)
        .gte("expires_at", new Date().toISOString())
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  const handleScan = async (token: string) => {
    if (!usuario) return;
    setStatus("processing");

    try {
      const { data: aula, error: aulaError } = await supabase
        .from("aulas")
        .select("id, unidade_id")
        .eq("token", token)
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();

      if (aulaError || !aula) {
        setStatus("error");
        setMessage("QR Code inválido ou expirado. Peça ao Sensei para gerar um novo.");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("presencas")
        .select("id")
        .eq("aluno_id", usuario.id)
        .eq("data", today)
        .maybeSingle();

      if (existing) {
        setStatus("success");
        setMessage("Sua presença já foi registrada hoje! 押忍");
        return;
      }

      const { error: insertError } = await supabase.from("presencas").insert({
        aluno_id: usuario.id,
        unidade_id: aula.unidade_id,
        data: today,
        presente: true,
      });

      if (insertError) {
        setStatus("error");
        setMessage("Erro ao registrar presença. Tente novamente.");
        return;
      }

      setStatus("success");
      setMessage("Presença registrada com sucesso! 押忍");
    } catch {
      setStatus("error");
      setMessage("Erro inesperado. Tente novamente.");
    }
  };

  // Manual attendance without QR code
  const handleManualAttendance = async () => {
    if (!usuario || !aulaAtiva) return;
    setStatus("processing");

    try {
      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("presencas")
        .select("id")
        .eq("aluno_id", usuario.id)
        .eq("data", today)
        .maybeSingle();

      if (existing) {
        setStatus("success");
        setMessage("Sua presença já foi registrada hoje! 押忍");
        return;
      }

      const { error: insertError } = await supabase.from("presencas").insert({
        aluno_id: usuario.id,
        unidade_id: aulaAtiva.unidade_id,
        data: today,
        presente: true,
      });

      if (insertError) {
        setStatus("error");
        setMessage("Erro ao registrar presença. Tente novamente.");
        return;
      }

      setStatus("success");
      setMessage("Presença registrada com sucesso! 押忍");
      refetchAula();
    } catch {
      setStatus("error");
      setMessage("Erro inesperado. Tente novamente.");
    }

  // CRITICAL: Start scanner directly in click handler to preserve user gesture context
  const startScanner = async () => {
    setStatus("scanning");
    setMessage("");

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          await scanner.stop();
          scannerRef.current = null;
          handleScan(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      console.error("Camera error:", err);
      setStatus("error");
      setMessage("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const reset = () => {
    stopScanner();
    setStatus("idle");
    setMessage("");
  };

  return (
    <MobileLayout showBrush={true} showNav={true} fullWidth={true}>
      <PageHeader title="Marcar Presença" showBack={true} />

      <div className="flex-1 bg-dojo-paper px-5 py-6">
        <div className="dojo-card p-6 flex flex-col items-center gap-5 animate-fade-in">
          {/* QR reader div always in DOM so it exists when scanner starts */}
          <div
            id="qr-reader"
            className={`w-full max-w-[280px] aspect-square rounded-xl overflow-hidden ${
              status === "scanning" ? "block" : "hidden"
            }`}
          />

          {status === "idle" && (
            <>
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center bg-primary/15"
              >
                <Camera size={40} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-serif font-bold text-foreground text-lg">Escanear QR Code</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Aponte a câmera para o QR Code exibido pelo Sensei
                </p>
              </div>
              <button
                onClick={startScanner}
                className="w-full py-3 rounded-xl font-bold text-primary-foreground bg-primary transition-colors"
              >
                Abrir Câmera
              </button>
            </>
          )}

          {status === "scanning" && (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Posicione o QR Code dentro da área
              </p>
              <button
                onClick={reset}
                className="text-sm text-primary font-medium"
              >
                Cancelar
              </button>
            </>
          )}

          {status === "processing" && (
            <div className="py-10 flex flex-col items-center gap-4">
              <Loader2 size={48} className="text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Verificando presença...</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-6 flex flex-col items-center gap-4">
              <CheckCircle2 size={64} className="text-dojo-green" />
              <p className="font-serif font-bold text-foreground text-lg text-center">{message}</p>
              <button
                onClick={reset}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
              >
                Voltar
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="py-6 flex flex-col items-center gap-4">
              <XCircle size={64} className="text-destructive" />
              <p className="text-sm text-foreground text-center font-medium">{message}</p>
              <button
                onClick={reset}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default ScanQRCode;
