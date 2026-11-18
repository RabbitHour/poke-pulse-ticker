import {expect,it} from 'vitest';
import {isCollectorCard,collectorCategory} from './collectorFocus';
import type {CatalogEntry} from '@/hooks/useCatalog';
const card={id:'tcg:1:Holofoil',name:'Pikachu',set:'Test',number:'1',kind:'raw',language:'en',market:10,image:'https://example.com/image.jpg'} as CatalogEntry;
it('includes explicit requested rarities and excludes common, missing metadata and non-English cards',()=>{
 for(const rarity of ['Illustration Rare','Special Illustration Rare','Ultra Rare','Rare Ultra','Hyper Rare','Promo'])expect(isCollectorCard({...card,rarity})).toBe(true);
 for(const rarity of ['Common','Uncommon','Rare','Double Rare',''])expect(isCollectorCard({...card,rarity})).toBe(false);
 expect(isCollectorCard({...card,rarity:'Ultra Rare',language:'ja'})).toBe(false);
 expect(isCollectorCard({...card,rarity:'Ultra Rare',image:''})).toBe(false);
 expect(isCollectorCard({...card,rarity:'Ultra Rare',market:null})).toBe(false);
 expect(isCollectorCard({...card,rarity:'Ultra Rare',kind:'digital'})).toBe(false);
});
it('recognizes explicit full-art and promo identities without inferring from price',()=>{
 expect(collectorCategory({...card,name:'Pikachu (Full Art)'})).toBe('Full art / illustration');
 expect(isCollectorCard({...card,set:'SV Black Star Promos'})).toBe(true);
 expect(isCollectorCard({...card,market:10000})).toBe(false);
});
