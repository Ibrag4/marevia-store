import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  Check,
  ChevronLeft,
  CircleAlert,
  CreditCard,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  ShoppingBag,
  Truck,
} from "lucide-react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  categories,
  expressShipping,
  KIT_PIECES,
  money,
  products,
  swatches,
} from "../data/products";
import type { Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import CheckoutView from "../components/CheckoutView";
import ThemeToggle from "../components/ThemeToggle";

// As fotos de cada produto seguem a ordem: frente, costas
const views = ["Frente", "Costas"];
const viewName = (i: number) => views[i] ?? `Foto ${i + 1}`;

// Ao trocar de cor, o tamanho, a foto e a 2ª cor do kit vão junto para a outra página
type Carried = { size?: string; view?: number; pair?: string } | null;

// Produtos da mesma família são o mesmo modelo em outra cor
const familyOf = (p: Product) =>
  p.family ? products.filter((x) => x.family === p.family) : [p];

// Peça de uma cor do modelo num tamanho (a 2ª cor do kit pode ser outro produto)
const pieceOf = (p: Product, color: string, size: string) => {
  for (const product of familyOf(p)) {
    const variant = product.variants.find(
      (v) => v.color === color && v.size === size
    );
    if (variant) return { product, variant };
  }
};

const motion = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

// A key reinicia o estado (cor, tamanho, checkout) ao trocar de produto
export default function ProductRoute() {
  const { slug } = useParams();
  return <ProductPage key={slug} slug={slug} />;
}

function ProductPage({ slug }: { slug?: string }) {
  const p = products.find((x) => x.slug === slug);
  const carried = useLocation().state as Carried;
  const [image, setImage] = useState(() =>
    Math.max(0, Math.min(carried?.view ?? 0, (p?.images.length ?? 1) - 1))
  );
  const [size, setSize] = useState(() => {
    const s = carried?.size;
    const available = p?.variants.some(
      (v) => v.size === s && v.color === p.colors[0] && v.stock > 0
    );
    return s && available ? s : "";
  });
  const [color, setColor] = useState(p?.colors[0] || "");
  // 2ª cor do kit: começa na próxima cor do modelo, diferente da cor da página
  const [pairColor, setPairColor] = useState(() => {
    if (!p) return "";
    const others = familyOf(p)
      .flatMap((x) => x.colors)
      .filter((c) => c !== p.colors[0]);
    if (carried?.pair && others.includes(carried.pair)) return carried.pair;
    return others[0] ?? p.colors[0];
  });
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [ctaVisible, setCtaVisible] = useState(true);
  const track = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const sizeGroup = useRef<HTMLDivElement>(null);
  const [params, setParams] = useSearchParams();
  const { addItem, count } = useCart();
  const { favorites, toggle } = useFavorites();
  const buying = params.get("comprar");

  // A galeria monta de novo ao voltar do checkout: reabre na foto que estava aberta.
  // Depende só de `buying` de propósito; durante o swipe quem manda é o scroll.
  useLayoutEffect(() => {
    const el = track.current;
    if (el) el.scrollLeft = image * el.clientWidth;
  }, [buying]);

  // No celular, a barra fixa de compra aparece quando os botões principais saem da tela
  useEffect(() => {
    const el = cta.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) =>
      setCtaVisible(e.isIntersecting)
    );
    io.observe(el);
    return () => io.disconnect();
  }, [buying]);

  if (!p)
    return (
      <main className="not-found section-shell">
        <span>404</span>
        <h1>Essa maré não existe.</h1>
        <Link className="button button-dark" to="/catalogo">
          VOLTAR À COLEÇÃO
        </Link>
      </main>
    );
  const variant = p.variants.find((v) => v.size === size && v.color === color);
  const pairPiece = size ? pieceOf(p, pairColor, size) : undefined;
  const pair = pairPiece && {
    productId: pairPiece.product.id,
    variantId: pairPiece.variant.id,
    color: pairColor,
  };
  const valid = () => {
    if (!size) {
      setNotice({ ok: false, text: "Escolha seu tamanho para continuar." });
      return false;
    }
    if (
      !variant ||
      variant.stock < qty ||
      !pairPiece ||
      pairPiece.variant.stock < qty
    ) {
      setNotice({
        ok: false,
        text: "Essa combinação está indisponível no momento.",
      });
      return false;
    }
    return true;
  };
  const add = () => {
    if (!valid()) return;
    addItem(p, size, color, qty, pair);
    setNotice({ ok: true, text: "Kit adicionado à sacola!" });
  };
  // Compra direta: o checkout abre na própria página (?comprar=variante&par=2ª peça&qtd=n),
  // sem passar pela sacola. O botão voltar do navegador retorna ao produto.
  const buyNow = () => {
    if (!valid() || !variant || !pairPiece) return;
    setNotice(null);
    setParams({
      comprar: variant.id,
      par: pairPiece.variant.id,
      qtd: String(qty),
    });
  };
  // Na barra fixa, sem tamanho escolhido, rola até os tamanhos e mostra o aviso
  const quickBuy = () => {
    if (!size)
      sizeGroup.current?.scrollIntoView({ behavior: motion(), block: "center" });
    buyNow();
  };
  // No celular as fotos ficam num carrossel: o botão rola até a foto
  // e o próprio scroll atualiza qual vista está marcada
  const show = (i: number) => {
    const el = track.current;
    el?.scrollTo({ left: i * el.clientWidth, behavior: motion() });
  };
  const onSwipe = () => {
    const el = track.current;
    if (el) setImage(Math.round(el.scrollLeft / el.clientWidth));
  };

  // Cada cor do modelo é um produto da mesma família; a ordem fica fixa entre as páginas
  const colorOptions = familyOf(p).flatMap((x) =>
    x.colors.map((c) => ({ color: c, slug: x.slug }))
  );
  // A 2ª cor é sempre diferente da 1ª (se o modelo só tiver uma cor, repete)
  const pairOptions = colorOptions
    .map((o) => o.color)
    .filter((c) => c !== color);
  if (!pairOptions.length) pairOptions.push(color);
  const category = categories.find((c) => c.slug === p.category)?.name;
  const discount = p.oldPrice
    ? Math.round((1 - p.price / p.oldPrice) * 100)
    : 0;
  // A última palavra do nome (a cor, nos biquínis Maré) vai em itálico
  const cut = p.name.lastIndexOf(" ");
  const fav = favorites.includes(p.id);

  const buyVariant = p.variants.find((v) => v.id === buying);
  const buyPair =
    buyVariant &&
    familyOf(p)
      .flatMap((product) => product.variants.map((variant) => ({ product, variant })))
      .find(
        (o) => o.variant.id === params.get("par") && o.variant.size === buyVariant.size
      );
  if (buyVariant && buyVariant.stock > 0 && buyPair && buyPair.variant.stock > 0) {
    const quantity = Math.min(
      buyVariant.stock,
      buyPair.variant.stock,
      Math.max(1, Math.floor(Number(params.get("qtd"))) || 1)
    );
    return (
      <CheckoutView
        items={[
          {
            productId: p.id,
            variantId: buyVariant.id,
            name: p.name,
            image: p.image,
            price: p.price,
            size: buyVariant.size,
            color: buyVariant.color,
            quantity,
            pair: {
              productId: buyPair.product.id,
              variantId: buyPair.variant.id,
              color: buyPair.variant.color,
            },
          },
        ]}
        backTo={`/produto/${p.slug}`}
        backLabel="Voltar ao produto"
      />
    );
  }
  return (
    <main
      className="pdp"
      style={{ "--tint": swatches[color] ?? "var(--coral)" } as CSSProperties}
    >
      <header className="pdp-header">
      </header>

      <div className="pdp-layout">
        <section
          className={`pdp-gallery ${p.images.length > 1 ? "" : "is-single"}`}
          aria-label="Fotos do produto"
        >
          <div className="pdp-track" ref={track} onScroll={onSwipe}>
            {p.images.map((src, i) => (
              <figure key={src}>
                <img
                  src={src}
                  alt={`${p.name}, ${viewName(i).toLowerCase()}`}
                  draggable={false}
                />
                {p.images.length > 1 && <figcaption>{viewName(i)}</figcaption>}
              </figure>
            ))}
          </div>
          {p.badge && <span className="pdp-badge">{p.badge}</span>}
          <button
            className={`pdp-heart ${fav ? "active" : ""}`}
            onClick={() => toggle(p.id)}
            aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={fav}
          >
            <Heart size={19} fill={fav ? "currentColor" : "none"} />
          </button>
          {p.images.length > 1 && (
            <div className="pdp-views" role="group" aria-label="Escolher foto">
              {p.images.map((src, i) => (
                <button
                  key={src}
                  aria-pressed={image === i}
                  onClick={() => show(i)}
                >
                  {viewName(i)}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="pdp-info">
          <span className="pdp-eyebrow">
            <span aria-hidden="true">✳</span> {category ?? "Moda praia"}
          </span>
          <h1 className="pdp-title">
            {cut > 0 ? (
              <>
                {p.name.slice(0, cut)} <em>{p.name.slice(cut + 1)}</em>
              </>
            ) : (
              p.name
            )}
          </h1>
          <span className="pdp-kit-tag">
            Kit com {KIT_PIECES} biquínis · escolha 2 cores
          </span>
          <div className="pdp-price">
            <strong>{money(p.price)}</strong>
            {discount > 0 && (
              <>
                <del>{money(p.oldPrice!)}</del>
                <span className="pdp-off">-{discount}%</span>
              </>
            )}
          </div>
          <p className="pdp-pay">
            Sai {money(p.price / KIT_PIECES)} cada peça
          </p>
          <p className="pdp-pay">
            <CreditCard size={15} /> Pix ou cartão de crédito no checkout
          </p>
          <p className="pdp-description">{p.description}</p>

          <div className="pdp-option">
            <div className="pdp-option-head">
              <strong>
                1ª cor: <span>{color}</span>
              </strong>
              {colorOptions.length > 1 && (
                <small>{colorOptions.length} cores</small>
              )}
            </div>
            <div className="pdp-swatches">
              {colorOptions.map((o) => {
                const style = {
                  "--swatch": swatches[o.color] ?? "var(--line-strong)",
                } as CSSProperties;
                // Cor de outro produto da família: troca de página, levando tamanho e foto
                return o.slug === p.slug ? (
                  <button
                    key={o.slug + o.color}
                    className="pdp-swatch"
                    style={style}
                    title={o.color}
                    aria-label={o.color}
                    aria-pressed={o.color === color}
                    onClick={() => {
                      // Se escolher a mesma cor da 2ª peça, as duas trocam de lugar
                      if (o.color === pairColor) setPairColor(color);
                      setColor(o.color);
                      setNotice(null);
                    }}
                  />
                ) : (
                  <Link
                    key={o.slug + o.color}
                    className="pdp-swatch"
                    style={style}
                    title={o.color}
                    aria-label={o.color}
                    to={`/produto/${o.slug}`}
                    state={{
                      size,
                      view: image,
                      pair: o.color === pairColor ? color : pairColor,
                    }}
                    replace
                  />
                );
              })}
            </div>
          </div>

          <div className="pdp-option">
            <div className="pdp-option-head">
              <strong>
                2ª cor do kit: <span>{pairColor}</span>
              </strong>
            </div>
            <div className="pdp-swatches">
              {pairOptions.map((c) => (
                <button
                  key={c}
                  className="pdp-swatch"
                  style={
                    {
                      "--swatch": swatches[c] ?? "var(--line-strong)",
                    } as CSSProperties
                  }
                  title={c}
                  aria-label={`2ª cor: ${c}`}
                  aria-pressed={c === pairColor}
                  onClick={() => {
                    setPairColor(c);
                    setNotice(null);
                  }}
                />
              ))}
            </div>
            <p className="pdp-kit-summary">
              <span
                className="pdp-kit-dot"
                style={{ background: swatches[color] }}
                aria-hidden="true"
              />
              <span
                className="pdp-kit-dot"
                style={{ background: swatches[pairColor] }}
                aria-hidden="true"
              />
              Seu kit: {color} + {pairColor}
              {size && ` · Tam. ${size}`}
            </p>
          </div>

          <div className="pdp-option" ref={sizeGroup}>
            <div className="pdp-option-head">
              <strong>
                Tamanho{size && <span>: {size}</span>}
              </strong>
              <Link to="/tabela-de-medidas">
                <Ruler size={14} /> Guia de medidas
              </Link>
            </div>
            <div className="pdp-sizes">
              {p.sizes.map((s) => {
                const available = p.variants.some(
                  (v) => v.size === s && v.color === color && v.stock > 0
                );
                return (
                  <button
                    key={s}
                    disabled={!available}
                    aria-pressed={size === s}
                    onClick={() => {
                      setSize(s);
                      setNotice(null);
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pdp-qty">
            <strong>Quantidade de kits</strong>
            <div className="pdp-stepper">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Diminuir"
              >
                <Minus size={15} />
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                aria-label="Aumentar"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div aria-live="polite">
            {notice && (
              <p className={`inline-notice ${notice.ok ? "" : "is-error"}`}>
                {notice.ok ? <Check size={16} /> : <CircleAlert size={16} />}
                {notice.text}
                {notice.ok && <Link to="/sacola">Ver sacola</Link>}
              </p>
            )}
          </div>

          <div className="pdp-cta" ref={cta}>
            <button className="pdp-buy" onClick={buyNow}>
              COMPRAR AGORA
            </button>
            <button className="pdp-add" onClick={add}>
              <ShoppingBag size={17} /> ADICIONAR KIT À SACOLA
            </button>
          </div>

          <ul className="pdp-perks">
            <li>
              <Truck size={19} />
              <div>
                <strong>
                  {expressShipping.name} · {expressShipping.days}
                </strong>
                <p>{money(expressShipping.price)} para todo o Brasil.</p>
              </div>
            </li>
            <li>
              <RotateCcw size={19} />
              <div>
                <strong>Trocas e devoluções</strong>
                <p>
                  Veja como funciona na nossa{" "}
                  <Link to="/trocas-e-devolucoes">política de trocas</Link>.
                </p>
              </div>
            </li>
          </ul>

          <details className="pdp-accordion">
            <summary>Descrição e cuidados</summary>
            <p>
              {p.description} Para maior durabilidade, siga as instruções de
              cuidado da etiqueta do produto real.
            </p>
          </details>
          <details className="pdp-accordion">
            <summary>Trocas e devoluções</summary>
            <p>
              Consulte nossa{" "}
              <Link to="/trocas-e-devolucoes">
                política de trocas e devoluções
              </Link>
              . Configure os termos oficiais antes de iniciar as vendas.
            </p>
          </details>
        </section>
      </div>

      {/* Barra fixa do celular: só aparece quando os botões de compra saem da tela */}
      <div
        className={`pdp-sticky ${ctaVisible ? "" : "is-visible"}`}
        inert={ctaVisible}
      >
        <span className="pdp-sticky-dot" aria-hidden="true" />
        <div>
          <strong>{p.name}</strong>
          <span>
            {money(p.price)} · kit {color} + {pairColor}
            {size && ` · ${size}`}
          </span>
        </div>
        <button onClick={quickBuy}>COMPRAR</button>
      </div>
    </main>
  );
}
