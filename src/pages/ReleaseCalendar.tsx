import {Link} from 'react-router-dom';
import {useCatalog} from '@/hooks/useCatalog';
export default function ReleaseCalendar(){
 const catalog=useCatalog();
 return <main id="main-content" className="max-w-4xl mx-auto p-5 sm:p-8 space-y-5">
  <h1 className="text-3xl font-bold">Release calendar & announcements</h1>
  <section className="terminal-card p-5 space-y-3"><h2 className="text-xl font-bold">Check the original announcement</h2><p>A verified release-calendar feed is not connected yet. Earlier undated or speculative schedule entries have been removed. We do not infer product release dates from price-feed timestamps or catalog appearances.</p><a href="https://www.pokemon.com/us/pokemon-news" className="market-action inline-block" target="_blank" rel="noopener noreferrer">Official Pokémon news</a><p className="text-sm">This opens the publisher’s news page; it is not an automatically monitored news feed.</p></section>
  <section className="terminal-card p-5 space-y-3"><h2 className="text-xl font-bold">Research sets already in the catalog</h2><p>Latest loaded price release: {catalog.data?.sourceUpdated||'Loading…'}. This is the provider’s quote date, not a set launch date.</p><Link to="/sets" className="market-action inline-block">Browse English sets</Link><Link to="/#daily-pulse" className="market-action inline-block ml-3">Daily price changes</Link></section>
 </main>;
}
