// 2026-11-15 — David Noyes — Clock-based alphabetical market ticker.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CATALOG_HREF, CATALOG_LABEL } from "@/lib/catalogNavigation";
import type { CardData } from "@/data/marketData";
import { useCatalog, type CatalogEntry } from "@/hooks/useCatalog";
import { useObservedProducts } from "@/hooks/useObservedProducts";
import { catalogSymbol } from "@/lib/catalogSymbols";
import { collectorCategory, isCollectorCard } from "@/lib/collectorFocus";
import { CardImage } from "./CardImage";

// Fixed widths prevent long names or image loading from changing scroll speed.
const ITEM_WIDTH = 280;
const ITEM_TIME_MS = 8000;
const VISIBLE_ITEMS = 8;
const EMPTY_CARDS: CardData[] = [];
const EPOCH = Date.UTC(2026, 0, 1);

const alphabet = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});

function compareEntries(a: CatalogEntry, b: CatalogEntry) {
  // Physical products precede digital products in the combined view.
  return (
    Number(a.kind === "digital") - Number(b.kind === "digital") ||
    alphabet.compare(a.name, b.name) ||
    alphabet.compare(a.set, b.set) ||
    alphabet.compare(a.number ?? "", b.number ?? "") ||
    alphabet.compare(a.variant ?? a.grade ?? "", b.variant ?? b.grade ?? "") ||
    alphabet.compare(a.id, b.id)
  );
}

export default function TickerBar({
  cards = EMPTY_CARDS,
}: {
  cards?: CardData[];
}) {
  const catalog = useCatalog();
  const observed = useObservedProducts(cards);
  const [category, setCategory] = useState("all");
  const [unavailable,setUnavailable]=useState<Set<string>>(()=>new Set());
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [clock, setClock] = useState(() => Date.now());
  const trackRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef(clock);

  useEffect(() => {
    const preference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  const stopped = paused || focused || reducedMotion;

  const entries = useMemo(() => {
    const fallback: CatalogEntry[] = cards.map(card => ({
      id: [
        "fallback",
        card._apiId ?? card.name,
        card.set,
        card.number,
        card._variant ?? "",
      ].join(":"),
      cardId: card._apiId,
      name: card.name,
      set: card.set,
      setId: card.setCode || card.set,
      number: card.number,
      kind: "raw",
      category: null,
      market: card.market,
      image: card._image || "",
      sourceUrl: "",
      sourceUpdated: null,
      variant: card._variant,
    }));

    const graded: CatalogEntry[] = observed.graded.map(card => ({
      id: [
        "graded",
        card.name,
        card.set,
        card.number,
        card.grade,
      ].join(":"),
      name: card.name,
      set: card.set,
      setId: card.setCode || card.set,
      number: card.number,
      kind: "graded",
      grade: card.grade,
      category: null,
      market: card.market,
      image: card._image || "",
      sourceUrl: "",
      sourceUpdated: observed.gradedAt || null,
    }));

    const unique = new Map<string, CatalogEntry>();

    for (const entry of [
      ...(catalog.data?.entries ?? fallback),
      ...graded,
    ]) {
      const matches = isCollectorCard(entry) && !unavailable.has(entry.image) &&
        (category === 'all' || collectorCategory(entry) === category);

      if (matches && !unique.has(entry.id)) {
        unique.set(entry.id, entry);
      }
    }

    return [...unique.values()].sort(compareEntries);
  }, [cards, catalog.data, observed.graded, observed.gradedAt, category, unavailable]);

  // The clock determines the position even when no visitor has the page open.
  const position = Math.max(0, clock - EPOCH) / ITEM_TIME_MS;
  const step = Math.floor(position);
  const fraction = position - step;
  const start = entries.length ? step % entries.length : 0;

  // Animate only the transform each frame. React updates once per card boundary,
  // avoiding dozens of full ticker/data-hook renders every second.
  useLayoutEffect(() => {
    clockRef.current = clock;
    if (trackRef.current) trackRef.current.style.transform = `translate3d(-${fraction * ITEM_WIDTH}px,0,0)`;
  }, [clock, fraction, category]);

  useEffect(() => {
    if (stopped) return;
    let frame = 0;
    const animate = () => {
      const now = Date.now();
      const next = Math.max(0, now - EPOCH) / ITEM_TIME_MS;
      if (Math.floor(next) !== Math.floor(Math.max(0, clockRef.current - EPOCH) / ITEM_TIME_MS)) {
        clockRef.current = now;
        setClock(now);
      } else if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(-${(next % 1) * ITEM_WIDTH}px,0,0)`;
      }
      frame = window.requestAnimationFrame(animate);
    };
    // Reopening a background tab resumes at the shared wall-clock position.
    setClock(Date.now());
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [stopped, category, entries.length]);

  // Render a small moving window instead of thousands of image elements.
  const visible = entries.length
    ? Array.from({ length: VISIBLE_ITEMS }, (_, offset) => ({
        entry: entries[(start + offset) % entries.length],
        slot: step + offset,
        duplicate: offset >= entries.length,
      }))
    : [];

  const catalogIds = useMemo(
    () => new Set(catalog.data?.entries.map(entry => entry.id) ?? []),
    [catalog.data],
  );

  function recordHref(entry: CatalogEntry) {
    if (catalogIds.has(entry.id)) {
      return "/catalog/" + encodeURIComponent(entry.id);
    }
    if (entry.kind === "raw" && entry.cardId) {
      const variant = entry.variant
        ? "?variant=" + encodeURIComponent(entry.variant)
        : "";
      return "/card/" + encodeURIComponent(entry.cardId) + variant;
    }
    return null;
  }

  return (
    <section className="market-tape" aria-label="Alphabetical market ticker">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-xs">ENGLISH COLLECTOR TAPE</strong>
          <label htmlFor="tape-category" className="sr-only">
            Ticker category
          </label>
          <select
            id="tape-category"
            className="rounded border border-border bg-card p-1 text-xs"
            value={category}
            onChange={event => setCategory(event.target.value)}
          >
            <option value="all">English collector cards</option>
            {['Special illustration rare','Illustration rare','Ultra rare','Promo','Full art / special rarity','Full art / illustration','Trainer / Galarian Gallery'].map(label=><option key={label} value={label}>{label}</option>)}
          </select>
          <span className="text-xs text-muted-foreground">
            {entries.length.toLocaleString()} indexed · A–Z
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused(value => !value)}
              aria-pressed={paused}
              className="rounded border border-border px-3 py-1"
            >
              {paused ? "Resume" : "Pause"}
            </button>
          )}
          {stopped && (
            <>
              <button
                type="button"
                onClick={() => setClock(value => value - ITEM_TIME_MS)}
                aria-label="Previous ticker card"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setClock(value => value + ITEM_TIME_MS)}
                aria-label="Next ticker card"
              >
                Next
              </button>
            </>
          )}
          <a href={CATALOG_HREF} className="underline">
            {CATALOG_LABEL}
          </a>
        </div>
      </div>

      {visible.length ? (
        <div
          className="overflow-hidden"
          style={{ maxWidth: 1280, marginInline: "auto" }}
          onFocusCapture={event => setFocused(event.target.matches(":focus-visible"))}
          onBlurCapture={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setFocused(false);
            }
          }}
        >
          <div
            ref={trackRef}
            className="flex w-max py-2"
            style={{
              transform: `translate3d(-${fraction * ITEM_WIDTH}px, 0, 0)`,
              willChange: stopped ? "auto" : "transform",
            }}
          >
            {visible.map(({ entry, slot, duplicate }, offset) => {
              const href = recordHref(entry);
              const validPrice =
                entry.market != null &&
                Number.isFinite(entry.market) &&
                entry.market > 0;

              return (
                <div
                  key={`${category}:${slot}:${entry.id}`}
                  className="inline-flex shrink-0 items-center gap-2 border-r border-border px-3"
                  style={{ width: ITEM_WIDTH, boxSizing: "border-box" }}
                  aria-hidden={duplicate || undefined}
                >
                  <CardImage
                    src={entry.image}
                    onUnavailable={()=>setUnavailable(previous=>new Set(previous).add(entry.image))}
                    loading="eager"
                    highResolution={false}
                    alt={entry.kind === "graded" ? `${entry.name} — raw card artwork; quote for ${entry.grade}` : entry.name}
                    className="ticker-card-art h-14 w-10 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <strong
                      className="block truncate font-mono text-primary"
                      title={entry.id}
                    >
                      {catalogSymbol(entry)}
                    </strong>
                    {href ? (
                      <Link
                        to={href}
                        className="block truncate underline"
                        title={entry.name}
                        tabIndex={duplicate || offset === 0 || offset > 4 ? -1 : 0}
                      >
                        {entry.name}
                      </Link>
                    ) : (
                      <span className="block truncate" title={entry.name}>
                        {entry.name}
                      </span>
                    )}
                    <span
                      className="block truncate text-muted-foreground"
                      title={`${entry.set} ${entry.variant || entry.grade || ""}`}
                    >
                      {entry.set} · {entry.variant || entry.grade || entry.kind}
                    </span>
                    <strong className="block">
                      {entry.kind === "digital"
                        ? "DIGITAL"
                        : validPrice
                          ? "$" + entry.market!.toFixed(2)
                          : "No quote"}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="px-4 py-2 text-sm">
          {catalog.isLoading
            ? "Loading catalog…"
            : "No records in this category yet."}
        </p>
      )}

      <p className="px-4 pb-2 text-xs text-muted-foreground">
        {catalog.data?.sourceUpdated
          ? `Catalog source release: ${catalog.data.sourceUpdated}. `
          : "Catalog release date unavailable. "}
        Illustration rares, ultra rares, promos and documented full-art types with priced English artwork. Unknown rarities and failed images are excluded; coverage grows as source metadata arrives.
        {reducedMotion
          ? " Automatic movement is off for your reduced-motion preference."
          : " Resume returns to the current clock-based position."}
      </p>
    </section>
  );
}