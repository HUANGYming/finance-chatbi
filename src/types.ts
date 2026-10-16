export type Period = '2026-08' | '2026-09';
export type ReportView = 'chart' | 'data' | 'definition';
export type CostCenter = 'Technology' | 'Sales' | 'Operations' | 'Corporate';

export interface FinanceRow {
  name: string;
  actual: number;
  budget: number;
}

export interface CenterRow extends FinanceRow {
  name: CostCenter;
  accounts: FinanceRow[];
}

export interface FinanceReport {
  period: Period;
  periodLabel: string;
  shortPeriod: string;
  currency: 'USD';
  entity: string;
  budgetVersion: string;
  semanticVersion: string;
  rows: CenterRow[];
  isDemo: boolean;
  updatedAt: string | null;
}

export interface AnalysisContext {
  period: Period;
  selectedCenter: CostCenter | null;
}

export interface ChatReply {
  text: string;
  view?: ReportView;
  center?: CostCenter;
  period?: Period;
}

/** Implement this adapter at the backend boundary. Never send DB credentials to the browser. */
export interface FinanceClient {
  getReport(period: Period, signal: AbortSignal): Promise<FinanceReport>;
  ask(question: string, context: AnalysisContext, signal: AbortSignal): Promise<ChatReply>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  period: string;
}
