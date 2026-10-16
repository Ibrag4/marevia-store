export type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
};
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  description: string;
  image: string;
  images: string[];
  colors: string[];
  sizes: string[];
  variants: Variant[];
  badge?: string;
  featured?: boolean;
  print: string;
};

// Fotos de referência para o protótipo. Troque pelas fotos reais dos produtos antes de vender.
const pics = {
  floral:
    "https://images.unsplash.com/photo-1570976447640-ac859083963f?auto=format&fit=crop&w=1100&q=85",
  beach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
  bikini:
    "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1100&q=85",
  swim: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=1100&q=85",
  palm: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1100&q=85",
  woman:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1100&q=85",
  ocean:
    "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1100&q=85",
  tropic:
    "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1100&q=85",
};
const sizes = ["P", "M", "G", "GG"];
const mkVariants = (colors: string[]) =>
  colors.flatMap((color) =>
    sizes.map((size) => ({
      id: `${color
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}-${size.toLowerCase()}`,
      size,
      color,
      stock: 5,
    }))
  );
export const products: Product[] = [
  {
    id: "p1",
    slug: "biquini-mare-vermelha",
    name: "Biquíni Maré Vermelha",
    category: "biquinis",
    price: 69.9,
    oldPrice: 159.9,
    description:
      "Um vermelho marcante para acompanhar seus dias de sol. O Biquíni Maré Vermelha combina estilo, leveza e um toque de atitude, perfeito para curtir a praia ou a piscina.",
    image: pics.bikini,
    images: [pics.bikini, pics.ocean],
    colors: ["Vermelho"],
    sizes,
    variants: mkVariants(["Vermelho"]),
    badge: "Queridinho",
    featured: true,
    print: "Liso",
  },
  {
    id: "p2",
    slug: "biquini-sol-de-manga",
    name: "Biquíni Sol de Manga",
    category: "biquinis",
    price: 129.9,
    description:
      "Duas cores quentes e um visual que já combina com dia de praia. Use o conjunto completo ou combine as peças com outros tons.",
    image: pics.bikini,
    images: [pics.bikini, pics.woman, pics.beach],
    colors: ["Laranja solar", "Rosa pitaya"],
    sizes,
    variants: mkVariants(["Laranja solar", "Rosa pitaya"]),
    badge: "Chegou agora",
    featured: true,
    print: "Cores lisas",
  },
  {
    id: "p3",
    slug: "maio-ondina",
    name: "Maiô Ondina",
    category: "maios",
    price: 189.9,
    description:
      "Maiô de visual clássico, com cor inspirada no azul do mar. Vai bem sozinho na praia e também com short ou calça leve depois do mergulho.",
    image: pics.swim,
    images: [pics.swim, pics.ocean, pics.palm],
    colors: ["Azul oceano", "Preto"],
    sizes,
    variants: mkVariants(["Azul oceano", "Preto"]),
    featured: true,
    print: "Liso",
  },
  {
    id: "p4",
    slug: "biquini-jardim-tropical",
    name: "Biquíni Jardim Tropical",
    category: "biquinis",
    price: 149.9,
    description:
      "Estampa de folhagens para quem gosta de cor. Combine com uma saída neutra ou use as peças separadas para montar outros looks de praia.",
    image: pics.palm,
    images: [pics.palm, pics.floral, pics.tropic],
    colors: ["Verde tropical"],
    sizes,
    variants: mkVariants(["Verde tropical"]),
    badge: "Estampa",
    featured: true,
    print: "Tropical",
  },
  {
    id: "p5",
    slug: "maio-goiaba",
    name: "Maiô Goiaba",
    category: "maios",
    price: 169.9,
    description:
      "Rosa goiaba para sair do básico sem complicar. Uma peça que também funciona como body com saia, jeans ou short.",
    image: pics.woman,
    images: [pics.woman, pics.bikini, pics.beach],
    colors: ["Rosa goiaba", "Preto"],
    sizes,
    variants: mkVariants(["Rosa goiaba", "Preto"]),
    featured: true,
    print: "Liso",
  },
  {
    id: "p6",
    slug: "maio-mar-aberto",
    name: "Maiô Mar Aberto",
    category: "maios",
    price: 179.9,
    description:
      "Azul profundo e proposta simples, para quem prefere uma peça única. Um clássico de praia que não depende de estampa para aparecer.",
    image: pics.ocean,
    images: [pics.ocean, pics.palm, pics.beach],
    colors: ["Azul oceano", "Verde água"],
    sizes,
    variants: mkVariants(["Azul oceano", "Verde água"]),
    featured: true,
    print: "Liso",
  },
  {
    id: "p7",
    slug: "biquini-mare-alta",
    name: "Biquíni Maré Alta",
    category: "biquinis",
    price: 134.9,
    description:
      "Tons de azul e verde que lembram água transparente. Uma opção leve para levar na mala de fim de semana ou usar durante as férias.",
    image: pics.beach,
    images: [pics.beach, pics.ocean, pics.swim],
    colors: ["Azul oceano", "Verde água"],
    sizes,
    variants: mkVariants(["Azul oceano", "Verde água"]),
    print: "Cores lisas",
  },
  {
    id: "p8",
    slug: "biquini-ceu-de-verao",
    name: "Biquíni Céu de Verão",
    category: "biquinis",
    price: 124.9,
    description:
      "Combinação de azul claro e amarelo manteiga para dar um pouco de cor ao look de praia. Misture as peças com seus outros biquínis favoritos.",
    image: pics.tropic,
    images: [pics.tropic, pics.woman, pics.floral],
    colors: ["Azul céu", "Amarelo manteiga"],
    sizes,
    variants: mkVariants(["Azul céu", "Amarelo manteiga"]),
    badge: "Novidade",
    print: "Cores lisas",
  },
];
export const categories = [
  {
    name: "Biquínis",
    slug: "biquinis",
    image: pics.floral,
    description: "Conjuntos, cores e estampas para combinar do seu jeito.",
  },
  {
    name: "Maiôs",
    slug: "maios",
    image: pics.swim,
    description: "Peças únicas, do mergulho ao look fora da areia.",
  },
];
export const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
