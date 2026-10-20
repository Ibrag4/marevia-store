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
  // Produtos com a mesma família são o mesmo modelo em cores diferentes
  family?: string;
};

// O fallback permite importar este arquivo no vite.config (Node), onde import.meta.env não existe.
const BASE = import.meta.env?.BASE_URL ?? "/";

// Imagens da coleção.

const pics = {
  floral:
    "https://images.unsplash.com/photo-1570976447640-ac859083963f?auto=format&fit=crop&w=1100&q=85",

  beach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",

  bikini:
    "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1100&q=85",

  swim: "https://images.unsplash.com/photo-1620078088730-069c41317808?auto=format&fit=crop&w=1100&q=85",

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
    family: "mare",
    price: 59.9,
    oldPrice: 159.9,
    description:
      "Um vermelho marcante para acompanhar seus dias de sol. O Biquíni Maré Vermelha combina estilo, leveza e personalidade para curtir a praia ou a piscina.",
    image: `${BASE}assets/vermelho.jpg`,
    images: [`${BASE}assets/vermelho.jpg`, `${BASE}assets/vermelho-costas.jpg`],
    colors: ["Vermelho"],
    sizes,
    variants: mkVariants(["Vermelho"]),
    badge: "Queridinho",
    featured: true,
    print: "Liso",
  },
  {
    id: "p9",
    slug: "biquini-mare-amarelo",
    name: "Biquíni Maré Amarelo",
    category: "biquinis",
    family: "mare",
    price: 59.9,
    oldPrice: 159.9,
    description:
      "Um amarelo iluminado para trazer ainda mais cor aos dias de verão. O Biquíni Maré Amarelo é leve, versátil e perfeito para aproveitar o sol.",
    image: `${BASE}assets/amarelo.jpg`,
    images: [`${BASE}assets/amarelo.jpg`, `${BASE}assets/amarelo-costas.jpg`],
    colors: ["Amarelo"],
    sizes,
    variants: mkVariants(["Amarelo"]),
    badge: "7 cores",
    featured: true,
    print: "Liso",
  },
  {
    id: "p10",
    slug: "biquini-mare-azul",
    name: "Biquíni Maré Azul",
    category: "biquinis",
    family: "mare",
    price: 59.9,
    oldPrice: 159.9,
    description:
      "Inspirado nos tons do mar, o Biquíni Maré Azul combina frescor e simplicidade em uma peça perfeita para os dias de praia e piscina.",
    image: `${BASE}assets/azul.jpg`,
    images: [`${BASE}assets/azul.jpg`, `${BASE}assets/azul-costas.jpg`],
    colors: ["Azul"],
    sizes,
    variants: mkVariants(["Azul"]),
    badge: "7 cores",
    featured: true,
    print: "Liso",
  },
  {
    id: "p11",
    slug: "biquini-mare-marrom",
    name: "Biquíni Maré Marrom",
    category: "biquinis",
    family: "mare",
    price: 59.9,
    oldPrice: 159.9,
    description:
      "Em um tom terroso e moderno, o Biquíni Maré Marrom é uma escolha versátil para compor looks de praia com personalidade.",
    image: `${BASE}assets/marrom.jpg`,
    images: [`${BASE}assets/marrom.jpg`, `${BASE}assets/marrom-costas.jpg`],
    colors: ["Marrom"],
    sizes,
    variants: mkVariants(["Marrom"]),
    badge: "7 cores",
    featured: true,
    print: "Liso",
  },
  {
    id: "p12",
    slug: "biquini-mare-preto",
    name: "Biquíni Maré Preto",
    category: "biquinis",
    family: "mare",
    price: 59.9,
    oldPrice: 159.9,
    description:
      "Clássico e fácil de combinar, o Biquíni Maré Preto é ideal para quem gosta de uma peça atemporal que nunca sai de moda.",
    image: `${BASE}assets/preto.jpg`,
    images: [`${BASE}assets/preto.jpg`, `${BASE}assets/preto-costas.jpg`],
    colors: ["Preto"],
    sizes,
    variants: mkVariants(["Preto"]),
    badge: "7 cores",
    featured: true,
    print: "Liso",
  },
  {
    id: "p13",
    slug: "biquini-mare-rosa",
    name: "Biquíni Maré Rosa",
    category: "biquinis",
    family: "mare",
    price: 59.9,
    oldPrice: 159.9,
    description:
      "Delicado e cheio de cor, o Biquíni Maré Rosa traz um toque descontraído para os dias de sol, praia e piscina.",
    image: `${BASE}assets/rosa.jpg`,
    images: [`${BASE}assets/rosa.jpg`, `${BASE}assets/rosa-costas.jpg`],
    colors: ["Rosa"],
    sizes,
    variants: mkVariants(["Rosa"]),
    badge: "7 cores",
    featured: true,
    print: "Liso",
  },
  {
    id: "p14",
    slug: "biquini-mare-verde",
    name: "Biquíni Maré Verde",
    category: "biquinis",
    family: "mare",
    price: 59.9,
    oldPrice: 159.9,
    description:
      "Com um tom inspirado na natureza, o Biquíni Maré Verde é uma opção fresca e versátil para aproveitar a temporada de verão.",
    image: `${BASE}assets/verde.jpg`,
    images: [`${BASE}assets/verde.jpg`, `${BASE}assets/verde-costas.jpg`],
    colors: ["Verde"],
    sizes,
    variants: mkVariants(["Verde"]),
    badge: "7 cores",
    featured: true,
    print: "Liso",
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

// Cor da bolinha de cada cor na página do produto
export const swatches: Record<string, string> = {
  Vermelho: "#c90533",
  Amarelo: "#e9b95b",
  Azul: "#1a2350",
  Marrom: "#89544d",
  Preto: "#181420",
  Rosa: "#e293ac",
  Verde: "#1e8661",
};

// Tabela ilustrativa: substitua pelas medidas reais das peças antes de vender.
export const sizeChart = [
  { size: "P", bust: "80–86 cm", waist: "60–68 cm", hips: "86–94 cm" },
  { size: "M", bust: "87–93 cm", waist: "69–76 cm", hips: "95–102 cm" },
  { size: "G", bust: "94–100 cm", waist: "77–84 cm", hips: "103–110 cm" },
  { size: "GG", bust: "101–108 cm", waist: "85–93 cm", hips: "111–118 cm" },
];

export const money = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

// Frete único para todo o Brasil, mostrado na página do produto, na sacola e no checkout
export const expressShipping = {
  name: "Frete expresso",
  days: "2 a 5 dias úteis",
  price: 0,
};

export const SINGLE_BIKINI_PRICE = 69.9;
export const TWO_BIKINI_UNIT_PRICE = 59.9;
export const KIT_PIECES = 2;
export type KitPair = { productId: string; variantId: string; color: string };
