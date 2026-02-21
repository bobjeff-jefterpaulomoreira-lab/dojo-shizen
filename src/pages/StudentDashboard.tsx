import { useAuth } from "@/lib/auth";
import MobileLayout from "@/components/MobileLayout";
import karatekaBack from "@/assets/karateka-back.jpg";

const JURAMENTOS = [
  "TREINAREMOS FIRMEMENTE O NOSSO CORAÇÃO E O NOSSO CORPO PARA TERMOS UM ESPÍRITO INABALÁVEL.",
  "ALIMENTAREMOS A VERDADEIRA SIGNIFICAÇÃO DO KYOKUSHIN KARATÊ, PARA QUE NO DEVIDO TEMPO OS NOSSOS SENTIDOS POSSAM ATUAR MELHOR.",
  "COM VERDADEIRO VIGOR, PROCURAREMOS CULTIVAR O ESPÍRITO DE ABNEGAÇÃO.",
  "OBSERVAREMOS AS REGRAS DE CORTESIAS, RESPEITO AOS NOSSOS SUPERIORES E ABSTEMOS DA VIOLÊNCIA.",
  'SEGUIREMOS NOSSO "DEUS" E ETERNAS VERDADES, JAMAIS ESQUECEREMOS A VERDADEIRA VIRTUDE DA HUMILDADE.',
  "OLHAREMOS PARA ALTO, PARA A SABEDORIA E PARA O PODER, NÃO PROCURANDO OUTROS DESEJOS.",
  "TODA A NOSSA VIDA ATRAVÉS DA DISCIPLINA DO KYOKUSHIN KARATÊ, PROCURAREMOS PREENCHER A VERDADEIRA SIGNIFICAÇÃO DA FILOSOFIA DA VIDA.",
];

const StudentDashboard = () => {
  const { usuario } = useAuth();

  return (
    <MobileLayout showBrush={false} showNav={true} fullWidth={true}>
      {/* Red header with bg */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${karatekaBack})` }} />
        <div className="absolute inset-0" style={{ backgroundColor: "hsla(0, 100%, 27%, 0.7)" }} />
        <div className="relative z-10 px-5 pt-8 pb-5 max-w-3xl mx-auto">
          <h1 className="text-2xl font-serif font-bold text-primary-foreground">
            Olá, {usuario?.nome || "Aluno"}
          </h1>
          <div className="mt-3 inline-block bg-dojo-green text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full">
            🥋 Faixa {usuario?.faixa || "Branca"}
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-primary-foreground/70 mb-1">
              <span>Progresso</span>
              <span>{usuario?.progresso_faixa || 0}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-primary-foreground/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-foreground transition-all duration-500"
                style={{ width: `${usuario?.progresso_faixa || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 md:pb-10 bg-dojo-paper">
        <div className="px-5 pt-5 pb-6 max-w-3xl mx-auto">
          <h2 className="text-base font-serif font-bold text-foreground mb-3 flex items-center gap-2">
            🥋 Os 7 Juramentos do Kyokushin
          </h2>
          <div className="space-y-2.5">
            {JURAMENTOS.map((juramento, i) => (
              <div key={i} className="dojo-card flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {i + 1}
                </div>
                <p className="text-[11px] leading-relaxed text-foreground/85">{juramento}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default StudentDashboard;
