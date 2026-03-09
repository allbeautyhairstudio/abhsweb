import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('dashboard loads with correct heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Your business at a glance')).toBeVisible();
  });

  test('sidebar links navigate to correct pages', async ({ page }) => {
    await page.goto('/');
    // Scope all nav clicks to the sidebar
    const sidebar = page.locator('nav');

    // Navigate to Clients
    await sidebar.getByRole('link', { name: 'Clients' }).click();
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();

    // Navigate to Pipeline
    await sidebar.getByRole('link', { name: 'Pipeline', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Pipeline' })).toBeVisible();

    // Navigate to Prompt Library
    await sidebar.getByRole('link', { name: 'Prompt Library' }).click();
    await expect(page.getByRole('heading', { name: 'Prompt Library' })).toBeVisible();

    // Navigate to Metrics
    await sidebar.getByRole('link', { name: 'Metrics' }).click();
    await expect(page.getByRole('heading', { name: 'Metrics' })).toBeVisible();

    // Navigate back to Dashboard
    await sidebar.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('dashboard shows metric cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Total Clients')).toBeVisible();
    await expect(page.getByText('Pipeline Overview')).toBeVisible();
  });

  test('New Client button navigates to intake form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'New Client' }).first().click();
    await expect(page.getByRole('heading', { name: 'New Client' })).toBeVisible();
  });
});
