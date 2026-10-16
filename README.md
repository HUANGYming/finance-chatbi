# Finance ChatBI

English Finance analysis UI based on the approved **Analysis workspace** design: conversation on the left, contextual analysis on the right. On small screens, the analysis and conversation stack vertically.

## Run locally

Requires Node.js **22.12+**. If you use nvm, run `nvm use` to select the version in `.nvmrc`.

```sh
npm install
npm run dev
```

Open the local address printed by Vite. For a production bundle, run `npm run build`; static output is in `dist/`. `npm run preview` serves that bundle locally.

## Implemented

- The approved workspace layout, responsive down to 320px.
- September / August 2026 sample reports, with positive, negative, and zero expense variance.
- Chart, data table, metric definition, and proposed sources.
- Cost-center → account drilldown with reconciling sample numbers.
- Guided demo conversation, contextual follow-ups, request cancellation, retry state, and new analysis.
- CSV export with explicit demo labeling, period, currency, budget version, and unscaled USD amounts.
- Keyboard-accessible tabs, labels, loading announcements, and reduced-motion support.

**All figures are fictional. There is no Qwen or Yellowbrick connection, real authentication, or financial reconciliation.** The guided demo matches a limited set of English questions; it is not an LLM. No external font, analytics, or CDN is required at runtime. Nothing is persisted to browser storage.

## Code organization

```text
src/
  App.tsx                    Request lifecycle and shared workspace state
  components/
    Conversation.tsx         Messages, suggested questions, composer
    AnalysisPanel.tsx        Context, KPI cards, tabs, drilldown, export
    VarianceChart.tsx         Positive/negative budget variance
    DataTable.tsx             Reusable finance table
    Definitions.tsx           Metric definition and source status
  data/reports.ts             Fictional demo fixtures
  services/demoClient.ts      Guided demo responses
  lib/finance.ts              Formatting, totals, CSV export
  types.ts                   Data and client contracts
  styles.css                 Responsive product styling
tests/workspace.spec.ts       Data consistency and browser interaction checks
```

## Backend integration boundary

`FinanceClient` in `src/types.ts` separates UI from request handling:

```ts
getReport(period, signal): Promise<FinanceReport>
ask(question, context, signal): Promise<ChatReply>
```

`App` currently defaults to `demoClient`. A future backend adapter can implement this interface and be passed as the `client` prop. The current boot/reset data and initial answer are demo fixtures too; replace those with an authenticated initial load before enabling a live adapter. Source labels and demo notices must also be derived from real backend metadata before going live.

The browser should call your application backend, which owns identity, semantic retrieval, Qwen calls, SQL validation and Yellowbrick access. Do not put model API secrets or database credentials in client-side environment variables. For production, expand report/metric metadata, authorization, query provenance, and structured response validation based on the actual backend contract.

## Verification

```sh
npm run build
npm test
```

Browser tests use installed Google Chrome (`channel: 'chrome'`) and start a local Vite server if necessary. Install Chrome or adjust the Playwright browser configuration on other machines. Tests cover account-to-total consistency, unsupported demo questions, drilldown, export, period/context synchronization, cancellation/reset, keyboard tabs, and mobile overflow.

The development server binds to `127.0.0.1`. No deployment is configured.
