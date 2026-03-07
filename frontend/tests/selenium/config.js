const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const DEFAULT_USERNAME = process.env.E2E_USERNAME || 'admin';
const DEFAULT_PASSWORD = process.env.E2E_PASSWORD || 'admin123';

// Basic setup function to get a driver (Chrome)
async function getDriver(headless = true) {
    const options = new chrome.Options();
    if (headless) {
        options.addArguments('--headless=new');
    }
    options.addArguments('--no-sandbox', '--disable-dev-shm-usage');

    // Assuming chromedriver is in path or installed via npm (npm handles path if run via npm scripts usually, 
    // but explicitly setting service builder or path env might be needed depending on env. 
    // With 'chromedriver' package installed, it attempts to find it automatically.)

    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    return driver;
}

module.exports = {
    getDriver,
    BASE_URL,
    DEFAULT_USERNAME,
    DEFAULT_PASSWORD,
};
