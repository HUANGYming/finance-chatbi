import { ArrowUpRight } from 'lucide-react';
import { thousands, totals, varianceLabel } from '../lib/finance';
import type { FinanceRow } from '../types';

interface Props { rows: FinanceRow[]; label: string; onSelect?: (name: string) => void; }

export default function DataTable({ rows, label, onSelect }: Props) {
  const total = totals(rows);
  return <div className="table-scroll"><table>
    <caption className="sr-only">{label}. Amounts in USD thousands. Positive expense variance is unfavorable.</caption>
    <thead><tr><th scope="col">{onSelect ? 'Cost center' : 'Account'}</th><th scope="col">Actual</th><th scope="col">Budget</th><th scope="col">Variance</th><th scope="col">Assessment</th></tr></thead>
    <tbody>{rows.map(row => <tr key={row.name}><th scope="row">{onSelect ? <button className="table-link" onClick={() => onSelect(row.name)}>{row.name}<ArrowUpRight size={13} /></button> : row.name}</th><td>{thousands(row.actual)}</td><td>{thousands(row.budget)}</td><td>{row.actual - row.budget > 0 ? '+' : ''}{thousands(row.actual - row.budget)}</td><td><span className={`assessment ${row.actual > row.budget ? 'unfavorable' : row.actual < row.budget ? 'favorable' : ''}`}>{varianceLabel(row.actual - row.budget)}</span></td></tr>)}</tbody>
    <tfoot><tr><th scope="row">Total</th><td>{thousands(total.actual)}</td><td>{thousands(total.budget)}</td><td>{total.variance > 0 ? '+' : ''}{thousands(total.variance)}</td><td>{varianceLabel(total.variance)}</td></tr></tfoot>
  </table></div>;
}
