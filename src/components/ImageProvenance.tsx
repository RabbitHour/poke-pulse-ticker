import type {CatalogEntry} from '@/hooks/useCatalog';
export default function ImageProvenance({entry}:{entry:CatalogEntry}){
 const p=entry.imageProvenance;
 return <p className="text-xs text-muted-foreground">{!entry.image?'Image missing · no exact provider photo':p?`Image: ${p.provider} · ${p.recordId||entry.cardId||entry.id} · ${p.match}${p.verifiedAt?' · Verified '+p.verifiedAt:''}`:'Image: existing catalog artwork · exact detail not yet checked'}</p>;
}