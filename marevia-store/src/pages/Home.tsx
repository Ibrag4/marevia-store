import {ArrowDownRight,ArrowRight} from 'lucide-react';
import {Link} from 'react-router-dom';
import {categories,products} from '../data/products';
import ProductGrid from '../components/ProductGrid';

export default function Home(){
 const featured=products.filter(p=>p.featured).slice(0,4);
 return <main>
  <section className="hero">
   <img src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=2200&q=90" alt="Praia em um dia de sol"/>
   <div className="hero-overlay"/>
   <div className="hero-copy"><span className="eyebrow light">MARÉVIA · MODA PRAIA</span><h1>Seu lugar<br/>é no <em>sol.</em></h1><p>Biquínis e maiôs para os dias que você quer repetir.</p><Link to="/catalogo" className="button button-light">VER A COLEÇÃO <ArrowRight size={16}/></Link></div>
   <div className="hero-note">FEITO PARA DIAS DE PRAIA <ArrowDownRight size={17}/></div><div className="hero-index">BIQUÍNIS · MAIÔS</div>
  </section>
  <section className="intro section-shell"><span className="eyebrow">A ESCOLHA É SUA</span><p>Estampa, cor ou básico.<br/><em>Vai no que tem a sua cara.</em></p><span className="sun-doodle">✳</span></section>
  <section className="section-shell category-section"><div className="section-heading"><div><span className="eyebrow">ESCOLHA POR TIPO</span><h2>Qual vai pra <em>sua mala?</em></h2></div><Link className="text-link" to="/catalogo">VER TODAS AS PEÇAS <ArrowRight size={16}/></Link></div>
   <div className="category-grid">{categories.map((c,i)=><Link to={`/categoria/${c.slug}`} className={`category-card category-${i+1}`} key={c.slug}><img src={c.image} alt={c.name} loading="lazy"/><div className="category-shade"/><div className="category-copy"><span>MARÉVIA / 0{i+1}</span><h3>{c.name}</h3><b>VER MODELOS ↗</b></div></Link>)}</div>
  </section>
  <section className="featured-section"><div className="section-shell"><div className="section-heading"><div><span className="eyebrow">PRA COMEÇAR</span><h2>Peças em <em>destaque.</em></h2></div><Link className="text-link" to="/catalogo">VER CATÁLOGO <ArrowRight size={16}/></Link></div><ProductGrid items={featured}/></div></section>
  <section className="editorial"><div className="editorial-image"><img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1500&q=85" alt="Mar e faixa de areia" loading="lazy"/><span className="editorial-stamp">SOL<br/>MAR<br/>✳</span></div><div className="editorial-copy"><span className="eyebrow">DICA DE PRAIA</span><h2>Uma peça.<br/>Vários <em>planos.</em></h2><p>O maiô também pode sair da areia: combina com short jeans, saia ou uma calça soltinha. Joga uma camisa por cima e pronto.</p><Link className="button button-dark" to="/categoria/maios">VER OS MAIÔS <ArrowRight size={16}/></Link><span className="editorial-doodle">〰</span></div></section>
  <section className="manifesto section-shell"><span className="eyebrow">SOBRE A MARÉVIA</span><h2>Praia, piscina<br/>e <em>vida real.</em></h2><p>A ideia é simples: encontrar uma peça que vista bem em você e dê vontade de usar muito. Aqui, o foco é moda praia — biquínis e maiôs em cores, estampas e modelos diferentes.</p><Link to="/catalogo" className="text-link">ENCONTRAR MINHA PEÇA <ArrowRight size={16}/></Link><span className="manifesto-flower">✳</span></section>
  <section className="social-strip"><div><span className="eyebrow">MARÉVIA NO SEU FEED</span><h2>Salva a ideia<br/><em>pro próximo sol.</em></h2><p>Escolha uma peça e compartilhe o link direto com quem quiser.</p></div><div className="social-tiles">{[products[0],products[2],products[4]].map(p=><Link to={`/produto/${p.slug}`} key={p.id}><img src={p.image} alt={p.name} loading="lazy"/></Link>)}</div></section>
 </main>
}
