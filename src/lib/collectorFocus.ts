import type {CatalogEntry} from '@/hooks/useCatalog';
// Explicit provider labels or explicit product descriptions only. Price never implies rarity.
export function collectorCategory(e:CatalogEntry):string|null {
 const r=(e.rarity??'').toLowerCase().replace(/[-_]/g,' ');
 const text=`${e.name} ${e.set}`;
 if(/special illustration|special art rare/.test(r))return 'Special illustration rare';
 if(/illustration rare|art rare/.test(r))return 'Illustration rare';
 if(/ultra rare|rare ultra/.test(r))return 'Ultra rare';
 if(/promo/i.test(r)||/\bpromos?\b/i.test(e.set))return 'Promo';
 if(/full art|alternate art|alt art|secret rare|rare secret|hyper rare|rainbow rare|rare rainbow|shiny ultra/.test(r))return 'Full art / special rarity';
 if(/\b(full art|alternate art|alt art|special illustration rare|illustration rare)\b/i.test(text))return 'Full art / illustration';
 if(/^(TG|GG)\d+/i.test(e.number))return 'Trainer / Galarian Gallery';
 return null;
}
export function isEnglishArtwork(e:CatalogEntry) {
 if(e.language&&e.language!=='en')return false;
 return Boolean(e.image && (e.language==='en'||e.imageProvenance?.language==='en'||/^https:\/\/assets\.tcgdex\.net\/en\//.test(e.image)));
}
export function isCollectorCard(e:CatalogEntry) {
 return e.kind==='raw'&&e.market!=null&&e.market>0&&isEnglishArtwork(e)&&collectorCategory(e)!==null;
}
