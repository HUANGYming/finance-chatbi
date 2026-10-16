import { test, expect } from '@playwright/test';
import { DEMO_REPORTS } from '../src/data/reports';
import { totals } from '../src/lib/finance';
import { demoClient } from '../src/services/demoClient';

test('sample account contributions reconcile to cost centers and totals', () => {
  for (const report of Object.values(DEMO_REPORTS)) {
    for (const row of report.rows) {
      const sum = totals(row.accounts);
      expect(sum.actual).toBe(row.actual);
      expect(sum.budget).toBe(row.budget);
    }
  }
  expect(totals(DEMO_REPORTS['2026-09'].rows)).toEqual({ actual: 2640000, budget: 2400000, variance: 240000, percentage: 10 });
  expect(totals(DEMO_REPORTS['2026-08'].rows).variance).toBe(-100000);
  expect(totals([{ name: 'Zero budget', actual: 100, budget: 0 }]).percentage).toBeNull();
});

test('an unsupported metric does not produce a made-up revenue answer', async () => {
  const reply = await demoClient.ask('Why was revenue below budget?', { period: '2026-09', selectedCenter: null }, new AbortController().signal);
  expect(reply.text).toContain('only August and September');
  expect(reply.view).toBeUndefined();
});

test('report, account drilldown, definition and CSV are usable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByTestId('actual-value')).toHaveText('$2.64m');
  await expect(page.getByTestId('variance-value')).toHaveText('+$240k');
  await page.getByRole('button', { name: /^Technology, / }).click();
  const drilldown = page.getByRole('region', { name: 'Technology account breakdown' });
  await expect(drilldown).toContainText('Cloud services');
  await expect(drilldown.getByRole('row', { name: /Cloud services/ })).toContainText('+90');
  await page.getByRole('tab', { name: 'Data', exact: true }).click();
  await expect(page.getByRole('tabpanel', { name: 'Data', exact: true })).toContainText('2,640');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('opex-2026-09-demo.csv');
  const stream = await download.createReadStream();
  let csv = ''; for await (const chunk of stream!) csv += chunk.toString();
  expect(csv).toContain('"Total","2640000","2400000","240000","Unfavorable"');
  await page.getByRole('tab', { name: 'Definition & sources' }).click();
  await expect(page.getByRole('tabpanel', { name: 'Definition & sources' })).toContainText('Not connected');
  expect(errors).toEqual([]);
});

test('period change updates chart, table, totals and subsequent chat context', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Reporting period').selectOption('2026-08');
  await expect(page.getByTestId('actual-value')).toHaveText('$2.3m');
  await expect(page.getByTestId('variance-value')).toHaveText('−$100k');
  await expect(page.getByRole('button', { name: /^Technology, / })).toHaveAccessibleName(/−\$50k, Favorable/);
  await page.getByRole('button', { name: 'Break down Technology', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('actual expenses were $850k');
  await expect(page.getByRole('region', { name: 'Technology account breakdown' })).toContainText('-20');
  await page.getByRole('tab', { name: 'Data', exact: true }).click();
  await expect(page.getByRole('tabpanel', { name: 'Data', exact: true })).toContainText('2,300');
});

test('cancel and new analysis prevent stale responses from appearing', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Ask a Finance question' }).fill('Show August Opex vs budget');
  await page.getByRole('button', { name: 'Send question' }).click();
  await page.getByRole('button', { name: 'Stop response' }).click();
  await expect(page.getByRole('log')).toContainText('Request stopped');
  await expect(page.getByTestId('variance-value')).toHaveText('+$240k');
  await page.getByRole('button', { name: 'Break down Technology', exact: true }).click();
  await page.getByRole('button', { name: 'New analysis' }).click();
  await expect(page.getByRole('heading', { name: 'A clearer view of your numbers.' })).toBeVisible();
  await expect(page.getByRole('log')).not.toContainText('Account contributions:');
  await expect(page.getByRole('button', { name: 'Send question' })).toBeDisabled();
});

test('mobile layout fits and tabs support keyboard navigation', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('tab', { name: 'Variance chart' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Data', exact: true })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Data', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(page.getByRole('tabpanel', { name: 'Definition & sources' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('tab', { name: 'Variance chart' }).click();
  await page.getByRole('button', { name: /^Technology, / }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
