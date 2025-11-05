import { Locator, Page } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  readonly verificationHeader: Locator;
  readonly resendCode: Locator;
  readonly authError: Locator;
  readonly pinOne: Locator;
  readonly pinTwo: Locator;
  readonly pinThree: Locator;
  readonly pinFour: Locator;
  readonly pinFive: Locator;
  readonly pinSix: Locator;
  readonly submitButton: Locator;
  readonly verifyAccount: Locator;
  readonly phoneHeader: Locator;
  readonly welcomeHeader: Locator;
  readonly signOut: Locator;
  readonly phoneInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.verificationHeader = page.getByTestId('verification-header');
    this.resendCode = page.getByTestId('resend-button');
    this.pinOne = page.getByTestId('pin-form-1');
    this.pinTwo = page.getByTestId('pin-form-2');
    this.pinThree = page.getByTestId('pin-form-3');
    this.pinFour = page.getByTestId('pin-form-4');
    this.pinFive = page.getByTestId('pin-form-5');
    this.pinSix = page.getByTestId('pin-form-6');
    this.verifyAccount = page.getByTestId('verify-account-button');
    this.welcomeHeader = page.getByTestId('welcome-header');
    this.signOut = page.getByTestId('sign-out-button');
    this.phoneHeader = page.getByTestId('phone-header');
    this.submitButton = page.getByTestId('submit-button');
    this.phoneInput = page.getByTestId('phone-form-input');
    this.authError = page.getByTestId('auth-error');
  }

  async login(phone, code) {
    await this.phoneInput.fill(phone);
    await this.submitButton.click();
    await this.enterVerificationNumber(code);
    await this.verifyAccount.click;
  }
  async resendLogin(phone) {
    await this.phoneInput.fill(phone);
    await this.submitButton.click();
    await this.resendCode.click;
  }

  async enterVerificationNumber(num: string) {
    await this.pinOne.isVisible();
    await this.pinOne.type(num);
  }
}