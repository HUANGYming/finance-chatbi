import { ArrowRight, Check } from 'lucide-react';
import { compactMoney, totals, varianceLabel } from '../lib/finance';
import type { CenterRow, CostCenter } from '../types';

interface Props { rows: CenterRow[]; selected: CostCenter | null; onSelect: (center: CostCenter) => void; }

export default function VarianceChart({ rows, selected, onSelect }: Props) {
  const values = rows.map(row => row.actual - row.budget);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const position = (n: number) => (n - min) / span * 100;
  const zero = position(0);
  const ticks = min === max ? [0] : [min, (min + max) / 2, max];
  const total = totals(rows);

  return <div className="variance-chart">
    <div className="chart-heading"><div><h3>Budget variance by cost center</h3><p>Actual − budget · USD thousands</p></div><span className="chart-hint">Select a row to explore <ArrowRight size={13} /></span></div>
    <div className="chart-column-labels"><span>Cost center</span><span>Variance contribution</span><span>USD</span></div>
    <div className="bar-rows" role="group" aria-label="Budget variance by cost center">
      {rows.map(row => {
        const variance = row.actual - row.budget;
        return <button className={`bar-row ${selected === row.name ? 'selected' : ''}`} key={row.name} onClick={() => onSelect(row.name)} aria-pressed={selected === row.name} aria-label={`${row.name}, ${compactMoney(variance, true)}, ${varianceLabel(variance)}. View account breakdown.`}>
          <span className="bar-name">{row.name}{selected === row.name && <Check size={12} />}</span>
          <span className="bar-track"><span className="zero-line" style={{ left: `${zero}%` }} /><span className={`bar-fill ${variance < 0 ? 'negative' : ''}`} style={{ left: `${position(Math.min(0, variance))}%`, width: `${Math.abs(variance) / span * 100}%` }} /></span>
          <span className="bar-value">{compactMoney(variance, true)}</span>
        </button>;
      })}
    </div>
    <div className="chart-axis" aria-hidden="true">{ticks.map((tick, index) => <span key={tick} style={{ left: `${position(tick)}%`, transform: index === 0 ? 'none' : index === ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)' }}>{new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(tick / 1000)}</span>)}</div>
    <div className="chart-caption"><span>Positive = unfavorable · Negative = favorable</span><span>Total variance <strong>{compactMoney(total.variance, true)}</strong></span></div>
  </div>;
}
