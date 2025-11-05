import { test } from './constants/userConstants';
import { expect } from '@playwright/test';
import { AuthPage } from './pages/authPage';

let authPage;

test.beforeAll(async ({ page }) => {
  await page.goto('http://localhost:3000');
});

test('Successful login using SMS verification', async ({
  page,
  phone,
  password,
}) => {
  authPage = new AuthPage(page);
  authPage.phoneInput.click();
  authPage.login(phone, password);
  await page.waitForTimeout(1000);
  authPage.verifyAccount.click();
  await expect(authPage.welcomeHeader).toBeVisible({ timeout: 10000 });
});

test('User able to successfully sign out of Admin tool', async ({
  page,
  phone,
  password,
}) => {
  authPage = new AuthPage(page);
  authPage.phoneInput.click();
  authPage.login(phone, password);
  await page.waitForTimeout(1000);
  authPage.verifyAccount.click();
  await expect(authPage.welcomeHeader).toBeVisible({ timeout: 10000 });
  await authPage.signOut.click();
});

test('User gets correct error message for invalid code', async ({
  page,
  phone,
  password,
  invalidPassword,
}) => {
  authPage = new AuthPage(page);
  authPage.phoneInput.click();
  authPage.login(phone, invalidPassword);
  await page.waitForTimeout(1000);
  await authPage.verifyAccount.click();
  await expect(authPage.authError).toContainText(
    'Please enter a valid verification code',
  );
});

test('User able to successfully re-send code', async ({ page, phone }) => {
  authPage = new AuthPage(page);
  authPage.phoneInput.click();
  authPage.resendLogin(phone);
  await page.waitForTimeout(1000);
  await authPage.resendCode.click();
});
