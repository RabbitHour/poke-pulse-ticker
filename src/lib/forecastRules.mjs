export const DAY = 86400000;
export const HORIZONS = [1, 2, 7, 14, 30];
export function direction(baseline, value) {
  if (![baseline,value].every(v=>Number.isFinite(v)&&v>0)) return null;
  return value >= baseline * .99 && value <= baseline * 1.01 ? 'flat' : value > baseline ? 'up' : 'down';
}
export function eligibleOutcome(f, o) {
  if (!f || !o || f.id !== o.id) return false;
  if (![f.baseline, f.predicted, o.actual].every(v => Number.isFinite(v) && v > 0)) return false;
  const days = f.horizonDays ?? 7;
  const due = Date.parse(f.dueAt), evaluated = Date.parse(o.evaluatedAt);
  return HORIZONS.includes(days) && Number.isFinite(due) && Number.isFinite(evaluated)
    && evaluated >= due && evaluated <= due + (days <= 2 ? 1 : 2) * DAY
    && Date.parse(o.sourceUpdated) > Date.parse(f.sourceUpdated)
    && Date.parse(o.sourceUpdated) >= due
    && Date.parse(o.sourceUpdated) <= evaluated;
}
export function resolvedMetrics(forecasts, outcomes) {
  const byId = new Map(forecasts.map(f => [f.id, f]));
  const seen = new Set();
  const rows = outcomes.flatMap(o => {
    const f = byId.get(o.id);
    if (seen.has(o.id) || !eligibleOutcome(f, o)) return [];
    seen.add(o.id);
    return [{ f, o, predictedDirection: direction(f.baseline, f.predicted), actualDirection: direction(f.baseline, o.actual) }];
  });
  const correct = rows.filter(r => r.predictedDirection === r.actualDirection).length;
  return { rows, count: rows.length, accuracy: rows.length ? correct / rows.length * 100 : null,
    error: rows.length ? rows.reduce((s, r) => s + Math.abs(r.f.predicted - r.o.actual) / r.o.actual * 100, 0) / rows.length : null };
}