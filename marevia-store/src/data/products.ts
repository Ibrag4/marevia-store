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
    "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1100&q=85",

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
      "Um vermelho marcante para acompanhar seus dias de sol. O Biquíni Maré Vermelha combina estilo, leveza e personalidade para curtir a praia ou a piscina.",
    image: "/assets/vermelho.png",
    images: ["/assets/vermelho.png"],
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
    price: 69.9,
    oldPrice: 159.9,
    description:
      "Um amarelo iluminado para trazer ainda mais cor aos dias de verão. O Biquíni Maré Amarelo é leve, versátil e perfeito para aproveitar o sol.",
    image: "/assets/amarelo.png",
    images: ["/assets/amarelo.png"],
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
    price: 69.9,
    oldPrice: 159.9,
    description:
      "Inspirado nos tons do mar, o Biquíni Maré Azul combina frescor e simplicidade em uma peça perfeita para os dias de praia e piscina.",
    image: "/assets/azul.png",
    images: ["/assets/azul.png"],
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
    price: 69.9,
    oldPrice: 159.9,
    description:
      "Em um tom terroso e moderno, o Biquíni Maré Marrom é uma escolha versátil para compor looks de praia com personalidade.",
    image: "/assets/marrom.png",
    images: ["/assets/marrom.png"],
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
    price: 69.9,
    oldPrice: 159.9,
    description:
      "Clássico e fácil de combinar, o Biquíni Maré Preto é ideal para quem gosta de uma peça atemporal que nunca sai de moda.",
    image: "/assets/preto.png",
    images: ["/assets/preto.png"],
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
    price: 69.9,
    oldPrice: 159.9,
    description:
      "Delicado e cheio de cor, o Biquíni Maré Rosa traz um toque descontraído para os dias de sol, praia e piscina.",
    image: "/assets/rosa.png",
    images: ["/assets/rosa.png"],
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
    price: 69.9,
    oldPrice: 159.9,
    description:
      "Com um tom inspirado na natureza, o Biquíni Maré Verde é uma opção fresca e versátil para aproveitar a temporada de verão.",
    image: "/assets/verde.png",
    images: ["/assets/verde.png"],
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
export const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
