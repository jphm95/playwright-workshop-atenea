import { test, expect } from '@playwright/test'
import { DashboardPage } from '../pages/dashboardPage';
import { ModalTransferMoney } from '../pages/modalTransferMoney';
import TestData from '../data/testData.json';

let dashboardPage: DashboardPage;
let modalTransferMoney: ModalTransferMoney;

const testUserSends = test.extend({
    storageState: require.resolve('../playwright/.auth/userSends.json')
});

const testUserReceives = test.extend({
    storageState: require.resolve('../playwright/.auth/userReceives.json')
});

test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    modalTransferMoney = new ModalTransferMoney(page);
    await dashboardPage.navigateToDashboardPage();
});

testUserSends('TC-12 Verify successful Transaction', async ({ page }) => {
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    await dashboardPage.sendMonyButton.click();
    await modalTransferMoney.fillTransferFormAndClickSend(TestData.validUser.email, '100');
    await expect(page.getByText('Transferencia enviada a ' + TestData.validUser.email)).toBeVisible();
});

testUserReceives('TC-13 Verify the Receptor User receives the funds', async ({ page }) => {
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    await page.waitForTimeout(5000);
    await expect(page.getByText('Transferencia de ').first()).toBeVisible();
});