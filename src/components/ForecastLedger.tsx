// 2026-11-15 — David Noyes — Explain and evaluate recorded forecasts.

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Forecast {
  id: string;
  recordId?: string;
  name: string;
  set: string;
  variant?: string;
  issuedAt: string;
  dueAt: string;
  baseline: number;
  predicted: number;
}

interface Outcome {
  id: string;
  actual: number;
}

interface Ledger {
  methodology?: string;
  forecasts: Forecast[];
  outcomes: Outcome[];
}

type Direction = "Up" | "Down" | "Flat";

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Accept only actual, positive numeric prices.
function isPrice(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

// Check downloaded records before using them in the table or statistics.
function isForecast(value: unknown): value is Forecast {
  if (!isObject(value)) return false;

  return (
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    typeof value.set === "string" &&
    (value.recordId === undefined || typeof value.recordId === "string") &&
    (value.variant === undefined || typeof value.variant === "string") &&
    isDate(value.issuedAt) &&
    isDate(value.dueAt) &&
    Date.parse(value.dueAt) > Date.parse(value.issuedAt) &&
    isPrice(value.baseline) &&
    isPrice(value.predicted)
  );
}

function isOutcome(value: unknown): value is Outcome {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    isPrice(value.actual)
  );
}

function direction(price: number, baseline: number): Direction {
  const change = (price - baseline) / baseline;

  // The small tolerance avoids floating-point boundary errors.
  if (change > 0.01 + 1e-10) return "Up";
  if (change < -0.01 - 1e-10) return "Down";
  return "Flat";
}

function percentChange(price: number, baseline: number): string {
  const change = ((price - baseline) / baseline) * 100;
  return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
}

function displayDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function cardLabel(forecast: Forecast): string {
  return [
    forecast.name,
    forecast.set,
    forecast.variant,
  ].filter(Boolean).join(" · ");
}

function cardKey(forecast: Forecast): string {
  // Older records without a catalog ID stay separate rather than being
  // incorrectly combined with another printing of the same card.
  return forecast.recordId?.trim()
    ? `record:${forecast.recordId}`
    : `forecast:${forecast.id}`;
}

function directionClass(value: Direction): string {
  if (value === "Up") return "text-emerald-700 dark:text-emerald-300";
  if (value === "Down") return "text-rose-700 dark:text-rose-300";
  return "text-muted-foreground";
}

export default function ForecastLedger() {
  const [selectedCard, setSelectedCard] = useState("");

  const query = useQuery({
    queryKey: ["forecast-ledger"],

    queryFn: async () => {
      const response = await fetch("/data/forecasts.json", {
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error("Forecast ledger unavailable");
      }

      const data: unknown = await response.json();

      if (
        !isObject(data) ||
        !Array.isArray(data.forecasts) ||
        !Array.isArray(data.outcomes)
      ) {
        throw new Error("Forecast ledger format is invalid");
      }

      const forecasts = data.forecasts.filter(isForecast);
      const outcomes = data.outcomes.filter(isOutcome);

      const ledger: Ledger = {
        methodology:
          typeof data.methodology === "string"
            ? data.methodology
            : undefined,
        forecasts,
        outcomes,
      };

      return {
        ...ledger,
        excludedRecords:
          data.forecasts.length -
          forecasts.length +
          data.outcomes.length -
          outcomes.length,
      };
    },

    staleTime: 1_800_000,
    refetchInterval: 1_800_000,
    retry: 1,
  });

  const analysis = useMemo(() => {
    const forecasts = query.data?.forecasts ?? [];
    const outcomes = new Map(
      (query.data?.outcomes ?? []).map(outcome => [
        outcome.id,
        outcome,
      ]),
    );

    const optionMap = new Map<string, string>();

    for (const forecast of forecasts) {
      optionMap.set(
        cardKey(forecast),
        cardLabel(forecast) +
          (forecast.recordId?.trim()
            ? ""
            : ` · published ${displayDate(forecast.issuedAt)}`),
      );
    }

    const options = [...optionMap.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], "en", {
        numeric: true,
        sensitivity: "base",
      }),
    );

    const now = Date.now();

    const rows = forecasts
      .filter(
        forecast =>
          !selectedCard || cardKey(forecast) === selectedCard,
      )
      .map(forecast => {
        const due = Date.parse(forecast.dueAt) <= now;

        // Do not score a forecast before its target date.
        const outcome = due ? outcomes.get(forecast.id) : undefined;

        return { forecast, outcome, due };
      })
      .sort(
        (a, b) =>
          Date.parse(b.forecast.issuedAt) -
          Date.parse(a.forecast.issuedAt),
      );

    const scored = rows.flatMap(({ forecast, outcome }) => {
      if (!outcome) return [];

      // Both errors use the same recorded outcome as denominator.
      const modelError =
        (Math.abs(forecast.predicted - outcome.actual) /
          outcome.actual) *
        100;

      const unchangedError =
        (Math.abs(forecast.baseline - outcome.actual) /
          outcome.actual) *
        100;

      if (
        !Number.isFinite(modelError) ||
        !Number.isFinite(unchangedError)
      ) {
        return [];
      }

      return [{
        directionCorrect:
          direction(forecast.predicted, forecast.baseline) ===
          direction(outcome.actual, forecast.baseline),
        modelError,
        unchangedError,
      }];
    });

    const correct = scored.filter(row => row.directionCorrect).length;
    const count = scored.length;

    return {
      options,
      rows,
      scoredCount: count,
      correctCount: correct,
      accuracy: count ? (correct / count) * 100 : null,
      modelError: count
        ? scored.reduce((sum, row) => sum + row.modelError, 0) / count
        : null,
      unchangedError: count
        ? scored.reduce((sum, row) => sum + row.unchangedError, 0) / count
        : null,
    };
  }, [query.data, selectedCard]);

  const comparison =
    analysis.modelError === null || analysis.unchangedError === null
      ? "A comparison will appear after eligible outcomes are recorded."
      : Math.abs(analysis.modelError - analysis.unchangedError) < 0.05
        ? "The model and the unchanged-price estimate have approximately equal average error."
        : analysis.modelError < analysis.unchangedError
          ? "For these scored forecasts, the model had lower average error than predicting no price change."
          : "For these scored forecasts, predicting no price change had lower average error than the model.";

  return (
    <section
      id="forecast-results"
      className="terminal-card space-y-4 p-4 sm:p-5 scroll-mt-20"
      aria-labelledby="forecast-title"
    >
      <div className="space-y-2">
        <h2 id="forecast-title" className="text-xl font-bold">
          Forecasts and recorded results
        </h2>

        <p className="text-sm leading-relaxed">
          Each row follows one card variant. Compare its price when the
          forecast was published with the estimated seven-day price,
          then check the recorded result when available. These are
          source quotes, not guaranteed selling prices.
        </p>

        <p className="text-sm leading-relaxed">
          Use the forecast as a research signal. Compare recent sales,
          condition, selling fees and shipping before making a
          collection decision. Changes within 1% of the starting quote
          count as flat.
        </p>
      </div>

      <details className="rounded-lg border border-border p-3" open>
        <summary className="cursor-pointer font-semibold">
          How to read this table
        </summary>

        <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold">Card / forecast published</dt>
            <dd className="mt-1 text-muted-foreground">
              The card, set and available variant information, followed
              by the date the estimate was issued.
            </dd>
          </div>

          <div>
            <dt className="font-semibold">
              Price when forecast was made
            </dt>
            <dd className="mt-1 text-muted-foreground">
              The starting source quote. This is also the reference for
              the displayed percentage changes.
            </dd>
          </div>

          <div>
            <dt className="font-semibold">
              Estimated price after 7 days
            </dt>
            <dd className="mt-1 text-muted-foreground">
              The model’s saved estimate and its target date.
              It is a prediction, not an offer to buy your card.
            </dd>
          </div>

          <div>
            <dt className="font-semibold">
              Recorded price after 7 days
            </dt>
            <dd className="mt-1 text-muted-foreground">
              The outcome supplied by the ledger for that forecast.
              Pending means the target date has not arrived.
              Awaiting a recorded result means no valid outcome is
              available yet.
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-sm">
          Example: a $100 starting quote, a $110 forecast and a $104
          recorded result means the forecast got the upward direction
          right, but overestimated the price. An unchanged $100 estimate
          was actually closer to the $104 result.
        </p>
      </details>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="block min-w-0 text-sm">
          <span className="mb-1 block font-semibold">
            Choose a card variant
          </span>
          <select
            className="max-w-full rounded border border-border bg-card p-2"
            value={selectedCard}
            onChange={event => setSelectedCard(event.target.value)}
          >
            <option value="">All forecasted cards</option>
            {analysis.options.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="market-action"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
        >
          {query.isFetching ? "Checking…" : "Refresh results"}
        </button>
      </div>

      {query.isPending && (
        <p role="status">Loading forecast history…</p>
      )}

      {query.isError && (
        <p role="status" className="market-note">
          Forecast history could not be refreshed.
          Any previously loaded results remain visible.
        </p>
      )}

      {query.data && query.data.excludedRecords > 0 && (
        <p role="status" className="market-note">
          {query.data.excludedRecords} invalid record(s) were excluded.
          Missing or invalid prices are not treated as zero.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-3 text-center">
          <h3 className="text-sm font-semibold">Direction accuracy</h3>
          <p className="mt-2 text-lg font-bold">
            {analysis.accuracy === null
              ? "Awaiting results"
              : `${analysis.accuracy.toFixed(1)}%`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {analysis.correctCount} correct out of{" "}
            {analysis.scoredCount} scored forecasts.
            Up, down or flat must match.
          </p>
        </div>

        <div className="rounded-lg border border-border p-3 text-center">
          <h3 className="text-sm font-semibold">
            Model average price error
          </h3>
          <p className="mt-2 text-lg font-bold">
            {analysis.modelError === null
              ? "Awaiting results"
              : `${analysis.modelError.toFixed(1)}%`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Average absolute percentage error against recorded
            outcomes. Lower is better.
          </p>
        </div>

        <div className="rounded-lg border border-border p-3 text-center">
          <h3 className="text-sm font-semibold">
            Unchanged-price average error
          </h3>
          <p className="mt-2 text-lg font-bold">
            {analysis.unchangedError === null
              ? "Awaiting results"
              : `${analysis.unchangedError.toFixed(1)}%`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Error from predicting that each starting price would
            stay the same. Lower is better.
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed">
        {comparison} These statistics describe the selected recorded
        forecasts; they are not a probability of profit.
      </p>

      {query.data && analysis.rows.length === 0 && (
        <p className="market-note">
          No valid forecasts are available for this selection.
          Missing forecasts and outcomes are not invented.
        </p>
      )}

      {analysis.rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed text-sm [&_th]:text-center [&_td]:text-center [&_th]:align-middle [&_td]:align-middle [&_th]:p-3 [&_td]:p-3">
            <caption className="pb-3 text-left text-xs text-muted-foreground">
              Showing the latest {Math.min(10, analysis.rows.length)} of{" "}
              {analysis.rows.length} forecasts in this selection.
              Statistics above use all eligible scored rows in the
              selection. Prices are USD.
            </caption>

            <thead>
              <tr className="border-b border-border">
                <th scope="col">Card / forecast published</th>
                <th scope="col">Price when forecast was made</th>
                <th scope="col">Estimated price after 7 days</th>
                <th scope="col">Recorded price after 7 days</th>
              </tr>
            </thead>

            <tbody>
              {analysis.rows.slice(0, 10).map(
                ({ forecast, outcome, due }) => {
                  const predictedDirection = direction(
                    forecast.predicted,
                    forecast.baseline,
                  );

                  const actualDirection = outcome
                    ? direction(outcome.actual, forecast.baseline)
                    : null;

                  return (
                    <tr
                      key={forecast.id}
                      className="border-b border-border"
                    >
                      <td className="break-words">
                        <strong className="block">{forecast.name}</strong>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {[forecast.set, forecast.variant]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        <span className="mt-2 block text-xs">
                          Published {displayDate(forecast.issuedAt)}
                        </span>
                      </td>

                      <td>
                        <strong>{dollars.format(forecast.baseline)}</strong>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          Starting source quote
                        </span>
                      </td>

                      <td>
                        <strong>{dollars.format(forecast.predicted)}</strong>
                        <span
                          className={`mt-1 block text-xs font-semibold ${directionClass(predictedDirection)}`}
                        >
                          {predictedDirection} ·{" "}
                          {percentChange(
                            forecast.predicted,
                            forecast.baseline,
                          )}
                        </span>
                        <span className="mt-2 block text-xs text-muted-foreground">
                          Target: {displayDate(forecast.dueAt)}
                        </span>
                      </td>

                      <td>
                        {outcome && actualDirection ? (
                          <>
                            <strong>
                              {dollars.format(outcome.actual)}
                            </strong>
                            <span
                              className={`mt-1 block text-xs font-semibold ${directionClass(actualDirection)}`}
                            >
                              {actualDirection} ·{" "}
                              {percentChange(
                                outcome.actual,
                                forecast.baseline,
                              )}
                            </span>
                            <span className="mt-2 block text-xs text-muted-foreground">
                              {actualDirection === predictedDirection
                                ? "Direction matched"
                                : "Direction did not match"}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">
                            {due
                              ? "Awaiting a recorded result"
                              : "Pending target date"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
        {query.data?.methodology && (
          <p>{query.data.methodology}</p>
        )}
        <p>
          Results depend on the ledger’s source matching and collection
          timing. This page checks record structure and prices; it does
          not independently verify the underlying market observations.
          Small samples and overlapping forecasts can make accuracy
          appear more reliable than it is.
        </p>
        <p>
          Experimental estimates do not guarantee future value.{" "}
          <a href="/data/forecasts.json" className="underline">
            Download the dated forecast ledger
          </a>
        </p>
      </div>
    </section>
  );
}