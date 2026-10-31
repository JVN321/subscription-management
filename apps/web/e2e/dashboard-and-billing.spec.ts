import { test, expect } from '@playwright/test';

test.describe('Brightloop Subscription Platform E2E Tests (Playwright)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for main dashboard to be visible
    await expect(page.getByText('BRIGHTLOOP', { exact: true })).toBeVisible();
  });

  test('loads dashboard with industrial precision design system and metric strip', async ({ page }) => {
    await expect(page).toHaveTitle(/Brightloop/i);

    // Verify primary metric strip elements
    await expect(page.locator('text=Monthly Recurring Revenue')).toBeVisible();
    await expect(page.locator('text=Active Subscriptions')).toBeVisible();
    await expect(page.locator('text=Settled Revenue')).toBeVisible();
    await expect(page.locator('text=Outstanding Balance')).toBeVisible();
  });

  test('toggles light and dark themes smoothly', async ({ page }) => {
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');

    // Click theme toggle button
    const themeBtn = page.locator('button[title*="Mode"]');
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();

    // Verify theme changed
    const toggledTheme = await html.getAttribute('data-theme');
    expect(toggledTheme).not.toBe(initialTheme);
  });

  test('switches across navigation segmented tabs', async ({ page }) => {
    // 1. Quotations Tab
    await page.click('button:has-text("Quotations")');
    await expect(page.locator('h2:has-text("Quotations")')).toBeVisible();

    // 2. Subscriptions Tab
    await page.click('button:has-text("Subscriptions")');
    await expect(page.locator('h2:has-text("Subscriptions")')).toBeVisible();
    await expect(page.locator('th:has-text("Subscription")')).toBeVisible();

    // 3. Invoices Tab
    await page.click('button:has-text("Invoices & Payments")');
    await expect(page.locator('h2:has-text("Invoices & Payments")')).toBeVisible();

    // 4. Catalog Tab
    await page.click('button:has-text("Catalog")');
    await expect(page.locator('text=Software Catalog')).toBeVisible();
    await expect(page.locator('text=Brand Variants').first()).toBeVisible();

    // 5. Customer Portal Tab
    await page.click('button:has-text("Customer Portal")');
    await expect(page.locator('text=Agreements:')).toBeVisible();
  });

  test('opens New Quotation modal dialog cleanly', async ({ page }) => {
    // Switch to Quotations or click button
    await page.click('button:has-text("Quotations")');
    const newQuoteBtn = page.locator('button:has-text("New Quotation")');
    await expect(newQuoteBtn).toBeVisible();
    await newQuoteBtn.click();

    // Verify dialog panel appears
    await expect(page.locator('h3:has-text("New Quotation")')).toBeVisible();
    await expect(page.locator('label:has-text("Customer")').first()).toBeVisible();

    // Close modal
    await page.click('button:has-text("✕")');
    await expect(page.locator('h3:has-text("New Quotation")')).not.toBeVisible();
  });

  test('triggers manual billing scan and shows completion feedback', async ({ page }) => {
    const scanBtn = page.locator('button:has-text("Run Billing Scan")').first();
    await expect(scanBtn).toBeVisible();
    await scanBtn.click();

    // Verify toast notification appears
    await expect(page.locator('text=Billing scan complete')).toBeVisible({ timeout: 10000 });
  });

  test('switches persona to Customer and operates self-service portal', async ({ page }) => {
    // Select customer role
    const roleSelect = page.locator('header select');
    await roleSelect.selectOption('customer');

    // Customer portal should be active
    await expect(page.locator('text=Customer Portal')).toBeVisible();
    await expect(page.locator('text=Agreements:')).toBeVisible();
    await expect(page.locator('text=Invoice Statements')).toBeVisible();
  });
});
