import { useAuth } from "@/lib/auth";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import dojoInterior from "@/assets/dojo-interior.jpg";

const JURAMENTOS = [
  "TREINAREMOS FIRMEMENTE O NOSSO CORAÇÃO E O NOSSO CORPO PARA TERMOS UM ESPÍRITO INABALÁVEL.",
  "ALIMENTAREMOS A VERDADEIRA SIGNIFICAÇÃO DO KYOKUSHIN KARATÊ, PARA QUE NO DEVIDO TEMPO OS NOSSOS SENTIDOS POSSAM ATUAR MELHOR.",
  "COM VERDADEIRO VIGOR, PROCURAREMOS CULTIVAR O ESPÍRITO DE ABNEGAÇÃO.",
  "OBSERVAREMOS AS REGRAS DE CORTESIAS, RESPEITO AOS NOSSOS SUPERIORES E ABSTEMOS DA VIOLÊNCIA.",
  "SEGUIREMOS NOSSO \"DEUS\" E ETERNAS VERDADES, JAMAIS ESQUECEREMOS A VERDADEIRA VIRTUDE DA HUMILDADE.",
  "OLHAREMOS PARA ALTO, PARA A SABEDORIA E PARA O PODER, NÃO PROCURANDO OUTROS DESEJOS.",
  "TODA A NOSSA VIDA ATRAVÉS DA DISCIPLINA DO KYOKUSHIN KARATÊ, PROCURAREMOS PREENCHER A VERDADEIRA SIGNIFICAÇÃO DA FILOSOFIA DA VIDA.",
];

const StudentDashboard = () => {
  const { usuario } = useAuth();

  return (
    <MobileLayout bgImage={dojoInterior} showBrush={false}>
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Header */}
        <div className="px-5 pt-8 pb-4">
          <p className="text-primary-foreground/80 text-sm">おはようございます</p>
          <h1 className="text-2xl font-serif font-bold text-primary-foreground">
            Olá, {usuario?.nome || "Aluno"}
          </h1>
        </div>

        {/* Belt & Progress */}
        <div className="mx-5 mb-5 dojo-card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Faixa Atual</p>
              <p className="font-serif font-bold text-lg text-foreground">{usuario?.faixa || "Branca"}</p>
            </div>
            <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
              🥋 {usuario?.faixa || "Branca"}
            </div>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${usuario?.progresso_faixa || 0}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {usuario?.progresso_faixa || 0}% para a próxima faixa
          </p>
        </div>

        {/* 7 Juramentos */}
        <div className="mx-5 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-serif font-bold text-primary-foreground mb-3">
            Os 7 Juramentos do Kyokushin
          </h2>
          <div className="space-y-3">
            {JURAMENTOS.map((juramento, i) => (
              <div key={i} className="dojo-card flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex-shrink-0 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-xs leading-relaxed text-foreground/90">{juramento}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav role="aluno" />
    </MobileLayout>
  );
};

export default StudentDashboard;
