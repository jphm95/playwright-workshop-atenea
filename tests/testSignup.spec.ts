import { test, expect } from '@playwright/test';
import { SignUpPage } from '../pages/signupPage';
import TestData from '../data/testData.json';

let signUpPage: SignUpPage;


  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    await signUpPage.navigateToSignUpPage();
  })

test('TC-1: Validation of visual elements from the signup page ', async ({ page }) => {
  await expect(signUpPage.firstNameInput).toBeVisible();
  await expect(signUpPage.lastNameInput).toBeVisible();
  await expect(signUpPage.emailInput).toBeVisible();
  await expect(signUpPage.passwordInput).toBeVisible();
  await expect(signUpPage.registerButton).toBeVisible();
});

test('TC-2: Validate Sign Up button is disabled by default', async ({ page }) => {
  await expect(signUpPage.registerButton).toBeDisabled();
});

test('TC-3: Validate Sign Up button is enabled after filling the mandatory fields', async ({ page }) => {
  await signUpPage.fillRegisterForm(TestData.validUser);
  await expect(signUpPage.registerButton).toBeEnabled();
});

test('TC-4: Verify redirection to Login Page after clicking "Login"', async ({ page }) => {
  await signUpPage.loginButton.click();
  await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC-5: Verify successful Sign Up with valid data', async ({ page }) => {
  const email = (TestData.validUser.email.split('@')[0]) + Date.now().toString() + '@' + TestData.validUser.email.split('@')[1];
  TestData.validUser.email = email;
  await signUpPage.fillRegisterFormAndClickRegisterButton(TestData.validUser)
  await expect(page.getByText('Registro exitoso')).toBeVisible();
});

test('TC-6: Validate a user is not able to Sign Up with using an existent email', async ({ page }) => {
  const email = (TestData.validUser.email.split('@')[0]) + Date.now().toString() + '@' + TestData.validUser.email.split('@')[1];
  TestData.validUser.email = email;
  await signUpPage.fillRegisterFormAndClickRegisterButton(TestData.validUser);
  await expect(page.getByText('Registro exitoso')).toBeVisible();

  await signUpPage.navigateToSignUpPage();
  await signUpPage.fillRegisterFormAndClickRegisterButton(TestData.validUser);
  await expect(page.getByText('Email already in use')).toBeVisible();
  await expect(page.getByText('Registro exitoso')).not.toBeVisible();
});

