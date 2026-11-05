import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DailySpotlight from "./DailySpotlight";
import type { CardData } from "@/data/marketData";
afterEach(() => { cleanup(); vi.useRealTimers(); });
const card = (name: string, market = 10): CardData => ({ name, market, set: "Base", number: "1", low: market, mid: market, change: 1 });
describe("observed spotlight", () => {
  it("rejects invalid quotes without inventing signals", () => {
    render(<DailySpotlight cards={[card("Bad", NaN), card("Pikachu")]} />);
    expect(screen.getByRole("heading", { name: "Pikachu" })).toBeInTheDocument();
    expect(screen.queryByText(/STRONG BUY|AI ANALYSIS|24H VOLUME/)).not.toBeInTheDocument();
    expect(screen.queryByText("Bad")).not.toBeInTheDocument();
  });
  it("rotates without a new feed array", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-01-01T00:59:50Z"));
    render(<DailySpotlight cards={[card("First"), card("Second")]} />);
    expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(30000); });
    expect(screen.getByRole("heading", { name: "Second" })).toBeInTheDocument();
  });
  it("has an empty state", () => {
    render(<DailySpotlight cards={[]} />);
    expect(screen.getByText("No valid card quotes available yet.")).toBeInTheDocument();
  });
});
