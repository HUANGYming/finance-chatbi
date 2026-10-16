import { BookOpen, Database, FileSpreadsheet, Info, ShieldCheck } from 'lucide-react';
import type { FinanceReport } from '../types';

export default function Definitions({ report }: { report: FinanceReport }) {
  return <div className="definitions">
    <div className="definition-heading"><span className="definition-icon"><BookOpen size={19} /></span><div><h3>Operating expenses</h3><p>Illustrative definition · Requires Finance approval for production</p></div></div>
    <dl className="definition-list"><dt>Calculation</dt><dd>Sum of reporting-currency amounts mapped to operating expense accounts.</dd><dt>Included</dt><dd>Technology, Sales, Operations, and Corporate operating expenses.</dd><dt>Excluded</dt><dd>Cost of goods sold, interest, and tax.</dd><dt>Variance</dt><dd>Actual − budget. Positive expense variance is unfavorable. Variance % = (actual − budget) / |budget| × 100.</dd><dt>Reporting basis</dt><dd>{report.periodLabel} · {report.entity} · USD reporting currency.</dd><dt>Budget version</dt><dd>{report.budgetVersion} (illustrative)</dd></dl>
    <div className="source-grid"><div className="source-item"><FileSpreadsheet size={18} /><div><strong>Business definitions</strong><p>Excel dictionary · Metrics / operating_expense</p><span>{report.semanticVersion}</span></div></div><div className="source-item"><Database size={18} /><div><strong>Financial data</strong><p>Yellowbrick · Proposed data source</p><span>Not connected</span></div></div></div>
    <div className="source-status"><ShieldCheck size={16} /><span>Data status: demonstration only. No live refresh, close-status verification, or reconciliation has been performed.</span></div>
    <div className="evidence-note"><Info size={15} /><span>Account contributions explain numerical differences. Operational causes require supporting business evidence.</span></div>
  </div>;
}
