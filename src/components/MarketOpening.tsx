import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import { CardImage } from "./CardImage";
import { CATALOG_HREF, CATALOG_LABEL } from "@/lib/catalogNavigation";

export default function MarketOpening() {
  const catalog = useCatalog();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [epoch, setEpoch] = useState(() => Math.floor(Date.now() / 1800000));
  useEffect(() => { const timer = setInterval(() => setEpoch(Math.floor(Date.now() / 1800000)), 30000); return () => clearInterval(timer); }, []);
  const cards = useMemo(() => {
    const seen = new Set<string>();
    return (catalog.data?.entries ?? []).filter(e => e.kind === "raw" && e.image && e.market != null && Number.isFinite(e.market) && e.market > 0)
      .sort((a,b) => b.market! - a.market!).filter(e => {const key=e.cardId||e.id; if(seen.has(key)) return false; seen.add(key); return true;});
  }, [catalog.data]);
  const featured = useMemo(() => {
    const picks = ["Pikachu", "Mew", "Charizard"].map(name => cards.find(c => c.name === name));
    return picks.every(Boolean) ? picks : cards.slice(0,3);
  }, [cards]);
  const spotlight = cards.length ? cards[epoch % cards.length] : undefined;
  return <section className="market-opening collector-hero" aria-labelledby="opening-title">
    <div className="collector-hero-copy">
      <p className="collector-eyebrow"><Sparkles size={16} aria-hidden="true" /> FOR THE LOVE OF THE HUNT</p>
      <p className="collector-brand">Poké Pulse Ticker</p>
      <h1 id="opening-title">Find your next<br/><span>favorite Pokémon.</span></h1>
      <p className="collector-intro">From your first Pikachu to your grail Mew. Explore cards, compare available prices, and get to know your collection.</p>
      <form className="collector-search" onSubmit={e => {e.preventDefault(); navigate("/?q=" + encodeURIComponent(query.trim()) + "#catalog-search");}}>
        <Search aria-hidden="true" size={20}/>
        <label className="sr-only" htmlFor="hero-card-search">Search Pokémon cards and products</label>
        <input id="hero-card-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try Mew 30th Anniversary" maxLength={100}/>
        <button type="submit">Search <ArrowRight size={16} aria-hidden="true"/></button>
      </form>
      <nav aria-label="Market shortcuts" className="collector-shortcuts">
        <a href="#card-valuer" className="market-action opening-primary">Check a card value</a>
        <a href={CATALOG_HREF} className="market-action">{CATALOG_LABEL}</a>
        <Link to="/account" className="market-action">Free collector account</Link>
      </nav>
      <p className="collector-trust">Raw cards · Graded cards · Sealed products<br/>No account needed to search. Quotes show their source date.</p>
    </div>
    <div className="collector-showcase" aria-label="Featured Pokémon cards">
      <div className="collector-orbit" aria-hidden="true"/>
      <span className="collector-spark spark-one" aria-hidden="true">✦</span>
      <span className="collector-spark spark-two" aria-hidden="true">✦</span>
      <div className="collector-card-fan">
        {featured.map((card,i) => card && <Link key={card.id} className={"collector-fan-card card-"+i} to={"/catalog/"+encodeURIComponent(card.id)}>
          <CardImage src={card.image} alt={card.name + " — " + card.set} loading="eager" className="w-full"/>
          <span>{card.name}</span>
        </Link>)}
        {!featured.length && <div className="collector-empty"><Sparkles size={40}/><strong>Your next discovery starts here</strong><p>{catalog.isError ? "Card artwork is temporarily unavailable. Retry the catalog below." : "Loading the collector gallery…"}</p></div>}
      </div>
      {spotlight && <Link className="collector-spotlight" to={"/catalog/"+encodeURIComponent(spotlight.id)}>
        <span>ROTATING SPOTLIGHT</span><strong>{spotlight.name}</strong>
        <span>{spotlight.set} · #{spotlight.number} · {spotlight.variant}</span>
        <b>Provider quote: ${spotlight.market?.toFixed(2)}</b>
      </Link>}
    </div>
  </section>;
}
