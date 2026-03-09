import { useRef, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Shield, Code, Database, Smartphone, Users, Lock, Server, Award, FileText, Calendar, Download, Loader2 } from "lucide-react";
import shizenLogo from "@/assets/shizen-logo.png";

const Documentacao = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#faf6f1",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      pdf.save("Dojo_Shizen_Documentacao_Jefter_Paulo_Moreira.pdf");
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setGenerating(false);
    }
  };
  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const funcionalidades = [
    { titulo: "Autenticação Segura", desc: "Login com email verificado e controle de roles (Professor/Aluno)", icon: Lock },
    { titulo: "QR Code Check-in/out", desc: "Abertura de aula via QR, check-in e check-out com registro de horários", icon: Smartphone },
    { titulo: "Gestão de Alunos", desc: "Cadastro, edição, listagem e exclusão de alunos por unidade", icon: Users },
    { titulo: "Relatórios de Presença", desc: "Histórico mensal com hora de entrada, saída e tempo de permanência", icon: FileText },
    { titulo: "Comunicados e Notificações", desc: "Envio segmentado por unidade, faixa ou aluno específico", icon: Award },
    { titulo: "Calendário de Eventos", desc: "Visualização e criação de treinos, eventos e avaliações", icon: Calendar },
    { titulo: "Avaliações Técnicas", desc: "Registro de progresso por técnica para cada aluno", icon: Award },
    { titulo: "Documentos do Aluno", desc: "Upload e gestão de carteirinhas e documentos", icon: FileText },
    { titulo: "Impressão de QR Code", desc: "Layout formatado para fixação na academia", icon: FileText },
    { titulo: "Presença em Tempo Real", desc: "Lista de alunos presentes com atualização via WebSocket", icon: Server },
  ];

  const tabelas = [
    { nome: "unidades", desc: "Academias/dojos cadastrados" },
    { nome: "usuarios", desc: "Alunos e professores com faixa e progresso" },
    { nome: "aulas", desc: "Sessões com token QR, status e expiração" },
    { nome: "presencas", desc: "Check-in/out com hora_entrada e hora_saida" },
    { nome: "avaliacoes", desc: "Avaliações técnicas por aluno" },
    { nome: "comunicados", desc: "Avisos e eventos com anexos" },
    { nome: "notificacoes", desc: "Sistema de notificações segmentadas" },
    { nome: "notificacao_leituras", desc: "Controle de leitura por usuário" },
    { nome: "documentos", desc: "Documentos pessoais dos alunos" },
  ];

  const stack = [
    { nome: "React 18 + TypeScript", tipo: "Frontend" },
    { nome: "Vite", tipo: "Build Tool" },
    { nome: "Tailwind CSS + shadcn/ui", tipo: "Estilização" },
    { nome: "Lovable Cloud (PostgreSQL)", tipo: "Backend/DB" },
    { nome: "TanStack React Query", tipo: "Estado" },
    { nome: "React Router DOM v6", tipo: "Roteamento" },
    { nome: "react-qr-code + html5-qrcode", tipo: "QR Code" },
    { nome: "vite-plugin-pwa", tipo: "PWA" },
    { nome: "Recharts", tipo: "Gráficos" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <MobileLayout showBrush={false} showNav={false} fullWidth={true}>
      <PageHeader title="Documentação Técnica" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-24 bg-dojo-paper print:bg-white">
        <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">

          {/* === CERTIFICADO DE AUTORIA === */}
          <div className="dojo-card p-6 border-2 border-primary/30 relative overflow-hidden print:border-primary">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg" />

            <div className="text-center space-y-4">
              <img src={shizenLogo} alt="Dojo Shizen" className="w-20 h-20 mx-auto rounded-2xl" />
              
              <div>
                <p className="text-xs text-primary font-bold tracking-[0.3em] uppercase">Certificado de</p>
                <h1 className="font-serif text-2xl font-bold text-foreground mt-1">Autoria e Propriedade Intelectual</h1>
              </div>

              <div className="w-16 h-0.5 bg-primary mx-auto" />

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Certifico que o sistema</p>
                <p className="font-serif text-xl font-bold text-primary">Dojo Shizen — 極真空手</p>
                <p className="text-sm text-muted-foreground">foi integralmente desenvolvido por</p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl py-4 px-6">
                <p className="font-serif text-2xl font-bold text-foreground">Jefter Paulo Moreira</p>
                <p className="text-sm text-muted-foreground mt-1">Desenvolvedor Full-Stack</p>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Plataforma: <span className="text-foreground font-medium">Lovable Cloud</span></p>
                <p>URL: <span className="text-foreground font-medium">dojo-shizen.lovable.app</span></p>
                <p>Data: <span className="text-foreground font-medium">{dataAtual}</span></p>
              </div>

              <div className="pt-2">
                <div className="w-48 h-0.5 bg-foreground/30 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Jefter Paulo Moreira</p>
                <p className="text-[10px] text-muted-foreground/60">Todos os direitos reservados © 2026</p>
              </div>
            </div>
          </div>

          {/* === STACK TECNOLÓGICA === */}
          <div className="dojo-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Code size={18} className="text-primary" />
              <h2 className="font-serif font-bold text-foreground text-base">Stack Tecnológica</h2>
            </div>
            <div className="space-y-2">
              {stack.map((s) => (
                <div key={s.nome} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm font-medium text-foreground">{s.nome}</span>
                  <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{s.tipo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* === FUNCIONALIDADES === */}
          <div className="dojo-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-primary" />
              <h2 className="font-serif font-bold text-foreground text-base">Funcionalidades ({funcionalidades.length})</h2>
            </div>
            <div className="space-y-3">
              {funcionalidades.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.titulo} className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                      <Icon size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.titulo}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* === BANCO DE DADOS === */}
          <div className="dojo-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Database size={18} className="text-primary" />
              <h2 className="font-serif font-bold text-foreground text-base">Banco de Dados ({tabelas.length} tabelas)</h2>
            </div>
            <div className="space-y-2">
              {tabelas.map((t) => (
                <div key={t.nome} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <code className="text-xs font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">{t.nome}</code>
                  <span className="text-[11px] text-muted-foreground text-right flex-1 ml-3">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* === SEGURANÇA === */}
          <div className="dojo-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-primary" />
              <h2 className="font-serif font-bold text-foreground text-base">Segurança</h2>
            </div>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-dojo-green shrink-0" />
                Row Level Security (RLS) ativo em 100% das tabelas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-dojo-green shrink-0" />
                Funções SECURITY DEFINER para verificação de roles
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-dojo-green shrink-0" />
                Autenticação com email verificado
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-dojo-green shrink-0" />
                Zero chaves privadas expostas no frontend
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-dojo-green shrink-0" />
                2 Edge Functions serverless para operações sensíveis
              </li>
            </ul>
          </div>

          {/* === INFRAESTRUTURA === */}
          <div className="dojo-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Server size={18} className="text-primary" />
              <h2 className="font-serif font-bold text-foreground text-base">Infraestrutura</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Hospedagem</span>
                <span className="text-foreground font-medium">Lovable Cloud</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Banco de Dados</span>
                <span className="text-foreground font-medium">PostgreSQL</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Realtime</span>
                <span className="text-foreground font-medium">WebSocket</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Storage</span>
                <span className="text-foreground font-medium">2 buckets (comunicados, documentos)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Capacidade</span>
                <span className="text-foreground font-medium">200+ usuários simultâneos</span>
              </div>
            </div>
          </div>

          {/* === 19 PÁGINAS === */}
          <div className="dojo-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone size={18} className="text-primary" />
              <h2 className="font-serif font-bold text-foreground text-base">Páginas do Sistema (19)</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Login", "Dashboard Aluno", "Dashboard Sensei", "QR Code (Abrir Aula)",
                "Escanear QR Code", "Lista de Alunos", "Cadastrar Aluno", "Relatório Presença",
                "Histórico de Aulas", "Avaliações", "Evolução", "Comunicados",
                "Calendário", "Notificações Sensei", "Notificações Aluno", "Perfil",
                "Meus Documentos", "Documentação", "404"
              ].map((page) => (
                <div key={page} className="text-xs text-foreground bg-muted/50 rounded-lg px-2.5 py-2 border border-border">
                  {page}
                </div>
              ))}
            </div>
          </div>

          {/* Botão imprimir */}
          <button
            onClick={handlePrint}
            className="dojo-btn w-full text-sm print:hidden"
          >
            🖨️ Imprimir Documentação
          </button>

          <p className="text-center text-[10px] text-muted-foreground/50 print:text-foreground">
            押忍 — Dojo Shizen © 2026 — Todos os direitos reservados — Jefter Paulo Moreira
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Documentacao;
