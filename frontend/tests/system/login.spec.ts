import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
        // Navigate to login page
        await page.goto('/login');

        // Check page title (based on report finding)
        await expect(page).toHaveTitle(/frontend/i);

        // Fill in credentials
        // Using name selectors as seen in Login.tsx code: name="username", name="password"
        await page.fill('input[name="username"]', 'comptable');
        await page.fill('input[name="password"]', 'comptable123');

        // Click login button
        // Login.tsx has a button with type="submit" and text "Sign In"
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Verify redirection to home/dashboard
        // Login.tsx navigates to '/' on success
        await expect(page).toHaveURL('/');
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="username"]', 'wronguser');
        await page.fill('input[name="password"]', 'wrongpass');
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Verify error message
        // Login.tsx displays an Alert on error
        await expect(page.getByRole('alert')).toBeVisible();
    });
});
