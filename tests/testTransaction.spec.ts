import { test, expect } from '@playwright/test'
import { DashboardPage } from '../pages/dashboardPage';
import { ModalTransferMoney } from '../pages/modalTransferMoney';
import TestData from '../data/testData.json';
import fs from 'fs/promises';
import path from 'path';

let dashboardPage: DashboardPage;
let modalTransferMoney: ModalTransferMoney;

const testUserSends = test.extend({
    storageState: path.resolve(__dirname, '..', 'playwright', '.auth', 'userSends.json')
});

const testUserReceives = test.extend({
    storageState: path.resolve(__dirname, '..', 'playwright', '.auth', 'userReceives.json')
});

test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    modalTransferMoney = new ModalTransferMoney(page);
    await dashboardPage.navigateToDashboardPage();
});

testUserSends.beforeEach('TC-12 Verify successful Transaction', async ({ page }) => {
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    await dashboardPage.sendMonyButton.click();
    await modalTransferMoney.fillTransferFormAndClickSend(TestData.validUser.email, '100');
    await expect(page.getByText('Transferencia enviada a ' + TestData.validUser.email)).toBeVisible();
});

testUserReceives.beforeEach('TC-13 Verify the Receptor User receives the funds', async ({ page }) => {
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    await page.waitForTimeout(5000);
    await expect(page.getByText('Transferencia de ').first()).toBeVisible();
});

// Integrated Test: Transfer money through the API and validate it in the UI
testUserReceives.beforeEach('TC-14 Verify received transaction (Transfered by API)', async ({ page, request }) => {
    //1. Set Data and Sender Token

    // Read SenderUser Data File and get email
    const senderUserData = path.resolve(__dirname, '..', 'playwright', '.auth', 'userSends.data.json'); //File Location
    const senderUserContentData = await fs.readFile(senderUserData, 'utf-8'); //Read File
    const dataSenderUser = JSON.parse(senderUserContentData); //Convert File in JSON object
    const emailSenderUser = dataSenderUser.email;
    expect(emailSenderUser, 'Email from file not defined').toBeDefined();

    //Read Sender Auth File to get JWT Token
    const senderUserAuth =  path.resolve(__dirname, '..', 'playwright', '.auth', 'userSends.json');
    const senderUserContentAuth = await fs.readFile(senderUserAuth, 'utf-8');
    const dataSenderUserAuthh = JSON.parse(senderUserContentAuth);

    const jwtSenderUser = dataSenderUserAuthh.origins[0]?.localStorage.find((item: { name: string, value: string }) => item.name === 'jwt');
    expect(jwtSenderUser, 'JWT not read properly').toBeDefined();
    const jwt = jwtSenderUser.value;

    //2. Get Account and Transfer Money via API

    //a) Get Sender Accont -> Get Origin ID 
    const responseAccounts = await request.get('http://localhost:6007/api/accounts', {
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    });
    expect(responseAccounts.ok(), `Api Response Accounts failed: ${responseAccounts.status()}`).toBeTruthy();
    const accounts = await responseAccounts.json();
    expect(accounts.length, 'No accounts found').toBeGreaterThan(0);
    const idOriginAccount = accounts[0]._id; //Takes ID value from the first account

    const randomAmount = Math.floor(Math.random() * 100) + 1;
    console.log(`Wiring Funds $ ${randomAmount} from Account: ${idOriginAccount} to  ${TestData.validUser.email}`)

    //With all the data set, transfer the funds:
    const transferResponse = await request.post('http://localhost:6007/api/transactions/transfer', {
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: {
            fromAccountId: idOriginAccount,
            toEmail: TestData.validUser.email,
            amount: randomAmount
        }
    });
    
    expect(transferResponse.ok(), `API Error: ${transferResponse.status()}`).toBeTruthy();

    // 3. Validate Received Ammount and transaction is visible in the UI
    await page.reload(); //Reload page 
    await page.waitForLoadState('networkidle');
    await expect(dashboardPage.dashboardTitle).toBeVisible();

    //Check that page contains 'emailSenderUser' - First row
    await expect(dashboardPage.transactionsListElements.first()).toContainText(emailSenderUser);

    //Check that page contais ammount - RegEx E.G '15.00'
    const regexAmmount = new RegExp(String(randomAmount.toFixed(2)));
    await expect(dashboardPage.ammountsWiredList.first()).toContainText(regexAmmount);

});
