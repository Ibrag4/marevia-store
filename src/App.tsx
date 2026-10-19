import { Link, Route, Routes, useLocation, useParams } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import {
  AdminPage,
  FavoritesPage,
  NotFound,
  PolicyPage,
  SizeGuide,
} from "./pages/InfoPages";
import { useFavorites } from "./context/FavoritesContext";
import { products } from "./data/products";
function Favorites() {
  const { favorites } = useFavorites();
  return (
    <main className="section-shell catalog-page">
      <div className="catalog-heading">
        <span className="eyebrow">SEUS QUERIDINHOS</span>
        <h1>
          Favoritos<em>.</em>
        </h1>
      </div>
      <div className="product-grid">
        {products
          .filter((p) => favorites.includes(p.id))
          .map((p) => (
            <Link
              className="product-card"
              to={`/produto/${p.slug}`}
              key={p.id}
            >
              <div className="product-image-wrap">
                <img src={p.image} alt={p.name} />
              </div>
              <div className="product-info">
                <span className="product-name">{p.name}</span>
                <strong>
                  {p.price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </strong>
              </div>
            </Link>
          ))}
      </div>
      {!favorites.length && <FavoritesPage />}
    </main>
  );
}

export default function App() {
  const { pathname } = useLocation();
  // Produto e checkout têm layout próprio, sem o cabeçalho e o rodapé da loja
  const bareLayout =
    pathname.startsWith("/produto/") || pathname === "/checkout";

  return (
    <>
      {!bareLayout && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/categoria/:category" element={<CategoryRoute />} />
        <Route path="/produto/:slug" element={<ProductPage />} />
        <Route path="/busca" element={<Catalog />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/sacola" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/pedido/:id"
          element={
            <main className="section-shell info-page">
              <h1>
                Pedido<em>.</em>
              </h1>
              <p>
                O acompanhamento de pedidos será habilitado após a integração do
                backend.
              </p>
            </main>
          }
        />
        <Route path="/tabela-de-medidas" element={<SizeGuide />} />
        <Route
          path="/politica-de-privacidade"
          element={<PolicyPage kind="privacy" />}
        />
        <Route
          path="/trocas-e-devolucoes"
          element={<PolicyPage kind="returns" />}
        />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!bareLayout && <Footer />}
    </>
  );
}

function CategoryRoute() {
  const { category } = useParams();
  return <Catalog category={category} />;
}
