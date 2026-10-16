import { BarChart3, CalendarDays, ChevronDown, Download, FileText, Info, Table2, TrendingDown, TrendingUp, X } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import type { CostCenter, FinanceReport, Period, ReportView } from '../types';
import { compactMoney, exportCsv, totals, varianceLabel } from '../lib/finance';
import VarianceChart from './VarianceChart';
import DataTable from './DataTable';
import Definitions from './Definitions';

interface Props {
  report: FinanceReport;
  view: ReportView;
  selectedCenter: CostCenter | null;
  busy: boolean;
  onPeriod: (period: Period) => void;
  onView: (view: ReportView) => void;
  onCenter: (center: CostCenter | null) => void;
  onAsk: (question: string) => void;
}

const tabs = [
  { id: 'chart' as const, label: 'Variance chart', icon: BarChart3 },
  { id: 'data' as const, label: 'Data', icon: Table2 },
  { id: 'definition' as const, label: 'Definition & sources', icon: FileText },
];

export default function AnalysisPanel({ report, view, selectedCenter, busy, onPeriod, onView, onCenter, onAsk }: Props) {
  const total = totals(report.rows);
  const selected = report.rows.find(row => row.name === selectedCenter);
  const Trend = total.variance >= 0 ? TrendingUp : TrendingDown;
  function selectCenter(name: string) { onCenter(name as CostCenter); onView('chart'); }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let target = index;
    if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = tabs.length - 1;
    else return;
    event.preventDefault(); onView(tabs[target].id); document.getElementById(`tab-${tabs[target].id}`)?.focus();
  }

  return <main className="analysis-main" id="analysis" aria-label="Analysis workspace" aria-busy={busy}>
    <div className="analysis-content">
      <div className="report-topline"><span className="eyebrow">Budget performance <span className="breadcrumb-slash">/</span> {report.periodLabel}</span><button className="button button-quiet export-button" aria-label="Export CSV" onClick={() => exportCsv(report.rows, report.period)}><Download size={15} /><span>Export CSV</span></button></div>
      <h1>{total.variance >= 0 ? 'Where did Opex exceed budget?' : 'Where did Opex come in below budget?'}</h1>
      <p className="report-description">Monthly operating expenses <span>·</span> {report.entity}</p>
      <div className="context-bar">
        <label className="period-control"><CalendarDays size={14} /><span className="sr-only">Reporting period</span><select aria-label="Reporting period" value={report.period} onChange={event => onPeriod(event.target.value as Period)} disabled={busy}><option value="2026-09">Sep 2026</option><option value="2026-08">Aug 2026</option></select><ChevronDown size={13} /></label>
        <span className="context-chip">Actual vs approved budget</span><span className="context-chip">USD <span className="chip-dot">·</span> Reporting currency</span>
      </div>
      <section className="kpi-grid" aria-label="Key financial figures">
        <div className="kpi"><div className="kpi-label">Actual Opex</div><div className="kpi-value" data-testid="actual-value">{compactMoney(total.actual)}</div><div className="kpi-detail">{report.periodLabel}</div></div>
        <div className="kpi"><div className="kpi-label">Budget</div><div className="kpi-value" data-testid="budget-value">{compactMoney(total.budget)}</div><div className="kpi-detail">{report.budgetVersion}</div></div>
        <div className="kpi"><div className="kpi-label">Variance <Trend size={15} /></div><div className="kpi-value" data-testid="variance-value">{compactMoney(total.variance, true)}</div><div className={`kpi-detail ${total.variance > 0 ? 'unfavorable' : total.variance < 0 ? 'favorable' : ''}`}>{total.percentage === null ? 'N/A' : `${Math.abs(total.percentage).toFixed(1)}%`} {varianceLabel(total.variance).toLowerCase()}</div></div>
      </section>
      <section className="report-card" aria-label="Operating expense analysis">
        <div className="report-tabs" role="tablist" aria-label="Analysis view">{tabs.map(({ id, label, icon: Icon }, index) => <button id={`tab-${id}`} key={id} role="tab" className="report-tab" aria-selected={view === id} aria-controls={`panel-${id}`} tabIndex={view === id ? 0 : -1} onClick={() => onView(id)} onKeyDown={event => tabKey(event, index)}><Icon size={16} />{label}</button>)}</div>
        <div id="panel-chart" role="tabpanel" aria-labelledby="tab-chart" hidden={view !== 'chart'}>
          <VarianceChart rows={report.rows} selected={selectedCenter} onSelect={onCenter} />
          {selected && <section className="drilldown" aria-label={`${selected.name} account breakdown`}>
            <div className="drilldown-heading"><div><div className="eyebrow">Account breakdown</div><h3>{selected.name} <span>{compactMoney(selected.actual - selected.budget, true)}</span></h3></div><button className="icon-button" aria-label="Close account breakdown" onClick={() => onCenter(null)}><X size={17} /></button></div>
            <p className="table-unit">USD thousands · {report.shortPeriod}</p><DataTable rows={selected.accounts} label={`${selected.name} account breakdown`} />
            <div className="drilldown-footer"><span>Numerical contributions, not confirmed business causes.</span><button className="text-button" disabled={busy} onClick={() => onAsk(`Explain the ${selected.name} variance`)}>Discuss this variance →</button></div>
          </section>}
        </div>
        <div id="panel-data" role="tabpanel" aria-labelledby="tab-data" hidden={view !== 'data'} className="data-panel"><div className="chart-heading"><div><h3>Operating expenses by cost center</h3><p>USD thousands · {report.shortPeriod}</p></div></div><DataTable rows={report.rows} label="Operating expenses by cost center" onSelect={selectCenter} /><p className="table-footnote">Select a cost center to view its account breakdown. Totals use unrounded amounts.</p></div>
        <div id="panel-definition" role="tabpanel" aria-labelledby="tab-definition" hidden={view !== 'definition'}><Definitions report={report} /></div>
      </section>
      <div className="report-footer"><span><Info size={13} />Illustrative figures · No live connection</span><span>Analysis: DEMO-{report.period}-OPX</span></div>
      <div className="insight-note"><span className="insight-mark"><FileText size={17} /></span><div><strong>Keep the context with the numbers.</strong><p>Check the metric definition, reporting period, and budget version before sharing an analysis.</p></div><button className="text-button" onClick={() => onView('definition')}>View basis <span aria-hidden="true">↗</span></button></div>
    </div>
  </main>;
}
