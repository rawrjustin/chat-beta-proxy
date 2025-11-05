import { test as base } from '@playwright/test';

export type TestOptions = {
  phone: string;
  password: string;
  invalidPassword: string;
};

export const test = base.extend<TestOptions>({
  //Define an option and provide a default value.
  //We can later override it in the config.
  phone: ['8336491982', { option: true }],
  password: ['123456', { option: true }],
  invalidPassword: ['111111', { option: true }],
});
