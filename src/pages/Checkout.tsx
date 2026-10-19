import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CheckoutView, { CheckoutShell } from "../components/CheckoutView";

export default function Checkout() {
  const { items } = useCart();
  if (!items.length)
    return (
      <CheckoutShell backTo="/catalogo" backLabel="Ver a coleção">
        <main className="section-shell checkout-page">
          <div className="empty-state">
            <h2>Sua sacola está vazia.</h2>
            <Link to="/catalogo" className="button button-dark">
              VER A COLEÇÃO
            </Link>
          </div>
        </main>
      </CheckoutShell>
    );
  return (
    <CheckoutView items={items} backTo="/sacola" backLabel="Voltar à sacola" />
  );
}
