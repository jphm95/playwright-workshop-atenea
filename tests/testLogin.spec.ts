import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashboardPage';
import { BackendUtils } from '../utils/backendUtils';
import TestData from '../data/testData.json';

let loginPage: LoginPage;
let dashboardPage: DashboardPage;

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  dashboardPage = new DashboardPage(page);
  await loginPage.navigateToLoginPage();
});

test('TC-7: Validate Successful Login ', async ({ page }) => {
  await loginPage.fillLoginFormAndClickLoginButton(TestData.validUser);
  await expect(page.getByText('Inicio de sesión exitoso')).toBeVisible();
  await expect(dashboardPage.dashboardTitle).toBeVisible();
});

test('TC-11: Backend Created User Logs in', async ({ page, request }) => {
  const newUser = await BackendUtils.createUserApiRequest(request, TestData.validUser)

  const responsePromiseLogin = page.waitForResponse('http://localhost:6007/api/auth/login');
  await loginPage.fillLoginFormAndClickLoginButton(newUser);

  const responseLogin = await responsePromiseLogin;
  const responseBodyLoginJson = await responseLogin.json();

  expect(responseLogin.status()).toBe(200);
  expect(responseBodyLoginJson).toHaveProperty('token');
  expect(typeof responseBodyLoginJson.token).toBe('string');
  expect(responseBodyLoginJson).toHaveProperty('user');
  expect(responseBodyLoginJson.user).toEqual(expect.objectContaining({
    id: expect.any(String),
    firstName: TestData.validUser.firstName,
    lastName: TestData.validUser.lastName,
    email: newUser.email,
  }));


  await expect(page.getByText('Inicio de sesión exitoso')).toBeVisible();
  await expect(dashboardPage.dashboardTitle).toBeVisible();


});


