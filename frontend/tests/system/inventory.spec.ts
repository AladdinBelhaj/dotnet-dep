import { test, expect } from '@playwright/test';

test.describe('Inventory Management', () => {

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[name="username"]', 'comptable');
        await page.fill('input[name="password"]', 'comptable123');
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Wait for navigation after login
        await page.waitForURL('/'); // Landing page after login

        // Navigate to Inventory page via sidebar
        // For 'Comptable' role, the first menu item they see is 'Inventory'
        await page.getByRole('button', { name: 'Inventory' }).click();
        await page.waitForURL('/inventory');
    });

    test.describe('Categories', () => {
        test('should create a new category', async ({ page }) => {
            // Click Categories button
            await page.getByRole('button', { name: 'Categories', exact: true }).click();

            // Verify Dialog Open
            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Manage Categories' })).toBeVisible();

            // Add Category
            const categoryName = `TestCat${Date.now()}`;
            await page.getByLabel('New Category Name').fill(categoryName);
            await page.getByRole('button', { name: 'Add' }).click();

            // Verify it appears in the list
            await expect(page.getByRole('dialog').getByText(categoryName)).toBeVisible();

            // Close Dialog
            await page.getByRole('button', { name: 'Close' }).click();
        });
    });

    test.describe('Suppliers', () => {
        test('should create a new supplier', async ({ page }) => {
            // Click Suppliers button
            await page.getByRole('button', { name: 'Suppliers', exact: true }).click();

            // Verify Dialog Open
            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Manage Suppliers' })).toBeVisible();

            // Add Supplier
            const supplierName = `TestSup${Date.now()}`;
            // Find the specific Name input within the dialog
            await page.getByRole('dialog').getByLabel('Name').fill(supplierName);
            await page.getByRole('dialog').getByLabel('Contact Info').fill('test@supplier.com');
            await page.getByRole('button', { name: 'Add' }).click();

            // Verify it appears
            await expect(page.getByRole('dialog').getByText(supplierName)).toBeVisible();

            // Close
            await page.getByRole('button', { name: 'Close' }).click();
        });
    });

    test.describe('Products', () => {
        test('should create a new product', async ({ page }) => {
            // Click Add Product button (button text includes a plus sign icon but the accessible name might just be 'Add Product')
            await page.getByRole('button', { name: /Add Product/i }).click();

            // Verify Dialog
            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Add New Product' })).toBeVisible();

            // Fill Form
            const productName = `Product${Date.now()}`;
            await page.getByLabel('Product Name').fill(productName);
            await page.getByLabel('Reference').fill(`REF${Date.now()}`);
            await page.getByLabel('Initial Quantity').fill('10');
            await page.getByLabel('Min Stock Alert').fill('5');
            await page.getByLabel('Price').fill('100');

            // Select Category (MUI Select)
            await page.getByLabel('Category').click();
            await page.getByRole('listbox').waitFor({ state: 'visible' });
            await page.getByRole('option').first().click();
            // Wait for listbox to close
            await page.getByRole('listbox').waitFor({ state: 'hidden' });

            // Select Supplier
            await page.getByLabel('Supplier').click();
            await page.getByRole('listbox').waitFor({ state: 'visible' });
            await page.getByRole('option').first().click();
            await page.getByRole('listbox').waitFor({ state: 'hidden' });

            // Save
            await page.getByRole('button', { name: 'Save' }).click();

            // Wait for dialog to close and verify product appears in table
            await expect(page.getByRole('dialog')).not.toBeVisible();
            await expect(page.getByText(productName)).toBeVisible();
        });
    });

});
