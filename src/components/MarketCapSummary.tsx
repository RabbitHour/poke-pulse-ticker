// 2026-11-15 — David Noyes — Explain catalog coverage, physical first.

import { useCatalog } from "@/hooks/useCatalog";
import type { CardData } from "@/data/marketData";

interface Props {
  liveRawCards?: CardData[];
}

function formatCount(value: number | undefined): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "Unavailable";
  }

  return value.toLocaleString("en-US");
}

export default function MarketCapSummary(_props: Props) {
  const catalog = useCatalog();

  // Keep this deliberate display order; digital coverage is always last.
  const coverage = [
    {
      id: "physical-quotes",
      title: "Available physical quotes",
      count: catalog.data?.pricedRecords,
      description:
        "Catalog records with a source price. Different printings, variants and products can have separate quotes.",
    },
    {
      id: "physical-cards",
      title: "Physical English cards",
      count: catalog.data?.englishCatalogCount,
      description:
        "English physical card entries indexed by the catalog source. An indexed card does not necessarily have an available price.",
    },
    {
      id: "digital-cards",
      title: "Pocket digital cards",
      count: catalog.data?.digitalCatalogCount,
      description:
        "Digital collectible entries listed separately from physical cards. This count does not represent cash market values.",
    },
  ];

  return (
    <section
      className="terminal-card space-y-4 p-4 sm:p-5"
      aria-labelledby="market-coverage-title"
    >
      <div className="space-y-2">
        <h2
          id="market-coverage-title"
          className="text-xl font-bold"
        >
          Market coverage at a glance
        </h2>

        <p className="text-sm leading-relaxed">
          See how much of the catalog has pricing information, how many
          physical English card entries are indexed, and how many
          digital collectibles are listed separately.
        </p>
      </div>

      {catalog.isLoading && !catalog.data && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading catalog coverage…
        </p>
      )}

      {catalog.isError && (
        <p role="status" className="market-note">
          Catalog coverage could not be refreshed.
          Previously loaded counts remain visible when available.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {coverage.map(item => (
          <div
            key={item.id}
            className="flex flex-col rounded-lg border border-border p-4 text-center"
          >
            <h3 className="text-sm font-semibold">
              {item.title}
            </h3>

            <strong className="my-3 block text-2xl font-bold text-primary sm:text-3xl">
              {catalog.isLoading && !catalog.data
                ? "Loading…"
                : formatCount(item.count)}
            </strong>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          These counts measure different things and may overlap.
          Do not add them together or interpret them as sales volume.
          Available quotes are not a count of completed sales.
        </p>

        <p>
          Coverage depends on the connected sources; it does not
          represent every worldwide printing. Adding catalog prices
          together does not calculate Pokémon market capitalization.
        </p>

        <p className="text-xs">
          {catalog.data?.sourceUpdated
            ? `Catalog source release: ${catalog.data.sourceUpdated}`
            : "Catalog source release date unavailable."}
        </p>
      </div>

      <a
        className="market-action inline-block"
        href="#catalog"
      >
        Explore the full catalog
      </a>
    </section>
  );
}