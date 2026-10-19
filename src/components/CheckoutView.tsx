import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  CircleAlert,
  LockKeyhole,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { money, products } from "../data/products";

export type CheckoutLine = {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
};

// Endereço do backend que cria o pagamento no Mercado Pago (ex.: /api/checkout).
// Sem ele, o checkout roda em modo de demonstração e não cria pedidos.
const ENDPOINT = import.meta.env.VITE_CHECKOUT_ENDPOINT;

// Configure as opções reais de entrega antes de vender. price: null = valor confirmado após o pedido.
const SHIPPING: {
  id: string;
  name: string;
  detail: string;
  price: number | null;
}[] = [
  {
    id: "padrao",
    name: "Entrega padrão",
    detail: "Prazo confirmado por e-mail após o pedido",
    price: null,
  },
];

const PAYMENTS = [
  { id: "card", name: "Cartão de crédito", info: "" },
  { id: "pix", name: "Pix", info: "O QR Code do Pix é gerado na próxima etapa." },
  {
    id: "boleto",
    name: "Boleto bancário",
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

const shippingLabel = (price: number | null) =>
  price === null ? "A calcular" : price === 0 ? "Grátis" : money(price);

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

export function CheckoutHeader({
  backTo,
  backLabel,
}: {
  backTo: string;
  backLabel: string;
}) {
  return (
    <header className="ck-header">
      <div>
        <Link to="/" className="wordmark">
          MARÉVIA<span>✳</span>
        </Link>
        <Link
          to={backTo}
          className="ck-bag"
          aria-label={backLabel}
          title={backLabel}
        >
          <ShoppingBag />
        </Link>
      </div>
    </header>
  );
}
