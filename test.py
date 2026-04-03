import { test } from 'donobu';

test('Running the test for solving CAPTCHA...', async ({ page }) => {
  await page.goto('https://mochiyaki.github.io/app1/');

  await page.ai('Start the CAPTCHA Challenge, solve the three Captcha games as quickly as possible');
});
