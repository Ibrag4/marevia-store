import { useState } from "react";
import { Check, Heart, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { money, products } from "../data/products";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import ProductGrid from "../components/ProductGrid";
export default function ProductPage() {
  const { slug } = useParams();
  const p = products.find((x) => x.slug === slug);
  const [image, setImage] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState(p?.colors[0] || "");
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState("");
  const { addItem } = useCart();
  const { favorites, toggle } = useFavorites();
  const nav = useNavigate();
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
  const add = (checkout = false) => {
    if (!size) {
      setNotice("Escolha seu tamanho para continuar.");
      return;
    }
    if (!variant || variant.stock < qty) {
      setNotice("Essa combinação está indisponível no momento.");
      return;
    }
    addItem(p, size, color, qty);
    setNotice(
      checkout
        ? "Peça adicionada. Vamos finalizar sua compra!"
        : "Adicionado à sacola!"
    );
    if (checkout) nav("/checkout");
  };
  return (
    <main className="product-page section-shell">
      <div className="breadcrumbs">
        <Link to="/">Início</Link> / <Link to="/catalogo">Coleção</Link> /{" "}
        <span>{p.name}</span>
      </div>
      <div className="product-detail">
        <div className="product-gallery">
          <div className="gallery-thumbs">
            {p.images.map((src, i) => (
              <button
                className={image === i ? "selected" : ""}
                onClick={() => setImage(i)}
                key={src + i}
                aria-label={`Ver foto ${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
          <div className="gallery-main">
            <img src={p.images[image]} alt={p.name} />
            <button
              className={`gallery-heart ${
                favorites.includes(p.id) ? "active" : ""
              }`}
              onClick={() => toggle(p.id)}
              aria-label="Favoritar produto"
            >
              <Heart
                fill={favorites.includes(p.id) ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
        <div className="product-purchase">
          <span className="eyebrow">MARÉVIA · MODA PRAIA</span>
          <h1>
            {p.name}
            <em>.</em>
          </h1>
          <div className="detail-price">
            {p.oldPrice && <del>{money(p.oldPrice)}</del>}
            <strong>{money(p.price)}</strong>
          </div>
          <p className="installments">
            Consulte as opções de pagamento no checkout.
          </p>
          <p className="detail-description">{p.description}</p>
          <div className="option-group">
            <div className="option-heading">
              <strong>Cor</strong>
              <span>{color}</span>
            </div>
            <div className="color-options">
              {p.colors.map((c) => (
                <button
                  key={c}
                  className={color === c ? "selected" : ""}
                  onClick={() => {
                    setColor(c);
                    setNotice("");
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="option-group">
            <div className="option-heading">
              <strong>Tamanho</strong>
              <Link to="/tabela-de-medidas">Guia de medidas ↗</Link>
            </div>
            <div className="size-options">
              {p.sizes.map((s) => {
                const available = p.variants.some(
                  (v) => v.size === s && v.color === color && v.stock > 0
                );
                return (
                  <button
                    key={s}
                    disabled={!available}
                    className={size === s ? "selected" : ""}
                    onClick={() => {
                      setSize(s);
                      setNotice("");
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="quantity-row">
            <strong>Quantidade</strong>
            <div className="quantity-control">
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
          {notice && (
            <p className="inline-notice">
              <Check size={16} />
              {notice}
            </p>
          )}
          <button
            className="button button-dark add-button"
            onClick={() => add(false)}
          >
            <ShoppingBag size={17} /> ADICIONAR À SACOLA
          </button>
          <button
            className="button button-outline add-button"
            onClick={() => add(true)}
          >
            COMPRAR AGORA
          </button>
          <div className="shipping-note">
            <Truck size={20} />
            <div>
              <strong>Entrega para todo o Brasil</strong>
              <p>
                O prazo e o valor do frete serão informados conforme a
                configuração de entrega no checkout.
              </p>
            </div>
          </div>
          <details className="product-accordion">
            <summary>Descrição e cuidados</summary>
            <p>
              {p.description} Para maior durabilidade, siga as instruções de
              cuidado da etiqueta do produto real.
            </p>
          </details>
          <details className="product-accordion">
            <summary>Trocas e devoluções</summary>
            <p>
              Consulte nossa{" "}
              <Link to="/trocas-e-devolucoes">
                política de trocas e devoluções
              </Link>
              . Configure os termos oficiais antes de iniciar as vendas.
            </p>
          </details>
        </div>
      </div>
    </main>
  );
}
