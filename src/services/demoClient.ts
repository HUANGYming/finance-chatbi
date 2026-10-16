import { DEMO_REPORTS } from '../data/reports';
import { compactMoney, totals } from '../lib/finance';
import type { ChatReply, FinanceClient, Period } from '../types';

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException('Cancelled', 'AbortError')); return; }
    const cancel = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', cancel); resolve(); }, ms);
    signal.addEventListener('abort', cancel, { once: true });
  });
}

export function summary(period: Period) {
  const report = DEMO_REPORTS[period];
  const total = totals(report.rows);
  const top = [...report.rows].sort((a, b) => Math.abs(b.actual - b.budget) - Math.abs(a.actual - a.budget))[0];
  const topVariance = top.actual - top.budget;
  return `${report.periodLabel.split(' ')[0]} Opex was ${compactMoney(Math.abs(total.variance))} ${total.variance >= 0 ? 'above' : 'below'} budget (${Math.abs(total.percentage ?? 0).toFixed(1)}%). ${top.name} contributed ${compactMoney(Math.abs(topVariance))}, or ${(Math.abs(topVariance / total.variance) * 100).toFixed(1)}% of the ${total.variance > 0 ? 'overrun' : 'underspend'}.`;
}

export const demoClient: FinanceClient = {
  async getReport(period, signal) {
    await delay(250, signal);
    return structuredClone(DEMO_REPORTS[period]);
  },
  async ask(question, context, signal): Promise<ChatReply> {
    await delay(700, signal);
    const q = question.toLowerCase();
    const period: Period = /august|\baug\b|2026-08/.test(q) ? '2026-08' : /september|\bsep\b|2026-09/.test(q) ? '2026-09' : context.period;
    const report = DEMO_REPORTS[period];
    if (/revenue|cash|profit|forecast|headcount|payroll|202[0-57-9]|january|february|march|april|may\b|june|july|october|november|december|\bq[1-4]\b|\bytd\b|last month|last year|\beur\b|\bhkd\b|\bmop\b/.test(q)) {
      return { text: 'This UI demo contains only August and September 2026 operating expenses in USD. Try “Show September Opex vs budget” or “Break down Technology.” Other periods, metrics, and live questions will require the backend connection.' };
    }
    if (/defin|meaning|calculate|formula|included|exclude|dictionary/.test(q)) {
      return { text: 'In this illustrative definition, Opex includes Technology, Sales, Operations, and Corporate operating expenses. COGS, interest, and tax are excluded. Variance = actual − budget; a positive expense variance is unfavorable. Your Finance team will need to approve the production definition.', view: 'definition', period };
    }
    if (/source|fresh|updated|live|close|reconcil/.test(q)) {
      return { text: 'These are fictional demonstration figures. No Yellowbrick connection, live refresh, close-status check, or reconciliation has been performed. The Definition & sources tab shows the proposed data and semantic sources.', view: 'definition', period };
    }
    const center = report.rows.find(row => q.includes(row.name.toLowerCase())) ?? (/break.*down|drill|these accounts/.test(q) ? report.rows.find(row => row.name === context.selectedCenter) : undefined);
    if (center) {
      const accountText = center.accounts.map(row => `${row.name} ${compactMoney(row.actual - row.budget, true)}`).join('; ');
      return { text: `${center.name} actual expenses were ${compactMoney(center.actual)} against a ${compactMoney(center.budget)} budget. Account contributions: ${accountText}. These explain the numerical variance; business causes still require supporting evidence.`, view: 'chart', center: center.name, period };
    }
    if (/table|underlying|show.*data|view.*data|numbers/.test(q)) {
      return { text: `Here is the cost-center breakdown for ${report.periodLabel}. Values in the table are USD thousands. The total is calculated from the same rows used in the chart.`, view: 'data', period };
    }
    if (/opex|operating expenses|budget|variance|compare|comparison|august|september/.test(q)) {
      return { text: summary(period), view: 'chart', period };
    }
    return { text: 'This is a guided UI demo, not a connected AI assistant yet. You can compare Opex with budget, break down a cost center, view the data table, or inspect the Opex definition. Try one of the suggested questions below.' };
  },
};
