import type { FinanceReport, Period } from '../types';

const shared = {
  currency: 'USD' as const,
  entity: 'Corporate group',
  budgetVersion: 'Approved FY2026',
  semanticVersion: 'Finance dictionary · v12 (demo)',
  isDemo: true,
  updatedAt: null,
};

// Fictional data only. Amounts are stored in whole USD, not display-scaled thousands.
export const DEMO_REPORTS: Record<Period, FinanceReport> = {
  '2026-09': {
    ...shared, period: '2026-09', periodLabel: 'September 2026', shortPeriod: 'Sep 2026',
    rows: [
      { name: 'Technology', actual: 1050000, budget: 900000, accounts: [
        { name: 'Cloud services', actual: 590000, budget: 500000 },
        { name: 'Contractors', actual: 460000, budget: 400000 },
      ] },
      { name: 'Sales', actual: 645000, budget: 600000, accounts: [
        { name: 'Sales compensation', actual: 465000, budget: 450000 },
        { name: 'Travel & events', actual: 180000, budget: 150000 },
      ] },
      { name: 'Operations', actual: 630000, budget: 600000, accounts: [
        { name: 'Facilities', actual: 410000, budget: 400000 },
        { name: 'Professional services', actual: 220000, budget: 200000 },
      ] },
      { name: 'Corporate', actual: 315000, budget: 300000, accounts: [
        { name: 'Administration', actual: 215000, budget: 200000 },
        { name: 'Insurance', actual: 100000, budget: 100000 },
      ] },
    ],
  },
  '2026-08': {
    ...shared, period: '2026-08', periodLabel: 'August 2026', shortPeriod: 'Aug 2026',
    rows: [
      { name: 'Technology', actual: 850000, budget: 900000, accounts: [
        { name: 'Cloud services', actual: 480000, budget: 500000 },
        { name: 'Contractors', actual: 370000, budget: 400000 },
      ] },
      { name: 'Sales', actual: 570000, budget: 600000, accounts: [
        { name: 'Sales compensation', actual: 440000, budget: 450000 },
        { name: 'Travel & events', actual: 130000, budget: 150000 },
      ] },
      { name: 'Operations', actual: 580000, budget: 600000, accounts: [
        { name: 'Facilities', actual: 390000, budget: 400000 },
        { name: 'Professional services', actual: 190000, budget: 200000 },
      ] },
      { name: 'Corporate', actual: 300000, budget: 300000, accounts: [
        { name: 'Administration', actual: 200000, budget: 200000 },
        { name: 'Insurance', actual: 100000, budget: 100000 },
      ] },
    ],
  },
};
