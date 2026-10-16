import { useEffect, useRef, useState } from 'react';
import { BarChart3, Plus } from 'lucide-react';
import AnalysisPanel from './components/AnalysisPanel';
import Conversation from './components/Conversation';
import { DEMO_REPORTS } from './data/reports';
import { demoClient, summary } from './services/demoClient';
import type { CostCenter, FinanceClient, FinanceReport, Message, Period, ReportView } from './types';

const initialMessages: Message[] = [
  { id: 'initial-question', role: 'user', text: 'How did September Opex compare with budget?', period: 'Sep 2026' },
  { id: 'initial-answer', role: 'assistant', text: summary('2026-09'), period: 'Sep 2026' },
];

export default function App({ client = demoClient }: { client?: FinanceClient }) {
  const [report, setReport] = useState<FinanceReport>(DEMO_REPORTS['2026-09']);
  const [view, setView] = useState<ReportView>('chart');
  const [center, setCenter] = useState<CostCenter | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [busy, setBusy] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Preparing sample analysis…');
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const retry = useRef<(() => void) | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  function begin(label: string) {
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    setBusy(true); setError(null); setLoadingLabel(label); return controller;
  }
  function finish(controller: AbortController) {
    if (request.current === controller) { request.current = null; setBusy(false); }
  }
  function addMessage(role: Message['role'], text: string, period = report.shortPeriod) {
    setMessages(previous => [...previous, { id: crypto.randomUUID(), role, text, period }]);
  }

  async function ask(question: string, isRetry = false) {
    const trimmed = question.trim(); if (!trimmed) return;
    if (!isRetry) addMessage('user', trimmed);
    const controller = begin('Preparing sample analysis…');
    retry.current = () => { void ask(trimmed, true); };
    try {
      const reply = await client.ask(trimmed, { period: report.period, selectedCenter: center }, controller.signal);
      let current = report;
      if (reply.period && reply.period !== report.period) current = await client.getReport(reply.period, controller.signal);
      if (controller.signal.aborted) return;
      if (current !== report) { setReport(current); setCenter(null); }
      if (reply.view) setView(reply.view);
      if (reply.center) setCenter(reply.center);
      addMessage('assistant', reply.text, current.shortPeriod);
    } catch {
      if (!controller.signal.aborted) setError('The analysis could not be loaded. Your previous results are still available.');
    } finally { finish(controller); }
  }

  async function changePeriod(period: Period) {
    if (period === report.period) return;
    const controller = begin('Loading sample period…');
    retry.current = () => { void changePeriod(period); };
    try {
      const next = await client.getReport(period, controller.signal);
      if (controller.signal.aborted) return;
      setReport(next); setCenter(null);
      addMessage('assistant', `Analysis changed to ${next.periodLabel}. The chart, table, and key figures now use this period. Earlier messages retain their original period.`, next.shortPeriod);
    } catch {
      if (!controller.signal.aborted) setError('This period could not be loaded. Your previous period is still selected.');
    } finally { finish(controller); }
  }

  function cancel() {
    request.current?.abort(); request.current = null; setBusy(false); setError(null);
    addMessage('assistant', 'Request stopped. The last completed analysis is still displayed.');
  }

  function newAnalysis() {
    request.current?.abort(); request.current = null; retry.current = null;
    setBusy(false); setError(null); setMessages([]); setReport(DEMO_REPORTS['2026-09']); setView('chart'); setCenter(null);
  }

  return <div className="app-shell">
    <a href="#analysis" className="skip-link">Skip to analysis</a>
    <header className="app-header">
      <a className="brand" href="#analysis" aria-label="Finance workspace"><span className="brand-mark"><BarChart3 size={21} strokeWidth={1.8} /></span><span>Finance workspace<span className="brand-subtitle">Insights you can trace.</span></span></a>
      <div className="header-actions"><span className="demo-badge"><span />Demo workspace</span><button className="button new-analysis" onClick={newAnalysis}><Plus size={15} />New analysis</button><span className="avatar" aria-label="Finance team demo profile">FC</span></div>
    </header>
    <div className="workspace">
      <Conversation messages={messages} busy={busy} loadingLabel={loadingLabel} error={error} onAsk={question => { void ask(question); }} onCancel={cancel} onRetry={() => retry.current?.()} />
      <AnalysisPanel report={report} view={view} selectedCenter={center} busy={busy} onPeriod={period => { void changePeriod(period); }} onView={setView} onCenter={setCenter} onAsk={question => { void ask(question); }} />
    </div>
  </div>;
}
