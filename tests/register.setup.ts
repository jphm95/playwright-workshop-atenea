import { test as setup, expect, APIRequestContext } from '@playwright/test';
import { BackendUtils } from '../utils/backendUtils';
import TestData from '../data/testData.json';
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashboardPage';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';
import fs from 'fs/promises';
import path from 'path';
import { request } from 'http';


let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let modalCreateAccount: ModalCreateBankAccount;

const userSendsAuthFile = 'playwright/.auth/userSends.json'
const userReceivesAuthFile = 'playwright/.auth/userReceives.json'
const senderUserDataFile = 'playwright/.auth/userSends.data.json'

setup.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    modalCreateAccount = new ModalCreateBankAccount(page);

    await loginPage.navigateToLoginPage();
});

setup('Generate User that wires money', async ({ page, request }) => {
    const newUser = await BackendUtils.createUserApiRequest(request, TestData.validUser)

    //Store new user data to use it in further transaction tests
    await fs.writeFile(path.resolve(__dirname, '..', senderUserDataFile), JSON.stringify(newUser, null, 2));

    await loginPage.fillLoginFormAndClickLoginButton(newUser);
    await dashboardPage.addAccountButton.click();
    await modalCreateAccount.selectAccountType('Débito');
    await modalCreateAccount.addQuantity('1000');
    await modalCreateAccount.createAccountButton.click();
    await expect(page.getByText('Cuenta creada exitosamente')).toBeVisible();
    await page.context().storageState({ path: userSendsAuthFile });
});

setup('Create user, Login user that receives funds ', async ({ page, request }) => {
    const newUser = await BackendUtils.createUserApiRequest(request, TestData.validUser, false);
    await loginPage.fillLoginFormAndClickLoginButton(newUser);
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    await page.context().storageState({ path: userReceivesAuthFile });
});
