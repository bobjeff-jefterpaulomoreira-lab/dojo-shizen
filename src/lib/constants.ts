// Shared constants used across the application

export const BELT_COLORS: Record<string, string> = {
  branca: "#FFFFFF",
  amarela: "#FFD700",
  vermelha: "#CC0000",
  laranja: "#FF8C00",
  azul: "#1E90FF",
  verde: "#228B22",
  marrom: "#8B4513",
  roxa: "#6A0DAD",
  preta: "#111111",
};

export const BELT_ORDER = ["branca", "amarela", "laranja", "azul", "verde", "roxa", "marrom", "preta"];

export const FAIXAS = ["Branca", "Laranja", "Azul", "Amarela", "Vermelha", "Verde", "Marrom", "Preta"];

export const CATEGORIAS = ["Todas", "Kihon", "Kata", "Kumite", "Idogeiko"];

export interface TecnicaInfo {
  nome: string;
  desc: string;
  /** Full label used when saving to DB, e.g. "Mae Geri (Chute Frontal)" */
  label: string;
}

export const TECNICAS_POR_CATEGORIA: Record<string, TecnicaInfo[]> = {
  Kihon: [
    { nome: "Mae Geri", desc: "Chute Frontal", label: "Mae Geri (Chute Frontal)" },
    { nome: "Mawashi Geri", desc: "Chute Circular", label: "Mawashi Geri (Chute Circular)" },
    { nome: "Yoko Geri", desc: "Chute Lateral", label: "Yoko Geri (Chute Lateral)" },
    { nome: "Ushiro Geri", desc: "Chute para Trás", label: "Ushiro Geri (Chute para Trás)" },
    { nome: "Soto Uke", desc: "Defesa Externa", label: "Soto Uke (Defesa Externa)" },
    { nome: "Uchi Uke", desc: "Defesa Interna", label: "Uchi Uke (Defesa Interna)" },
    { nome: "Gedan Barai", desc: "Defesa Baixa", label: "Gedan Barai (Defesa Baixa)" },
    { nome: "Age Uke", desc: "Defesa Alta", label: "Age Uke (Defesa Alta)" },
    { nome: "Seiken", desc: "Soco Básico", label: "Seiken (Soco Básico)" },
    { nome: "Uraken", desc: "Soco com Dorso", label: "Uraken (Soco com Dorso)" },
    { nome: "Shuto Uchi", desc: "Golpe com Mão Aberta", label: "Shuto Uchi (Golpe com Mão Aberta)" },
  ],
  Kata: [
    { nome: "Taikyoku Sono Ichi", desc: "Forma Básica 1", label: "Taikyoku Sono Ichi" },
    { nome: "Taikyoku Sono Ni", desc: "Forma Básica 2", label: "Taikyoku Sono Ni" },
    { nome: "Taikyoku Sono San", desc: "Forma Básica 3", label: "Taikyoku Sono San" },
    { nome: "Pinan Sono Ichi", desc: "Pinan 1", label: "Pinan Sono Ichi" },
    { nome: "Pinan Sono Ni", desc: "Pinan 2", label: "Pinan Sono Ni" },
    { nome: "Pinan Sono San", desc: "Pinan 3", label: "Pinan Sono San" },
    { nome: "Pinan Sono Yon", desc: "Pinan 4", label: "Pinan Sono Yon" },
    { nome: "Pinan Sono Go", desc: "Pinan 5", label: "Pinan Sono Go" },
    { nome: "Sanchin", desc: "Kata de Respiração", label: "Sanchin" },
    { nome: "Tensho", desc: "Mãos Rotativas", label: "Tensho" },
    { nome: "Gekisai Dai", desc: "Kata Avançado", label: "Gekisai Dai" },
    { nome: "Gekisai Sho", desc: "Kata Avançado", label: "Gekisai Sho" },
  ],
  Kumite: [
    { nome: "Sanbon Kumite", desc: "3 Passos", label: "Sanbon Kumite (3 passos)" },
    { nome: "Ippon Kumite", desc: "1 Passo", label: "Ippon Kumite (1 passo)" },
    { nome: "Jiyu Kumite", desc: "Luta Livre", label: "Jiyu Kumite (Luta Livre)" },
    { nome: "Yakusoku Kumite", desc: "Combinado", label: "Yakusoku Kumite (Combinado)" },
    { nome: "Shiai Kumite", desc: "Competição", label: "Shiai Kumite (Competição)" },
  ],
  Idogeiko: [
    { nome: "Ido Geiko Mae Geri", desc: "Movimento com Chute Frontal", label: "Ido Geiko Mae Geri" },
    { nome: "Ido Geiko Mawashi Geri", desc: "Movimento com Chute Circular", label: "Ido Geiko Mawashi Geri" },
    { nome: "Ido Geiko Yoko Geri", desc: "Movimento com Chute Lateral", label: "Ido Geiko Yoko Geri" },
    { nome: "Ido Geiko Oi Tsuki", desc: "Movimento com Soco Direto", label: "Ido Geiko Oi Tsuki" },
    { nome: "Ido Geiko Gyaku Tsuki", desc: "Movimento com Soco Invertido", label: "Ido Geiko Gyaku Tsuki" },
    { nome: "Ido Geiko Soto Uke", desc: "Movimento com Defesa Externa", label: "Ido Geiko Soto Uke" },
    { nome: "Ido Geiko Uchi Uke", desc: "Movimento com Defesa Interna", label: "Ido Geiko Uchi Uke" },
    { nome: "Ido Geiko Gedan Barai", desc: "Movimento com Defesa Baixa", label: "Ido Geiko Gedan Barai" },
    { nome: "Ido Geiko Combinações", desc: "Combinações em Movimento", label: "Ido Geiko Combinações" },
  ],
};

/** Helper: find category for a given technique name/label */
export function findCategoryForTecnica(tecnica: string): string | null {
  for (const [cat, tecnicas] of Object.entries(TECNICAS_POR_CATEGORIA)) {
    if (tecnicas.some(t => t.label === tecnica || t.nome === tecnica)) {
      return cat;
    }
  }
  return null;
}
