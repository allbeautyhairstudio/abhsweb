import { test, expect } from '@playwright/test';

test.describe('Client Detail Page', () => {
  // Helper: create a client and return the detail page URL
  async function createTestClient(page: import('@playwright/test').Page) {
    await page.goto('/clients/new');
    const name = `Detail Test ${Date.now()}`;
    await page.fill('#q01', 'Detail Test Salon');
    await page.fill('#q02', name);
    await page.fill('#q03', 'detail@example.com');
    await page.fill('#q04', 'Temecula, CA');
    await page.fill('#q05', 'Beauty Salon');
    await page.selectOption('#q06', '3_7yr');
    await page.fill('#q07', 'Cuts, color');
    await page.fill('#q08', 'Color treatments');
    const consentText = page.getByText('I understand that this marketing reset');
    await consentText.scrollIntoViewIfNeeded();
    await consentText.click();
    await page.getByRole('button', { name: 'Save Client' }).click();
    await expect(page).toHaveURL(/\/clients\/\d+/, { timeout: 10000 });
    return { name };
  }

  test('client detail page shows all tabs', async ({ page }) => {
    const { name } = await createTestClient(page);

    // Client name should be visible
    await expect(page.getByText(name)).toBeVisible();

    // All 6 tabs should be present
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Intake Data' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Fit Assessment/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Prompts' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Deliverables' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Notes/i })).toBeVisible();
  });

  test('can switch between tabs', async ({ page }) => {
    await createTestClient(page);

    // Click Intake Data tab
    await page.getByRole('tab', { name: 'Intake Data' }).click();
    await expect(page.getByText('Business Snapshot')).toBeVisible();

    // Click Prompts tab
    await page.getByRole('tab', { name: 'Prompts' }).click();
    // Should show the active prompts tab panel
    await expect(page.getByRole('tabpanel', { name: 'Prompts' })).toBeVisible();

    // Click Deliverables tab
    await page.getByRole('tab', { name: 'Deliverables' }).click();
    await expect(page.getByRole('tabpanel', { name: 'Deliverables' })).toBeVisible();
  });

  test('export button downloads client data', async ({ page }) => {
    await createTestClient(page);

    // Look for the export button
    const exportButton = page.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible()) {
      // Start waiting for the download before clicking
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.json');
    }
  });

  test('client search filters results', async ({ page }) => {
    const { name } = await createTestClient(page);

    // Go to client list
    await page.getByRole('link', { name: 'Clients' }).first().click();
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();

    // Search for the client
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill(name);

    // The test client should be visible (first() for mobile+desktop duplicate)
    await expect(page.getByText(name).first()).toBeVisible();

    // Search for something that doesn't exist
    await searchInput.fill('zzznonexistent999');
    await expect(page.getByText(name).first()).not.toBeVisible();
  });
});
