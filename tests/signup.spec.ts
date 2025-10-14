import { test, expect } from '@playwright/test';

test('TC-1: Validation of visual elements from the signup page ', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.locator('input[name="firstName"]')).toBeVisible();
  await expect(page.locator('input[name="lastName"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.getByTestId('boton-registrarse')).toBeVisible();
});

test('TC-2: Validate Sign Up button is disabled by default', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByTestId('boton-registrarse')).toBeDisabled();
});

test('TC-3: Validate Sign Up button is enabled after filling the mandatory fields', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Juan');
  await page.locator('input[name="lastName"]').fill('Pablo');
  await page.locator('input[name="email"]').fill('jp@mail.com');
  await page.locator('input[name="password"]').fill('Password123');
  await expect(page.getByTestId('boton-registrarse')).toBeEnabled();
});

test('TC-4: Verify redirection to Login Page after clicking "Login"', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByTestId('boton-login-header-signup').click();
  await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC-5: Verify successful Sign Up with valid data', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Juan');
  await page.locator('input[name="lastName"]').fill('Pablo');
  await page.locator('input[name="email"]').fill('jp' + Date.now().toString() + '@mail.com');
  await page.locator('input[name="password"]').fill('Password123');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Registro exitoso')).toBeVisible();
});

test('TC-6: Validate a user is not able to Sign Up with using an existent email', async ({ page }) => {
  const email = 'jp' + Date.now().toString() + '@mail.com';
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Juan');
  await page.locator('input[name="lastName"]').fill('Pablo');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('Password123');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Registro exitoso')).toBeVisible();

  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Juan');
  await page.locator('input[name="lastName"]').fill('Pablo');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('Password123');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Email already in use')).toBeVisible();
  await expect(page.getByText('Registro exitoso')).not.toBeVisible();
})


