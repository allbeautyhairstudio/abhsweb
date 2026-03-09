import { test, expect } from '@playwright/test';

// Unique name to avoid collisions across test runs
const testClientName = `E2E Test Client ${Date.now()}`;
const testBusinessName = `E2E Test Salon ${Date.now()}`;

test.describe('Add Client Flow', () => {
  test('can fill out intake form and save a new client', async ({ page }) => {
    await page.goto('/clients/new');
    await expect(page.getByRole('heading', { name: 'New Client' })).toBeVisible();

    // Section 1: Business Snapshot (minimum required fields)
    await page.fill('#q01', testBusinessName);
    await page.fill('#q02', testClientName);
    await page.fill('#q03', 'e2etest@example.com');
    await page.fill('#q04', 'Temecula, CA');
    await page.fill('#q05', 'Hair Salon');

    // Select how long in business
    await page.selectOption('#q06', '3_7yr');

    await page.fill('#q07', 'Cuts, color, styling');
    await page.fill('#q08', 'Color treatments');

    // Section 2: Capacity
    await page.getByLabel('50-75%').first().click();
    await page.fill('#q10', '15');
    await page.getByLabel('Established but inconsistent').click();
    await page.getByLabel('Consistent bookings').click();

    // Section 12: Consent checkbox — click the label text to toggle
    const consentText = page.getByText('I understand that this marketing reset');
    await consentText.scrollIntoViewIfNeeded();
    await consentText.click();

    // Submit the form
    await page.getByRole('button', { name: 'Save Client' }).click();

    // Should redirect to client detail page
    await expect(page).toHaveURL(/\/clients\/\d+/, { timeout: 10000 });

    // Client name should appear on the detail page
    await expect(page.getByText(testClientName)).toBeVisible();
  });

  test('shows validation error when required field is missing', async ({ page }) => {
    await page.goto('/clients/new');

    // Try to submit without filling required name field
    await page.fill('#q01', 'Test Business');
    // Skip q02 (required client name)

    await page.getByRole('button', { name: 'Save Client' }).click();

    // Should stay on the form and show an error
    await expect(page).toHaveURL(/\/clients\/new/);
  });

  test('new client appears in client list', async ({ page }) => {
    // First create a client
    await page.goto('/clients/new');
    const listTestName = `List Test ${Date.now()}`;
    await page.fill('#q01', 'List Test Salon');
    await page.fill('#q02', listTestName);
    await page.fill('#q03', 'listtest@example.com');
    await page.fill('#q04', 'San Diego, CA');
    await page.fill('#q05', 'Nail Salon');
    await page.selectOption('#q06', '1_3yr');
    // Consent checkbox
    const consentText = page.getByText('I understand that this marketing reset');
    await consentText.scrollIntoViewIfNeeded();
    await consentText.click();
    await page.getByRole('button', { name: 'Save Client' }).click();
    await expect(page).toHaveURL(/\/clients\/\d+/, { timeout: 10000 });

    // Navigate to client list
    await page.getByRole('link', { name: 'Clients' }).first().click();
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();

    // Client should appear in the list — use the link (desktop table) which is always visible
    await expect(page.getByRole('link', { name: listTestName })).toBeVisible();
  });
});
