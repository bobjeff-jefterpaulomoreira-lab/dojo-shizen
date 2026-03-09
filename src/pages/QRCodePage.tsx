import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import QRCode from "react-qr-code";
import karatekaDojo from "@/assets/karateka-dojo.jpg";
import shizenLogo from "@/assets/shizen-logo.png";
import { Button } from "@/components/ui/button";
import { X, Play, Printer, LogIn, LogOut, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface PresencaAluno {
  id: string;
  hora_entrada: string | null;
  hora_saida: string | null;
  aluno: { nome: string; faixa: string } | null;
}

const QRCodePage = () => {
  const { usuario } = useAuth();
  const [token, setToken] = useState("");
  const [date, setDate] = useState("");
  const [aulaId, setAulaId] = useState("");
  const [aulaAtiva, setAulaAtiva] = useState(true);
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Realtime student attendance list
  const { data: presencas = [], refetch: refetchPresencas } = useQuery({
    queryKey: ["presencas-aula", aulaId],
    enabled: !!aulaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("presencas")
        .select("id, hora_entrada, hora_saida, aluno_id")
        .eq("aula_id", aulaId)
        .order("hora_entrada", { ascending: true });
      if (error) throw error;
      // Fetch student names
      if (!data || data.length === 0) return [] as PresencaAluno[];
      const alunoIds = data.map(p => p.aluno_id);
      const { data: alunos } = await supabase
        .from("usuarios")
        .select("id, nome, faixa")
        .in("id", alunoIds);
      const alunoMap = new Map((alunos || []).map(a => [a.id, a]));
      return data.map(p => ({
        id: p.id,
        hora_entrada: p.hora_entrada,
        hora_saida: p.hora_saida,
        aluno: alunoMap.get(p.aluno_id) || null,
      })) as PresencaAluno[];
    },
    refetchInterval: 10000, // Refresh every 10s for realtime feel
  });

  // Subscribe to realtime changes on presencas for this aula
  useEffect(() => {
    if (!aulaId) return;
    const channel = supabase
      .channel(`presencas-aula-${aulaId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'presencas',
        filter: `aula_id=eq.${aulaId}`,
      }, () => {
        refetchPresencas();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [aulaId, refetchPresencas]);

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const imprimirQRCode = () => {
    if (!token || !aulaAtiva) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - Dojo Shizen</title>
        <style>
          body { font-family: Georgia, serif; text-align: center; padding: 40px; color: #1a1a1a; }
          .logo { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 16px; }
          h1 { font-size: 24px; margin: 0 0 4px; color: #8B0000; }
          h2 { font-size: 16px; margin: 0 0 24px; font-weight: normal; color: #555; }
          .qr-container { display: inline-block; padding: 16px; border: 2px solid #8B0000; border-radius: 12px; margin: 16px 0; }
          .info { font-size: 14px; color: #333; margin: 8px 0; }
          .footer { margin-top: 32px; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 16px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <img src="${shizenLogo}" class="logo" alt="Shizen" />
        <h1>Dojo Shizen - 極真空手</h1>
        <h2>Registro de Presença</h2>
        <div class="qr-container" id="qr-print"></div>
        <p class="info"><strong>Data:</strong> ${date}</p>
        <p class="info"><strong>Aula de Karatê Kyokushin</strong></p>
        <p class="info">Escaneie o QR Code com o app para registrar sua presença</p>
        <div class="footer">
          <p>押忍 - Osu! • Token válido por 60 minutos</p>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/react-qr-code@2.0.18/lib/index.js"><\/script>
        <script>
          const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
          svg.setAttribute("viewBox","0 0 256 256");
          svg.setAttribute("width","220");
          svg.setAttribute("height","220");
          // Use a simple QR rendering via an image
        <\/script>
      </body>
      </html>
    `);
    // Render QR into the print window
    const qrContainer = printWindow.document.getElementById("qr-print");
    if (qrContainer) {
      const svgEl = document.querySelector(".qr-print-source svg");
      if (svgEl) {
        qrContainer.innerHTML = svgEl.outerHTML;
      }
    }
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  useEffect(() => {
    const buscarOuCriarAula = async () => {
      if (!usuario) return;

      // Primeiro, busca uma aula ativa existente
      const { data: aulaExistente } = await supabase
        .from("aulas")
        .select("*")
        .eq("professor_id", usuario.id)
        .eq("status", "aberta")
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

    // 1. Close the aula
    const { error } = await supabase
      .from("aulas")
      .update({ expires_at: new Date().toISOString(), status: "fechada" })
      .eq("id", aulaId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fechar a aula",
        variant: "destructive",
      });
      return;
    }

    // 2. Auto-checkout: set hora_saida for students who didn't check out
    const now = new Date().toISOString();
    await supabase
      .from("presencas")
      .update({ hora_saida: now })
      .eq("aula_id", aulaId)
      .is("hora_saida", null);

    setAulaAtiva(false);
    toast({
      title: "Aula Encerrada",
      description: "Check-out automático registrado para todos os alunos",
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
          {/* Status da Aula */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            aulaAtiva 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {aulaAtiva ? "🟢 Aula Ativa" : "🔴 Aula Encerrada"}
          </div>

          {/* QR Code */}
          {token && aulaAtiva ? (
            <div className="bg-card p-3 rounded-xl border border-border">
              <div className="qr-print-source">
                <QRCode value={token} size={180} />
              </div>
            </div>
          ) : (
            <div className="w-[180px] h-[180px] bg-muted rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground text-sm text-center">
                {aulaAtiva ? "Carregando..." : "Aula Encerrada"}
              </p>
            </div>
          )}

          <p className="text-sm text-foreground font-medium text-center">
            {aulaAtiva ? "Escaneie para marcar presença" : "QR Code indisponível"}
          </p>

          <div className="text-center">
            <p className="font-serif font-bold text-foreground text-lg">Aula de Karatê</p>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>

          {aulaAtiva ? (
            <p className="text-[10px] text-muted-foreground/60">
              Token válido por 60 minutos
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground/60">
              Aula finalizada pelo sensei
            </p>
          )}

          {/* Botões de Controle */}
          <div className="flex gap-3 mt-4 flex-wrap justify-center">
            {aulaAtiva ? (
              <>
                <Button 
                  onClick={imprimirQRCode}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Printer size={16} />
                  Imprimir QR Code
                </Button>
                <Button 
                  onClick={fecharAula}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <X size={16} />
                  Fechar Aula
                </Button>
              </>
            ) : (
              <Button 
                onClick={abrirNovaAula}
                className="gap-2 bg-primary hover:bg-primary/90"
                size="sm"
              >
                <Play size={16} />
                Abrir Nova Aula
              </Button>
            )}
          </div>
        </div>

        {/* Lista de Alunos Presentes */}
        {aulaId && (
          <div className="dojo-card mt-5 p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-primary" />
              <h3 className="font-serif font-bold text-foreground text-base">
                Alunos Presentes
              </h3>
              <span className="ml-auto bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {presencas.length}
              </span>
            </div>

            {presencas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum aluno registrou presença ainda
              </p>
            ) : (
              <div className="space-y-2">
                {presencas.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {p.aluno?.nome || "Aluno"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.aluno?.faixa || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] shrink-0">
                      <div className="flex items-center gap-1 text-green-700">
                        <LogIn size={12} />
                        <span>{formatTime(p.hora_entrada)}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${p.hora_saida ? "text-red-600" : "text-muted-foreground/40"}`}>
                        <LogOut size={12} />
                        <span>{formatTime(p.hora_saida)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Karateka image */}
        <div className="mt-5 rounded-2xl overflow-hidden shadow-md">
          <img src={karatekaDojo} alt="Karateka" className="w-full h-48 object-cover" />
        </div>
      </div>
    </MobileLayout>
  );
};

export default QRCodePage;
