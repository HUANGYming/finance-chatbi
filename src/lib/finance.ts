import type { FinanceRow } from '../types';

export function totals(rows: FinanceRow[]) {
  const actual = rows.reduce((sum, row) => sum + row.actual, 0);
  const budget = rows.reduce((sum, row) => sum + row.budget, 0);
  return { actual, budget, variance: actual - budget, percentage: budget === 0 ? null : (actual - budget) / Math.abs(budget) * 100 };
}

export function compactMoney(value: number, signed = false): string {
  const abs = Math.abs(value);
  const magnitude = abs >= 1_000_000 ? abs / 1_000_000 : abs >= 1000 ? abs / 1000 : abs;
  const suffix = abs >= 1_000_000 ? 'm' : abs >= 1000 ? 'k' : '';
  const amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: abs >= 1_000_000 ? 2 : 1 }).format(magnitude);
  return `${value < 0 ? '−' : signed && value > 0 ? '+' : ''}$${amount}${suffix}`;
}

export const thousands = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value / 1000);
export const varianceLabel = (value: number) => value > 0 ? 'Unfavorable' : value < 0 ? 'Favorable' : 'On budget';

export function exportCsv(rows: FinanceRow[], period: string) {
  const sum = totals(rows);
  const lines = [
    ['Demo data — not for financial reporting'],
    ['Period', period], ['Currency', 'USD'], ['Budget version', 'Approved FY2026'],
    ['Cost center', 'Actual (USD)', 'Budget (USD)', 'Variance (USD)', 'Assessment'],
    ...rows.map(row => [row.name, row.actual, row.budget, row.actual - row.budget, varianceLabel(row.actual - row.budget)]),
    ['Total', sum.actual, sum.budget, sum.variance, varianceLabel(sum.variance)],
  ];
  const csv = lines.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = `opex-${period}-demo.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
