import { test, expect } from '@playwright/test';

const USER = {
  email: 'jorge.lopezr@yahoo.com',
  password: 'J3sus!!!',
};

const PRODUCT = {
  name: 'Brazilian Santos',
  price: '$22.99',
  id: '504',
};

const SHIPPING = {
  address: '123 Magic Bean Lane',
  city: 'Beanville',
  zip: '12345',
};

const PAYMENT = {
  name: 'Jose Perez',
  // Visa test card — formats as masked input, must be typed not filled
  cardNumber: '4111111111111111',
  expiry: '12/27',
  cvc: '123',
};

test.describe('Complete purchase flow', () => {
  test('logged-in user can add a product and complete checkout', async ({ page }) => {
    // --- Login ---
    await page.goto('https://valentinos-magic-beans.click/login');
    await page.locator('[data-test-id="login-email-input"]').fill(USER.email);
    await page.locator('[data-test-id="login-password-input"]').fill(USER.password);
    await page.locator('[data-test-id="login-submit-button"]').click();

    // Redirects to home and Login button is gone (user avatar replaces it)
    await expect(page).toHaveURL('https://valentinos-magic-beans.click/');
    await expect(page.getByRole('link', { name: 'Login' })).not.toBeVisible();

    // --- Add to cart ---
    await page.goto('https://valentinos-magic-beans.click/products');
    await page.locator(`[data-test-id="product-card-add-to-cart-button-${PRODUCT.id}"]`).click();

    // Cart badge increments to 1
    const cartButton = page.locator('[data-test-id="header-cart-button"]');
    await expect(cartButton).toHaveText('1');

    // --- Cart review ---
    await cartButton.click();
    await expect(page).toHaveURL('https://valentinos-magic-beans.click/cart');
    await expect(page.getByRole('heading', { name: PRODUCT.name, level: 3 })).toBeVisible();
    await expect(page.getByText('$22.99').first()).toBeVisible();
    await expect(page.getByText('$5.99')).toBeVisible(); // shipping
    await expect(page.getByText('$28.98')).toBeVisible(); // total

    // --- Checkout ---
    await page.getByRole('link', { name: 'Proceed to Checkout' }).click();
    await expect(page).toHaveURL('https://valentinos-magic-beans.click/checkout');

    // Contact info is pre-filled from the account (fields are disabled)
    await expect(page.locator('[placeholder="you@example.com"]')).toHaveValue(USER.email);

    // Fill shipping address
    await page.locator('[data-test-id="checkout-address-input"]').fill(SHIPPING.address);
    await page.locator('[data-test-id="checkout-city-input"]').fill(SHIPPING.city);
    await page.locator('[data-test-id="checkout-zipcode-input"]').fill(SHIPPING.zip);

    // Fill payment — card number uses input masking, type() required instead of fill()
    await page.locator('[data-test-id="checkout-cardname-input"]').fill(PAYMENT.name);
    await page.locator('[data-test-id="checkout-cardnumber-input"]').click();
    await page.keyboard.type(PAYMENT.cardNumber);
    await page.locator('[data-test-id="checkout-cardexpiry-input"]').fill(PAYMENT.expiry);
    await page.locator('[data-test-id="checkout-cardcvc-input"]').fill(PAYMENT.cvc);

    // Verify order summary before placing (scoped to avoid strict-mode collisions with toast)
    await expect(page.getByText(`${PRODUCT.name} x1`)).toBeVisible();
    await expect(page.getByText('$28.98')).toBeVisible();

    // --- Place order ---
    await page.locator('[data-test-id="place-order-button"]').click();

    // --- Confirmation ---
    await expect(page).toHaveURL('https://valentinos-magic-beans.click/order-confirmation');
    await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeVisible();
    await expect(page.getByText(USER.email)).toBeVisible();

    // Order ID is generated — verify it exists and is non-empty
    const orderIdText = page.getByText(/Your Order ID is:/);
    await expect(orderIdText).toBeVisible();

    // Cart badge is cleared after order (button still present but no item count)
    await expect(page.locator('[data-test-id="header-cart-button"]')).not.toHaveText('1');
  });

  test('login fails with wrong credentials', async ({ page }) => {
    await page.goto('https://valentinos-magic-beans.click/login');
    await page.locator('[data-test-id="login-email-input"]').fill(USER.email);
    await page.locator('[data-test-id="login-password-input"]').fill('wrongpassword');
    await page.locator('[data-test-id="login-submit-button"]').click();

    // Stays on login page
    await expect(page).toHaveURL('https://valentinos-magic-beans.click/login');
  });
});
