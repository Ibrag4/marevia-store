import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ChevronDown,
  CircleAlert,
  LoaderCircle,
  LockKeyhole,
  Search,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { expressShipping, money, products } from "../data/products";
import type { KitPair } from "../data/products";

// Cada linha é um kit: a peça principal + a 2ª cor (pair), no mesmo tamanho
export type CheckoutLine = {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  pair?: KitPair;
};

// Endereço do backend que cria o pagamento no Mercado Pago (ex.: /api/checkout).
const ENDPOINT = import.meta.env.VITE_CHECKOUT_ENDPOINT;

// Frete com valor e prazo sempre definidos (nunca "a combinar")
const SHIPPING: {
  id: string;
  name: string;
  detail: string;
  price: number;
}[] = [
  {
    id: "expresso",
    name: expressShipping.name,
    detail: expressShipping.days,
    price: expressShipping.price,
  },
];

const PAYMENTS = [
  {
    id: "card",
    name: "Cartão de crédito",
    brands: ["Visa", "Master", "Elo"],
    info: "",
  },
  {
    id: "pix",
    name: "Pix",
    brands: [],
    info: "O QR Code do Pix é gerado na próxima etapa.",
  },
  {
    id: "boleto",
    name: "Boleto bancário",
    brands: [],
    info: "A compensação do boleto pode levar até 3 dias úteis.",
  },
];

const UFS =
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(
    " "
  );

const digits = (v: string) => v.replace(/\D/g, "");
const maskCep = (v: string) =>
  digits(v).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
const maskCpf = (v: string) =>
  digits(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskPhone = (v: string) => {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d && `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  const split = d.length === 11 ? 7 : 6;
  return `(${d.slice(0, 2)}) ${d.slice(2, split)}-${d.slice(split)}`;
};
const MASKS: Record<string, (v: string) => string> = {
  cep: maskCep,
  cpf: maskCpf,
  phone: maskPhone,
};

const validCpf = (v: string) => {
  const d = digits(v);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const check = (n: number) => {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Number(d[i]) * (n + 1 - i);
    return ((sum * 10) % 11) % 10;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
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

const shippingLabel = (price: number) =>
  price === 0 ? "Grátis" : money(price);

const emptyForm = {
  email: "",
  firstName: "",
  lastName: "",
  cpf: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  phone: "",
};
type Form = typeof emptyForm;
type Errors = Partial<Record<keyof Form, string>>;
type Status = { kind: "demo" | "error"; text: string } | null;
type ViaCep = {
  erro?: boolean | string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

// Na ordem da tela, para focar o primeiro campo com erro
const REQUIRED: [keyof Form, string][] = [
  ["email", "Insira um e-mail"],
  ["firstName", "Insira um nome"],
  ["lastName", "Insira um sobrenome"],
  ["cpf", "Insira um CPF"],
  ["cep", "Insira um CEP"],
  ["street", "Insira um endereço"],
  ["number", "Insira o número"],
  ["district", "Insira um bairro"],
  ["city", "Insira uma cidade"],
  ["state", "Selecione um estado"],
  ["phone", "Insira um celular"],
];

const validate = (f: Form) => {
  const e: Errors = {};
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()))
    e.email = "Insira um e-mail válido";
  if (f.cpf && !validCpf(f.cpf)) e.cpf = "Insira um CPF válido";
  if (f.cep && digits(f.cep).length !== 8) e.cep = "Insira um CEP válido";
  if (f.phone && digits(f.phone).length < 10)
    e.phone = "Insira um celular válido";
  for (const [k, msg] of REQUIRED) if (!f[k].trim()) e[k] = msg;
  return e;
};

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p className="ck-error" id={id}>
      <CircleAlert size={14} />
      {children}
    </p>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  error?: string;
};

// Campo com rótulo flutuante: o rótulo sobe quando o campo tem valor
function Field({ label, error, className = "", ...input }: FieldProps) {
  const id = `ck-${input.name}`;
  return (
    <div className={`ck-field ${className} ${error ? "has-error" : ""}`}>
      <input
        id={id}
        placeholder=" "
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...input}
      />
      <label htmlFor={id}>{label}</label>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  name: string;
  label: string;
  error?: string;
};

function SelectField({
  label,
  error,
  className = "",
  children,
  ...select
}: SelectProps) {
  const id = `ck-${select.name}`;
  return (
    <div
      className={`ck-field is-select ${className} ${error ? "has-error" : ""}`}
    >
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...select}
      >
        {children}
      </select>
      <label htmlFor={id}>{label}</label>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

function RedirectIcon() {
  return (
    <svg
      className="ck-redirect"
      viewBox="0 0 100 54"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="62" height="52" rx="5" />
      <path d="M1 13h62" />
      <circle cx="9" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="21" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <path d="M72 33h25m-8-8 8 8-8 8" strokeLinecap="round" />
    </svg>
  );
}

type Address = {
  street: string;
  district: string;
  city: string;
  state: string;
};
type BrasilApiCep = {
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
};
type CepStatus = "idle" | "loading" | "found" | "invalid" | "notfound" | "error";

const CEP_ERRORS: Partial<Record<CepStatus, string>> = {
  invalid: "Insira um CEP com 8 números",
  notfound: "CEP não encontrado. Confira os números ou preencha o endereço",
};

// Requisição com limite de tempo, para cair na API reserva se a principal travar
async function request(url: string, signal: AbortSignal) {
  const ctrl = new AbortController();
  const stop = () => ctrl.abort();
  const timer = setTimeout(stop, 5000);
  signal.addEventListener("abort", stop);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", stop);
  }
}

// Busca o endereço pelo CEP: ViaCEP como principal e BrasilAPI como reserva.
// Retorna null quando nenhuma das duas conhece o CEP.
async function lookupCep(
  cep: string,
  signal: AbortSignal
): Promise<Address | null> {
  try {
    const r = await request(`https://viacep.com.br/ws/${cep}/json/`, signal);
    const d = r.ok ? ((await r.json()) as ViaCep) : null;
    if (d && !d.erro)
      return {
        street: d.logradouro ?? "",
        district: d.bairro ?? "",
        city: d.localidade ?? "",
        state: d.uf ?? "",
      };
  } catch (e) {
    if (signal.aborted) throw e;
  }
  // ViaCEP fora do ar ou sem esse CEP: tenta a BrasilAPI
  const r = await request(`https://brasilapi.com.br/api/cep/v1/${cep}`, signal);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Falha ao buscar o CEP (${r.status})`);
  const d = (await r.json()) as BrasilApiCep;
  return {
    street: d.street ?? "",
    district: d.neighborhood ?? "",
    city: d.city ?? "",
    state: d.state ?? "",
  };
}

// Moldura do checkout: cabeçalho enxuto
export function CheckoutShell({
  backTo,
  backLabel,
  children,
}: {
  backTo: string;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="ck">
      <header className="ck-header">
        <div>
          <div className="ck-header-actions">
            <Link
              to={backTo}
              className="ck-bag"
              aria-label={backLabel}
              title={backLabel}
            >
              <ShoppingBag />
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

type Props = { items: CheckoutLine[]; backTo: string; backLabel: string };

export default function CheckoutView({ items, backTo, backLabel }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [shipping, setShipping] = useState(SHIPPING[0].id);
  const [payment, setPayment] = useState(PAYMENTS[0].id);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);
  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");
  const cepCtrl = useRef<AbortController | null>(null);

  // Os erros só aparecem depois da primeira tentativa de finalizar
  const errors: Errors = submitted ? validate(form) : {};
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const savings = items.reduce((s, i) => {
    const old = products.find((p) => p.id === i.productId)?.oldPrice;
    return old && old > i.price ? s + (old - i.price) * i.quantity : s;
  }, 0);
  const method = SHIPPING.find((s) => s.id === shipping) ?? SHIPPING[0];
  const total = subtotal + method.price;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // Cancela uma busca de CEP pendente ao sair da página
  useEffect(() => () => cepCtrl.current?.abort(), []);

  // Busca o CEP e preenche endereço, bairro, cidade e estado.
  // O foco só muda quando a busca vem do botão, não enquanto a pessoa digita.
  const searchCep = async (value: string, focusNext = false) => {
    cepCtrl.current?.abort();
    const cep = digits(value);
    if (cep.length !== 8) {
      setCepStatus("invalid");
      document.getElementById("ck-cep")?.focus();
      return;
    }
    const ctrl = new AbortController();
    cepCtrl.current = ctrl;
    setCepStatus("loading");
    try {
      const addr = await lookupCep(cep, ctrl.signal);
      if (ctrl.signal.aborted) return;
      if (!addr) {
        setCepStatus("notfound");
        return;
      }
      // Substitui o endereço anterior: ele pertencia a outro CEP
      setForm((f) => ({ ...f, ...addr }));
      setCepStatus("found");
      // Leva ao próximo campo que falta (CEPs gerais de cidade não trazem a rua)
      const nextField = !addr.street
        ? "ck-street"
        : !form.number
        ? "ck-number"
        : null;
      if (focusNext && nextField) document.getElementById(nextField)?.focus();
    } catch {
      if (!ctrl.signal.aborted) setCepStatus("error");
    }
  };

  const update = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const mask = MASKS[name];
    const next = mask ? mask(value) : value;
    setForm((f) => ({ ...f, [name]: next }));
    // Busca o endereço assim que o CEP fica completo
    if (name === "cep" && digits(next) !== digits(form.cep)) {
      if (digits(next).length === 8) void searchCep(next);
      else {
        cepCtrl.current?.abort();
        setCepStatus("idle");
      }
    }
  };

  // Props comuns de cada campo do formulário
  const bind = (name: keyof Form) => ({
    name,
    value: form[name],
    onChange: update,
    error: errors[name],
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setStatus(null);
    const found = validate(form);
    const first = (Object.keys(emptyForm) as (keyof Form)[]).find(
      (k) => found[k]
    );
    if (first) {
      document.getElementById(`ck-${first}`)?.focus();
      return;
    }
    if (!ENDPOINT) {
      setStatus({
        kind: "error",
        text: "Não foi possível concluir o pedido agora. Tente novamente mais tarde.",
      });
      return;
    }
    setSending(true);
    const { email, firstName, lastName, cpf, phone, ...address } = form;
    try {
      // Preços não vão no pedido: o servidor calcula o total a partir do banco
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            pairProductId: i.pair?.productId,
            pairVariantId: i.pair?.variantId,
            quantity: i.quantity,
          })),
          customer: { email, firstName, lastName, cpf, phone, newsletter },
          address,
          shippingMethod: shipping,
          paymentMethod: payment,
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
    <CheckoutShell backTo={backTo} backLabel={backLabel}>

      <button
        type="button"
        className="ck-summary-toggle"
        aria-expanded={summaryOpen}
        aria-controls="ck-summary"
        onClick={() => setSummaryOpen((o) => !o)}
      >
        <span>
          {summaryOpen ? "Ocultar resumo do pedido" : "Resumo do pedido"}
          <ChevronDown size={16} />
        </span>
        <strong>{money(total)}</strong>
      </button>

      <div className="ck-body">
        <main className="ck-main">
          <form onSubmit={submit} noValidate>
            <section className="ck-section">
              <h2>Contato</h2>
              <Field
                {...bind("email")}
                label="E-mail"
                type="email"
                autoComplete="email"
                inputMode="email"
              />
              <label className="ck-check">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                />
                Quero receber novidades e ofertas por e-mail
              </label>
            </section>

            <section className="ck-section">
              <h2>Entrega</h2>
              <div className="ck-grid">
                <SelectField
                  name="country"
                  label="País/Região"
                  className="span-2"
                  defaultValue="BR"
                  autoComplete="country"
                >
                  <option value="BR">Brasil</option>
                </SelectField>
                <Field
                  {...bind("firstName")}
                  label="Nome"
                  autoComplete="given-name"
                />
                <Field
                  {...bind("lastName")}
                  label="Sobrenome"
                  autoComplete="family-name"
                />
                <Field
                  {...bind("cpf")}
                  label="CPF"
                  className="span-2"
                  inputMode="numeric"
                />
                <div className="ck-cep span-2">
                  <div className="ck-cep-row">
                    <Field
                      {...bind("cep")}
                      error={errors.cep ?? CEP_ERRORS[cepStatus]}
                      label="CEP"
                      inputMode="numeric"
                      autoComplete="postal-code"
                    />
                    <button
                      type="button"
                      id="ck-cep-search"
                      aria-busy={cepStatus === "loading"}
                      onClick={() => void searchCep(form.cep, true)}
                    >
                      {cepStatus === "loading" ? (
                        <LoaderCircle size={17} className="ck-spin" />
                      ) : (
                        <Search size={17} />
                      )}
                      Buscar
                    </button>
                  </div>
                  <div className="ck-cep-meta">
                    <p
                      aria-live="polite"
                      className={cepStatus === "found" ? "is-found" : ""}
                    >
                      {cepStatus === "loading" && "Buscando endereço..."}
                      {cepStatus === "found" && (
                        <>
                          <Check size={14} />
                          Endereço preenchido. Confira e informe o número.
                        </>
                      )}
                      {cepStatus === "error" &&
                        "Não foi possível buscar agora. Preencha o endereço."}
                      {CEP_ERRORS[cepStatus] && (
                        <span className="sr-only">{CEP_ERRORS[cepStatus]}</span>
                      )}
                    </p>
                    <a
                      href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Não sei meu CEP
                    </a>
                  </div>
                </div>
                <Field
                  {...bind("street")}
                  label="Endereço"
                  className="span-2"
                  autoComplete="address-line1"
                />
                <Field {...bind("number")} label="Número" />
                <Field
                  {...bind("complement")}
                  label="Complemento (opcional)"
                  autoComplete="address-line2"
                />
                <Field {...bind("district")} label="Bairro" className="span-2" />
                <Field
                  {...bind("city")}
                  label="Cidade"
                  autoComplete="address-level2"
                />
                <SelectField
                  {...bind("state")}
                  label="Estado"
                  autoComplete="address-level1"
                >
                  <option value="" disabled hidden />
                  {UFS.map((uf) => (
                    <option key={uf}>{uf}</option>
                  ))}
                </SelectField>
                <Field
                  {...bind("phone")}
                  label="Celular"
                  className="span-2"
                  type="tel"
                  autoComplete="tel-national"
                />
              </div>
            </section>
            <section className="ck-section">
              <h2>Frete</h2>
                <div className="ck-options" role="radiogroup">
                  {SHIPPING.map((s) => (
                    <label
                      key={s.id}
                      className={`ck-option ${
                        shipping === s.id ? "is-selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={shipping === s.id}
                        onChange={() => setShipping(s.id)}
                      />
                      <span className="ck-option-text">
                        {s.name}
                        <small>{s.detail}</small>
                      </span>
                      <strong>{shippingLabel(s.price)}</strong>
                    </label>
                  ))}
                </div>
            </section>

            <section className="ck-section">
              <h2>Pagamento</h2>
              <p className="ck-sub">
                Todas as transações são seguras e criptografadas.
              </p>
              <div className="ck-options" role="radiogroup">
                {PAYMENTS.map((m) => (
                  <div
                    key={m.id}
                    className={`ck-option-wrap ${
                      payment === m.id ? "is-selected" : ""
                    }`}
                  >
                    <label className="ck-option">
                      <input
                        type="radio"
                        name="payment"
                        checked={payment === m.id}
                        onChange={() => setPayment(m.id)}
                      />
                      <span className="ck-option-text">{m.name}</span>
                      {m.brands.length > 0 && (
                        <span className="ck-brands" aria-hidden="true">
                          {m.brands.map((b) => (
                            <span key={b}>{b}</span>
                          ))}
                        </span>
                      )}
                    </label>
                    {payment === m.id && (
                      <div className="ck-option-body">
                        <RedirectIcon />
                        <p>
                          Ao clicar em “Finalizar pedido”, o pagamento abre no
                          ambiente seguro do Mercado Pago.
                          {m.info && <> {m.info}</>}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <button className="ck-pay" type="submit" disabled={sending}>
              {sending ? "Abrindo pagamento..." : "Finalizar pedido"}
            </button>
            <div aria-live="polite">
              {status && (
                <p className={`ck-status is-${status.kind}`}>
                  <CircleAlert size={16} />
                  {status.text}
                </p>
              )}
            </div>
            <p className="ck-legal">
              <LockKeyhole size={13} /> Ao finalizar, você concorda com a nossa{" "}
              <Link to="/politica-de-privacidade" target="_blank">
                política de privacidade
              </Link>
              .
            </p>
          </form>

          <footer className="ck-footer">
            <Link to="/trocas-e-devolucoes">Trocas e devoluções</Link>
            <Link to="/politica-de-privacidade">Política de privacidade</Link>
            <a href="mailto:oi@marevia.com.br">Contato</a>
          </footer>
        </main>

        <aside
          id="ck-summary"
          className={`ck-summary ${summaryOpen ? "is-open" : ""}`}
          aria-label="Resumo do pedido"
        >
          <div className="ck-summary-inner">
            <ul className="ck-lines">
              {items.map((i) => (
                <li key={i.productId + i.variantId + (i.pair?.variantId ?? "")}>
                  <div className="ck-thumb">
                    <img src={i.image} alt="" />
                    <span aria-label={`Quantidade: ${i.quantity}`}>
                      {i.quantity}
                    </span>
                  </div>
                  <div className="ck-line-info">
                    <strong>{i.name}</strong>
                    <small>
                      Kit 2 peças: {i.color}
                      {i.pair && ` + ${i.pair.color}`} / {i.size}
                    </small>
                  </div>
                  <span>{money(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>

            <dl className="ck-totals">
              <div>
                <dt>
                  Subtotal · {count} {count === 1 ? "kit" : "kits"}
                </dt>
                <dd>{money(subtotal)}</dd>
              </div>
              <div>
                <dt>
                  {method.name} · {method.detail}
                </dt>
                <dd>{shippingLabel(method.price)}</dd>
              </div>
              <div className="ck-total">
                <dt>Total</dt>
                <dd>
                  <small>BRL</small>
                  {money(total)}
                </dd>
              </div>
              {savings > 0 && (
                <div className="ck-savings">
                  <dt>
                    <Tag size={14} /> Economia total
                  </dt>
                  <dd>{money(savings)}</dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </CheckoutShell>
  );
}
