import { test, expect } from '@playwright/test';

test.describe('Pipeline Flow', () => {
  test('pipeline page loads with 10 stage columns', async ({ page }) => {
    await page.goto('/pipeline');
    await expect(page.getByRole('heading', { name: 'Pipeline' })).toBeVisible();

    // Should show all 10 pipeline stages
    await expect(page.getByText('Inquiry')).toBeVisible();
    await expect(page.getByText('Intake Submitted')).toBeVisible();
    await expect(page.getByText('Fit Assessment')).toBeVisible();
    await expect(page.getByText('Payment')).toBeVisible();
    await expect(page.getByText('Analysis & Prep')).toBeVisible();
    await expect(page.getByText('Session Scheduled')).toBeVisible();
    await expect(page.getByText('Session Complete')).toBeVisible();
    await expect(page.getByText('Deliverables Sent')).toBeVisible();
    await expect(page.getByText('Follow-Up Scheduled')).toBeVisible();
    await expect(page.getByText('Follow-Up Complete')).toBeVisible();
  });

  test('can move a client forward in the pipeline', async ({ page }) => {
    // First, create a test client
    await page.goto('/clients/new');
    const pipelineTestName = `Pipeline Test ${Date.now()}`;
    await page.fill('#q01', 'Pipeline Test Salon');
    await page.fill('#q02', pipelineTestName);
    await page.fill('#q03', 'pipeline@example.com');
    await page.fill('#q04', 'Temecula, CA');
    await page.fill('#q05', 'Spa');
    await page.selectOption('#q06', '1_3yr');
    const consentText = page.getByText('I understand that this marketing reset');
    await consentText.scrollIntoViewIfNeeded();
    await consentText.click();
    await page.getByRole('button', { name: 'Save Client' }).click();
    await expect(page).toHaveURL(/\/clients\/\d+/, { timeout: 10000 });

    // Go to pipeline
    await page.getByRole('link', { name: 'Pipeline' }).click();
    await expect(page.getByRole('heading', { name: 'Pipeline' })).toBeVisible();

    // Find the test client card
    const clientCard = page.getByText(pipelineTestName).first();
    await expect(clientCard).toBeVisible();

    // The card's parent has move buttons — click the last button (ChevronRight = move forward)
    const cardWrapper = clientCard.locator('..').locator('..');
    const moveForwardButton = cardWrapper.locator('button').last();
    await moveForwardButton.click();

    // Confirm dialog should appear — click "Move to ..." button
    await expect(page.getByRole('button', { name: /Move to/i })).toBeVisible();
    await page.getByRole('button', { name: /Move to/i }).click();

    // Wait for the move to complete
    await page.waitForTimeout(1000);
  });
});
