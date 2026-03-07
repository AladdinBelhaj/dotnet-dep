const { By, until } = require('selenium-webdriver');
const { getDriver, BASE_URL, DEFAULT_USERNAME, DEFAULT_PASSWORD } = require('./config');

async function runLoginTests() {
    let driver;
    try {
        console.log('Starting Login Tests...');
        driver = await getDriver();

        // Test Case: Successful Login (username/password)
        await driver.get(`${BASE_URL}/login`);

        // Find inputs (Login.tsx uses name="username" and name="password")
        const usernameInput = await driver.findElement(By.css('input[name="username"], #username'));
        const passwordInput = await driver.findElement(By.css('input[name="password"], #password`'));
        const loginButton = await driver.findElement(By.css('button[type="submit"], button.MuiButton-contained'));

        // Interact
        await usernameInput.sendKeys(DEFAULT_USERNAME);
        await passwordInput.sendKeys(DEFAULT_PASSWORD);
        await loginButton.click();

        // Verify redirect to root (Login navigates to "/")
        await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
        console.log('✅ Login Successful Test Passed');

        // Test Case: Invalid credentials shows error
        await driver.get(`${BASE_URL}/login`);

        const badUsername = await driver.findElement(By.css('input[name="username"], #username`'));
        const badPassword = await driver.findElement(By.css('input[name="password"], #password`'));
        const submitButton = await driver.findElement(By.css('button[type="submit"], button.MuiButton-contained'));

        await badUsername.clear();
        await badPassword.clear();
        await badUsername.sendKeys('invalid-user');
        await badPassword.sendKeys('wrong-password');
        await submitButton.click();

        // Expect an error alert to appear (MUI Alert with error text)
        await driver.wait(
            until.elementLocated(
                By.xpath("//div[contains(@class,'MuiAlert-root') and contains(., 'Login failed')]")
            ),
            5000
        );
        console.log('✅ Login Invalid-Credentials Test Passed');

    } catch (error) {
        console.error('❌ Login Test Failed:', error);
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

if (require.main === module) {
    runLoginTests();
}

module.exports = { runLoginTests };
