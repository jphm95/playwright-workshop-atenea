import { test, expect, request } from '@playwright/test';
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

test('TC-8: Verify successful Sign Up with valid data verifying API response', async ({ page }) => {
  const email = (TestData.validUser.email.split('@')[0]) + Date.now().toString() + '@' + TestData.validUser.email.split('@')[1];
  TestData.validUser.email = email;
  await signUpPage.fillRegisterForm(TestData.validUser);

  //Validate POST http://localhost:6007/api/auth/signup response has  200 Status Code
  const responsePromise = page.waitForResponse('http://localhost:6007/api/auth/signup');
  await signUpPage.clickRegisterButton();
  const response = await responsePromise;
  const responseBody = await response.json();

  expect(response.status()).toBe(201);
  expect(responseBody).toHaveProperty('token');
  expect(typeof responseBody.token).toBe('string');
  expect(responseBody).toHaveProperty('user');
  expect(responseBody.user).toEqual(expect.objectContaining({
    id: expect.any(String),
    firstName: TestData.validUser.firstName,
    lastName: TestData.validUser.lastName,
    email: TestData.validUser.email,
  }));

  await expect(page.getByText('Registro exitoso')).toBeVisible();

});

test('TC-9: Verify SignUp from the API perspective', async ({ page, request }) => {
  const email = (TestData.validUser.email.split('@')[0]) + Date.now().toString() + '@' + TestData.validUser.email.split('@')[1];
  const response = await request.post('http://localhost:6007/api/auth/signup', {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    data: {
      firstName: TestData.validUser.firstName,
      lastName: TestData.validUser.lastName,
      email: email,
      password: TestData.validUser.password
    }
  });
  const responseBody = await response.json();
  await expect(response.status()).toBe(201);
  expect(responseBody).toHaveProperty('user');
  expect(responseBody.user).toEqual(expect.objectContaining({
    id: expect.any(String),
    firstName: TestData.validUser.firstName,
    lastName: TestData.validUser.lastName,
    email: email,
  }));

});

test('TC-10: Verify Front End Behavior after a 500 response in the Sign Up', async ( {page}) => {
  const email = (TestData.validUser.email.split('@')[0]) + Date.now().toString() + '@' + TestData.validUser.email.split('@')[1];
  TestData.validUser.email = email;

  await page.route('**/api/auth/signup', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify( {message: 'Internal Server Error'}),
    });
  });

  await signUpPage.fillRegisterFormAndClickRegisterButton(TestData.validUser)

  await expect(page.getByText('Internal Server Error')).toBeVisible();

});
