import { useEffect, useRef, useState } from 'react';

// Provider-hosted quotes remain separate from our daily collectible observations.
export default function MarketComparison() {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const slot = document.createElement('div');
    slot.className = 'tradingview-widget-container__widget';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.textContent = JSON.stringify({colorTheme:'light',dateRange:'12M',locale:'en',width:'100%',height:500,showChart:true,showSymbolLogo:true,isTransparent:false,tabs:[{title:'Other markets',symbols:[{s:'FOREXCOM:SPXUSD',d:'S&P 500 reference CFD'},{s:'FOREXCOM:NSXUSD',d:'Nasdaq 100 reference CFD'},{s:'CMCMARKETS:GOLD',d:'Gold reference CFD'},{s:'BITSTAMP:BTCUSD',d:'Bitcoin / USD'}]}]});
    script.onerror = () => setFailed(true);
    host.replaceChildren(slot, script);
    return () => { script.onerror = null; host.replaceChildren(); };
  }, []);
  return <section className="space-y-3" aria-labelledby="other-markets-title"><h3 id="other-markets-title" className="font-bold text-xl">Compare with other markets</h3><p className="text-sm">Explore provider-updated stocks, gold and Bitcoin alongside the Pokémon indexes above. Compare the same date range and percentage change, not dollar prices. Index and gold instruments below are clearly labeled CFD references.</p><div ref={container} className={`tradingview-widget-container ${failed ? "hidden" : "min-h-[500px]"}`}/><p className="text-sm">{failed ? 'The market widget could not load. ' : ''}<a href="https://www.tradingview.com/markets/" target="_blank" rel="noopener noreferrer" className="underline">World markets by TradingView ↗</a>. Availability and delays depend on the instrument and provider. Pokémon quotes are daily releases; this is not a synchronized return or correlation calculation.</p></section>;
}
