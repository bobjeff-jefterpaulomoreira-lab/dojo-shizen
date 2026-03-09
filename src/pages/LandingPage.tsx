import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import shizenLogo from "@/assets/shizen-logo.png";
import karatekaBack from "@/assets/karateka-hero.jpg";
import dojoInterior from "@/assets/dojo-interior-new.jpg";
import screenAlunos from "@/assets/screenshots/screen-alunos.jpg";
import screenQrcode from "@/assets/screenshots/screen-qrcode.jpg";
import screenRelatorio from "@/assets/screenshots/screen-relatorio.jpg";
import screenAluno from "@/assets/screenshots/screen-aluno.jpg";
import screenCalendario from "@/assets/screenshots/screen-calendario.jpg";
import {
  QrCode, Users, ClipboardCheck, Bell, Calendar, Shield,
  BarChart3, Smartphone, Zap, CheckCircle2, ArrowRight,
  Star, ChevronDown, Globe, Lock, Wifi
} from "lucide-react";

const FadeInSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: QrCode, title: "Check-in por QR Code", desc: "Aluno escaneia, presença registrada. Sem filas, sem papel, sem erro." },
    { icon: Users, title: "Gestão de Alunos", desc: "Cadastro completo com faixa, unidade, progresso e histórico." },
    { icon: ClipboardCheck, title: "Avaliações Técnicas", desc: "Registre e acompanhe a evolução técnica de cada aluno." },
    { icon: BarChart3, title: "Relatórios Detalhados", desc: "Presença mensal, tempo de treino, frequência por período." },
    { icon: Bell, title: "Notificações Segmentadas", desc: "Envie avisos por unidade, faixa ou aluno específico." },
    { icon: Calendar, title: "Calendário Integrado", desc: "Treinos, eventos, avaliações e competições em um só lugar." },
  ];

  const benefits = [
    "Elimina cadernos e planilhas de presença",
    "Reduz inadimplência com controle real de frequência",
    "Profissionaliza a gestão da academia",
    "Alunos acompanham seu próprio progresso",
    "Comunicação direta sensei → alunos",
    "Funciona no celular como app nativo (PWA)",
  ];

  const plans = [
    {
      name: "Essencial",
      price: "R$ 197",
      period: "/mês",
      desc: "Até 100 alunos",
      features: ["QR Code check-in/out", "Gestão de alunos", "Relatórios de presença", "Notificações", "Calendário", "Suporte por email"],
      highlight: false,
    },
    {
      name: "Profissional",
      price: "R$ 297",
      period: "/mês",
      desc: "Até 300 alunos",
      features: ["Tudo do Essencial", "Avaliações técnicas", "Multi-unidade", "Documentos do aluno", "Relatórios avançados", "Suporte prioritário"],
      highlight: true,
    },
    {
      name: "Licença Única",
      price: "R$ 9.997",
      period: "",
      desc: "Código-fonte completo",
      features: ["Tudo do Profissional", "Código-fonte entregue", "Hospedagem própria", "Sem mensalidade", "Personalização livre", "1 mês de suporte"],
      highlight: false,
    },
  ];

  const testimonials = [
    { name: "Shihan Aldair", role: "Kyokushin Karate", text: "Revolucionou o controle da minha academia. Antes eu perdia horas com caderno de presença." },
    { name: "Sensei Ricardo", role: "Judô", text: "Meus alunos adoram ver o progresso deles no celular. A motivação aumentou muito." },
    { name: "Prof. Mariana", role: "Jiu-Jitsu", text: "A comunicação ficou muito mais ágil. Envio avisos e todos recebem na hora." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${karatekaBack})` }}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-black/70" />

        {/* Kanji decoration */}
        <motion.div
          className="absolute top-8 right-8 text-white/5 text-[120px] font-serif leading-none select-none hidden md:block"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 1 }}
        >
          武道
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.img
            src={shizenLogo}
            alt="Dojo Shizen"
            className="w-24 h-24 mx-auto rounded-2xl shadow-2xl mb-8"
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 150 }}
          />

          <motion.p
            className="text-primary-foreground/60 text-sm tracking-[0.4em] uppercase font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Sistema de Gestão para Artes Marciais
          </motion.p>

          <motion.h1
            className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            Sua Academia no
            <span className="block" style={{ color: "hsl(0, 100%, 45%)" }}> Próximo Nível</span>
          </motion.h1>

          <motion.p
            className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Controle de presença por QR Code, avaliações técnicas, comunicados e relatórios —
            tudo em um app profissional feito <strong className="text-white">para senseis de verdade</strong>.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <motion.button
              onClick={() => document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" })}
              className="dojo-btn text-base px-8 py-4 rounded-xl shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Ver Planos <ArrowRight size={18} />
            </motion.button>
            <motion.button
              onClick={() => navigate("/")}
              className="px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Acessar Demo
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={28} className="text-white/40" />
        </motion.div>
      </section>

      {/* ═══════ PROBLEMA / SOLUÇÃO ═══════ */}
      <section className="py-20 px-6 bg-muted">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] uppercase font-medium mb-3" style={{ color: "hsl(var(--primary))" }}>
              O problema
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Sua academia ainda usa caderno de presença?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Planilhas se perdem, cadernos ficam incompletos, alunos não sabem seu progresso.
              <strong className="text-foreground"> Isso acaba hoje.</strong>
            </p>
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              {benefits.map((b, i) => (
                <FadeInSection key={i} delay={i * 0.1}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={22} className="shrink-0 mt-0.5" style={{ color: "hsl(var(--dojo-green))" }} />
                    <p className="text-foreground text-base">{b}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
            <FadeInSection delay={0.3}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src={dojoInterior} alt="Interior do Dojo" className="w-full h-72 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-serif font-bold text-lg">+200 academias podem usar</p>
                  <p className="text-white/70 text-sm">Infraestrutura pronta para escalar</p>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ═══════ FUNCIONALIDADES ═══════ */}
      <section className="py-20 px-6" style={{ backgroundColor: "hsl(var(--card))" }}>
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] uppercase font-medium mb-3" style={{ color: "hsl(var(--primary))" }}>
              Funcionalidades
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Tudo que seu dojo precisa
            </h2>
          </FadeInSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeInSection key={i} delay={i * 0.1}>
                  <motion.div
                    className="dojo-card p-6 hover:shadow-lg transition-shadow group h-full"
                    whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: "hsl(var(--primary) / 0.1)" }}
                      whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
                    >
                      <Icon size={24} style={{ color: "hsl(var(--primary))" }} />
                    </motion.div>
                    <h3 className="font-serif font-bold text-foreground text-lg mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ VEJA O APP ═══════ */}
      <section className="py-20 px-6 bg-muted overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] uppercase font-medium mb-3" style={{ color: "hsl(var(--primary))" }}>
              Conheça o Sistema
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Veja o app em ação
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Interface profissional, intuitiva e pensada para o dia a dia do sensei e do aluno.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { img: screenQrcode, label: "QR Code Check-in", desc: "Abra a aula e gere o QR Code" },
              { img: screenAlunos, label: "Gestão de Alunos", desc: "Lista completa com faixas e presença" },
              { img: screenRelatorio, label: "Relatórios", desc: "Dados de presença e frequência" },
              { img: screenAluno, label: "Progresso do Aluno", desc: "Evolução técnica e metas" },
            ].map((screen, i) => (
              <FadeInSection key={i} delay={i * 0.15}>
                <motion.div
                  className="flex flex-col items-center"
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  {/* Phone mockup frame */}
                  <div className="relative w-full max-w-[180px] md:max-w-[220px] mx-auto">
                    <div
                      className="rounded-[24px] overflow-hidden shadow-2xl border-[3px]"
                      style={{ borderColor: "hsl(var(--foreground) / 0.2)" }}
                    >
                      {/* Notch */}
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 rounded-b-xl z-10"
                        style={{ backgroundColor: "hsl(var(--foreground) / 0.15)" }}
                      />
                      <img
                        src={screen.img}
                        alt={screen.label}
                        className="w-full aspect-[9/19] object-cover object-top"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="font-serif font-bold text-foreground text-sm">{screen.label}</p>
                    <p className="text-muted-foreground text-xs mt-1">{screen.desc}</p>
                  </div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-6 bg-muted border-y border-border">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 items-center">
          {[
            { icon: Smartphone, label: "App Progressivo (PWA)" },
            { icon: Shield, label: "Segurança Avançada" },
            { icon: Wifi, label: "Tempo Real" },
            { icon: Globe, label: "Acesso de qualquer lugar" },
            { icon: Lock, label: "Dados criptografados" },
            { icon: Zap, label: "Alta performance" },
          ].map((t, i) => {
            const Icon = t.icon;
            return (
              <FadeInSection key={i} delay={i * 0.08}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon size={16} style={{ color: "hsl(var(--primary))" }} />
                  <span>{t.label}</span>
                </div>
              </FadeInSection>
            );
          })}
        </div>
      </section>

      {/* ═══════ DEPOIMENTOS ═══════ */}
      <section className="py-20 px-6" style={{ backgroundColor: "hsl(var(--card))" }}>
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-12">
            <p className="text-sm tracking-[0.3em] uppercase font-medium mb-3" style={{ color: "hsl(var(--primary))" }}>
              Depoimentos
            </p>
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Quem usa, recomenda
            </h2>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeInSection key={i} delay={i * 0.15}>
                <motion.div
                  className="dojo-card p-6 h-full"
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + j * 0.1 }}
                      >
                        <Star size={16} fill="hsl(var(--dojo-yellow))" style={{ color: "hsl(var(--dojo-yellow))" }} />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div>
                    <p className="font-bold text-foreground text-sm">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PLANOS ═══════ */}
      <section id="planos" className="py-20 px-6 bg-muted">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-12">
            <p className="text-sm tracking-[0.3em] uppercase font-medium mb-3" style={{ color: "hsl(var(--primary))" }}>
              Investimento
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Escolha seu plano
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Comece agora e transforme a gestão da sua academia em dias, não meses.
            </p>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <FadeInSection key={i} delay={i * 0.15}>
                <motion.div
                  className={`dojo-card p-6 flex flex-col relative h-full ${
                    p.highlight ? "border-2 ring-2 ring-offset-2" : ""
                  }`}
                  style={p.highlight ? { borderColor: "hsl(var(--primary))" } : {}}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  {p.highlight && (
                    <motion.div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-primary-foreground text-xs font-bold px-4 py-1 rounded-full"
                      style={{ backgroundColor: "hsl(var(--primary))" }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                      Mais Popular
                    </motion.div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="font-serif text-xl font-bold text-foreground mb-1">{p.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{p.desc}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-serif text-4xl font-bold text-foreground">{p.price}</span>
                      {p.period && <span className="text-muted-foreground text-sm">{p.period}</span>}
                    </div>
                  </div>

                  <ul className="space-y-3 flex-1 mb-6">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 size={16} style={{ color: "hsl(var(--dojo-green))" }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <motion.a
                    href="https://wa.me/5531971310564?text=Olá! Tenho interesse no plano "
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 rounded-xl font-semibold text-center transition-all block ${
                      p.highlight
                        ? "text-primary-foreground shadow-lg"
                        : "border-2 text-foreground hover:bg-accent"
                    }`}
                    style={p.highlight ? { backgroundColor: "hsl(var(--primary))" } : { borderColor: "hsl(var(--border))" }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Quero esse plano
                  </motion.a>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA FINAL ═══════ */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${karatekaBack})` }}
        />
        <div className="absolute inset-0 bg-black/80" />

        <FadeInSection className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para profissionalizar seu dojo?
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Junte-se aos senseis que já saíram do caderno e entraram na era digital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="https://wa.me/5531971310564?text=Olá! Quero saber mais sobre o Dojo Shizen"
              target="_blank"
              rel="noopener noreferrer"
              className="dojo-btn text-base px-8 py-4 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Falar no WhatsApp <ArrowRight size={18} />
            </motion.a>
            <motion.button
              onClick={() => navigate("/")}
              className="px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Testar Agora
            </motion.button>
          </div>
        </FadeInSection>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="py-8 px-6 bg-foreground text-background/60">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={shizenLogo} alt="Dojo Shizen" className="w-8 h-8 rounded-lg" />
            <span className="font-serif font-bold text-background text-sm">Dojo Shizen</span>
          </div>
          <p className="text-xs text-center">
            Desenvolvido por <strong className="text-background">Jefter Paulo Moreira</strong> — Todos os direitos reservados © 2026
          </p>
          <p className="text-xs">押忍</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
