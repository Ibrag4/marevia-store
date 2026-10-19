import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import { CircleAlert, LockKeyhole } from "lucide-react";
import { money, type Product, type Variant } from "../data/products";

const UFS =
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(
    " "
  );

// Endereço do backend que cria o pagamento no Mercado Pago (ex.: /api/checkout).
// Enquanto não estiver configurado, o formulário roda em modo de demonstração e não cria pedidos.
const ENDPOINT = import.meta.env.VITE_CHECKOUT_ENDPOINT;

const digits = (v: string) => v.replace(/\D/g, "");
const maskCep = (v: string) =>
  digits(v).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
const maskPhone = (v: string) => {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d && `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  const split = d.length === 11 ? 7 : 6;
  return `(${d.slice(0, 2)}) ${d.slice(2, split)}-${d.slice(split)}`;
};

// Só redireciona para o ambiente do Mercado Pago
const isMercadoPago = (url: string) => {
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      /(^|\.)mercadopago\.com(\.br)?$/.test(u.hostname)
    );
  } catch {
    return false;
  }
};

type Status = { kind: "demo" | "error"; text: string } | null;
type Props = {
  product: Product;
  variant: Variant;
  quantity: number;
  onEdit: () => void;
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  cep: "",
  state: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
};

export default function ProductCheckout({
  product: p,
  variant,
  quantity,
  onEdit,
}: Props) {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtotal = p.price * quantity;
  const savings = p.oldPrice ? (p.oldPrice - p.price) * quantity : 0;

  // Ao abrir, leva até o formulário e move o foco para o título
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    rootRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "start",
    });
  }, []);

  const update = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const next =
      name === "cep"
        ? maskCep(value)
        : name === "phone"
        ? maskPhone(value)
        : value;
    setForm((f) => ({ ...f, [name]: next }));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    if (!ENDPOINT) {
      setStatus({
        kind: "demo",
        text: "Checkout em modo de demonstração: nenhum pedido foi criado e nenhuma cobrança foi feita. Configure o backend de pagamento para começar a vender.",
      });
      return;
    }
    setSending(true);
    const { name, email, phone, ...shipping } = form;
    try {
      // O preço não vai no pedido: o servidor calcula o total a partir do banco
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: p.id, variantId: variant.id, quantity }],
          customer: { name, email, phone },
          shipping,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        init_point?: string;
        error?: string;
      };
      if (res.ok && data.init_point && isMercadoPago(data.init_point)) {
        window.location.assign(data.init_point);
        return;
      }
      setStatus({
        kind: "error",
        text:
          data.error ??
          "Não foi possível iniciar o pagamento. Tente novamente em instantes.",
      });
    } catch {
      setStatus({
        kind: "error",
        text: "Sem conexão com o pagamento. Confira sua internet e tente de novo.",
      });
    }
    setSending(false);
  };

  return (
    <section
      className="pdp-checkout"
      ref={rootRef}
      aria-labelledby="pdp-checkout-title"
    >
      <span className="eyebrow">FINALIZAR COMPRA</span>
      <h2 id="pdp-checkout-title" ref={titleRef} tabIndex={-1}>
        Quase <em>lá.</em>
      </h2>
      <div className="pdp-order">
        <img src={p.image} alt="" />
        <div>
          <strong>{p.name}</strong>
          <p>
            {variant.color} · Tamanho {variant.size} · {quantity}{" "}
            {quantity === 1 ? "unidade" : "unidades"}
          </p>
          <button type="button" className="link-button" onClick={onEdit}>
            Alterar
          </button>
        </div>
        <span>{money(subtotal)}</span>
      </div>

      <form onSubmit={submit}>
        <fieldset>
          <legend>
            <span>1</span>Seus dados
          </legend>
          <div className="form-grid">
            <label className="wide-field">
              Nome completo
              <input
                name="name"
                value={form.name}
                onChange={update}
                required
                autoComplete="name"
              />
            </label>
            <label className="wide-field">
              E-mail
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={update}
                required
                autoComplete="email"
              />
            </label>
            <label className="wide-field">
              Celular
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={update}
                required
                autoComplete="tel-national"
                placeholder="(00) 00000-0000"
                pattern="\(\d{2}\) \d{4,5}-\d{4}"
                title="Informe o DDD e o número"
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <span>2</span>Entrega
          </legend>
          <div className="form-grid">
            <label>
              CEP
              <input
                name="cep"
                value={form.cep}
                onChange={update}
                required
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="00000-000"
                pattern="\d{5}-\d{3}"
                title="Use o formato 00000-000"
              />
            </label>
            <label>
              Estado
              <select
                name="state"
                value={form.state}
                onChange={update}
                required
                autoComplete="address-level1"
              >
                <option value="" disabled>
                  Selecione
                </option>
                {UFS.map((uf) => (
                  <option key={uf}>{uf}</option>
                ))}
              </select>
            </label>
            <label className="wide-field">
              Endereço
              <input
                name="street"
                value={form.street}
                onChange={update}
                required
                autoComplete="address-line1"
                placeholder="Rua, avenida..."
              />
            </label>
            <label>
              Número
              <input
                name="number"
                value={form.number}
                onChange={update}
                required
              />
            </label>
            <label>
              Complemento
              <input
                name="complement"
                value={form.complement}
                onChange={update}
                autoComplete="address-line2"
                placeholder="Opcional"
              />
            </label>
            <label>
              Bairro
              <input
                name="district"
                value={form.district}
                onChange={update}
                required
              />
            </label>
            <label>
              Cidade
              <input
                name="city"
                value={form.city}
                onChange={update}
                required
                autoComplete="address-level2"
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <span>3</span>Pagamento
          </legend>
          <p className="payment-note">
            <LockKeyhole size={18} />
            Na próxima etapa você escolhe a forma de pagamento no ambiente
            seguro do Mercado Pago.
          </p>
        </fieldset>

        <div className="pdp-totals">
          <div>
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          {savings > 0 && (
            <div className="savings">
              <span>Você economiza</span>
              <span>{money(savings)}</span>
            </div>
          )}
          <div>
            <span>Frete</span>
            <span>A definir</span>
          </div>
          <div className="total">
            <span>Total sem frete</span>
            <strong>{money(subtotal)}</strong>
          </div>
        </div>

        <label className="terms-check">
          <input type="checkbox" required />
          <span>
            Li e aceito os{" "}
            <Link to="/politica-de-privacidade" target="_blank">
              termos e a política de privacidade
            </Link>
            .
          </span>
        </label>
        <button
          className="button button-dark full-button"
          type="submit"
          disabled={sending}
        >
          {sending
            ? "ABRINDO PAGAMENTO..."
            : `FINALIZAR COMPRA · ${money(subtotal)}`}
        </button>
        <div aria-live="polite">
          {status && (
            <p
              className={
                status.kind === "demo" ? "demo-warning" : "checkout-error"
              }
            >
              <CircleAlert size={16} />
              {status.text}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
