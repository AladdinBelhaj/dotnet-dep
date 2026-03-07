const { By, until } = require('selenium-webdriver');
const { getDriver, BASE_URL, DEFAULT_USERNAME, DEFAULT_PASSWORD } = require('./config');

async function runInventoryTests() {
    let driver;
    try {
        console.log('Starting Inventory Tests...');
        driver = await getDriver();

        // ---------- Setup: Login first ----------
        await driver.get(`${BASE_URL}/login`);
        await driver.findElement(By.css('input[name="username"], #username')).sendKeys(DEFAULT_USERNAME);
        await driver.findElement(By.css('input[name="password"], #password`')).sendKeys(DEFAULT_PASSWORD);
        await driver.findElement(By.css('button[type="submit"], button.MuiButton-contained')).click();
        await driver.wait(until.urlIs(`${BASE_URL}/`), 8000);

        // Navigate to Inventory
        await driver.get(`${BASE_URL}/inventory`);

        // ---------- Test Case 1: Add Category ----------
        const categoryButton = await driver.wait(
            until.elementLocated(By.xpath("//button[normalize-space()='Categories']")),
            5000
        );
        await categoryButton.click();

        // Wait for dialog title and input "New Category Name"
        await driver.wait(
            until.elementLocated(By.xpath("//h2[normalize-space()='Manage Categories']")),
            5000
        );

        const categoryInput = await driver.findElement(
            By.xpath("//label[normalize-space()='New Category Name']/following-sibling::div//input")
        );
        const categoryAddButton = await driver.findElement(
            By.xpath("//button[normalize-space()='Add']")
        );

        const categoryName = `Selenium Category ${Date.now()}`;
        await categoryInput.sendKeys(categoryName);
        await categoryAddButton.click();

        // Verify new category appears in list
        await driver.wait(
            until.elementLocated(
                By.xpath(`//li[contains(@class,'MuiListItem-root')]//span[normalize-space()='${categoryName}']`)
            ),
            8000
        );

        // Close dialog
        const catCloseButton = await driver.findElement(By.xpath("//button[normalize-space()='Close']"));
        await catCloseButton.click();

        console.log('✅ Inventory Category Creation Passed');

        // ---------- Test Case 2: Add Supplier ----------
        const suppliersButton = await driver.wait(
            until.elementLocated(By.xpath("//button[normalize-space()='Suppliers']")),
            5000
        );
        await suppliersButton.click();

        await driver.wait(
            until.elementLocated(By.xpath("//h2[normalize-space()='Manage Suppliers']")),
            5000
        );

        const supplierNameInput = await driver.findElement(
            By.xpath("//label[normalize-space()='Name']/following-sibling::div//input")
        );
        const supplierContactInput = await driver.findElement(
            By.xpath("//label[normalize-space()='Contact Info']/following-sibling::div//input")
        );
        const supplierAddButton = await driver.findElement(
            By.xpath("//button[normalize-space()='Add']")
        );

        const supplierName = `Selenium Supplier ${Date.now()}`;
        await supplierNameInput.sendKeys(supplierName);
        await supplierContactInput.sendKeys('selenium@supplier.test');
        await supplierAddButton.click();

        await driver.wait(
            until.elementLocated(
                By.xpath(`//li[contains(@class,'MuiListItem-root')]//span[normalize-space()='${supplierName}']`)
            ),
            8000
        );

        const supplierCloseButton = await driver.findElement(By.xpath("//button[normalize-space()='Close']"));
        await supplierCloseButton.click();

        console.log('✅ Inventory Supplier Creation Passed');

        // ---------- Test Case 3: Add Product ----------
        const addProductButton = await driver.wait(
            until.elementLocated(By.xpath("//button[normalize-space()='Add Product']")),
            5000
        );
        await addProductButton.click();

        await driver.wait(
            until.elementLocated(
                By.xpath("//h2[normalize-space()='Add New Product' or normalize-space()='Edit Product']")
            ),
            5000
        );

        const productName = `Selenium Product ${Date.now()}`;

        const productNameInput = await driver.findElement(
            By.xpath("//label[normalize-space()='Product Name']/following-sibling::div//input")
        );
        const initialQtyInput = await driver.findElement(
            By.xpath("//label[normalize-space()='Initial Quantity']/following-sibling::div//input")
        );
        const minStockInput = await driver.findElement(
            By.xpath("//label[normalize-space()='Min Stock Alert']/following-sibling::div//input")
        );

        await productNameInput.sendKeys(productName);
        await initialQtyInput.clear();
        await initialQtyInput.sendKeys('10');
        await minStockInput.clear();
        await minStockInput.sendKeys('5');

        // Category select
        const categorySelect = await driver.findElement(
            By.xpath("//label[normalize-space()='Category']/following-sibling::div//div[contains(@role,'button')]")
        );
        await categorySelect.click();
        // pick first option
        const firstCategoryOption = await driver.wait(
            until.elementLocated(By.xpath("//ul//li[@role='option'][1]")),
            5000
        );
        await firstCategoryOption.click();

        // Supplier select
        const supplierSelect = await driver.findElement(
            By.xpath("//label[normalize-space()='Supplier']/following-sibling::div//div[contains(@role,'button')]")
        );
        await supplierSelect.click();
        const firstSupplierOption = await driver.wait(
            until.elementLocated(By.xpath("//ul//li[@role='option'][1]")),
            5000
        );
        await firstSupplierOption.click();

        const saveButton = await driver.findElement(By.xpath("//button[normalize-space()='Save']"));
        await saveButton.click();

        // Verify product appears in table by cell text
        await driver.wait(
            until.elementLocated(
                By.xpath(`//table//td[normalize-space()='${productName}']`)
            ),
            10000
        );

        console.log('✅ Inventory Product Creation Passed');

    } catch (error) {
        console.error('❌ Inventory Test Failed:', error);
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

if (require.main === module) {
    runInventoryTests();
}

module.exports = { runInventoryTests };
