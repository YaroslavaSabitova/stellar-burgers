import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false,
    });

    await page.routeFromHAR('tests/hars/auth.har', {
      url: '**/api/auth/**',
      update: false,
    });

    await page.routeFromHAR('tests/hars/orders.har', {
      url: '**/api/orders',
      update: false,
    });

    await page.goto('/');
    // загрузка ингредиентов
    await expect(page.getByText('Краторная булка N-200i')).toBeVisible();
  });

  test('добавление ингредиента из списка в конструктор', async ({ page }) => {
    // проверяем, чтобы надписи были видны в контейнере конструктора бургера до добавления туда ингредиентов
    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();

    // добавляем булку
    await page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' })
      .getByRole('button', { name: 'Добавить' })
      .click();

    // проверяем, что заглушка "Выберите булки" пропала
    await expect(page.getByText('Выберите булки')).not.toBeVisible();

    // добавляем начинку
    await page
      .locator('li')
      .filter({ hasText: 'Биокотлета из марсианской Магнолии' })
      .getByRole('button', { name: 'Добавить' })
      .click();

    // проверяем, что заглушка "Выберите начинку" пропала
    await expect(page.getByText('Выберите начинку')).not.toBeVisible();
  });

  test('открытие и закрытие модального окна ингредиента', async ({ page }) => {
    // проверяем, что название 'Детали ингредиента' не видно на странице
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();

    // открываем модалку
    await page.getByText('Краторная булка N-200i').click();

    // модалка по data-testid="modal" и проверка данных внутри
    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText('Краторная булка N-200i')).toBeVisible();

    // закрываем по крестику
    await page.getByTestId('modal-close-button').click();
    await expect(modal).not.toBeVisible();

    // открываем
    await page.getByText('Краторная булка N-200i').click();
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Краторная булка N-200i')).toBeVisible();

    // закрываем по оверлею
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });
    await expect(modal).not.toBeVisible();
  });

  test('создание заказа, проверка номера и очистка конструктора', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh-token');
    });
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: 'mock-access-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.reload();
    await expect(page.getByText('TestUser')).toBeVisible({ timeout: 10000 });

    // собираем бургер
    await page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' })
      .getByRole('button', { name: 'Добавить' })
      .click();

    await page
      .locator('li')
      .filter({ hasText: 'Биокотлета из марсианской Магнолии' })
      .getByRole('button', { name: 'Добавить' })
      .click();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    // проверяем модалку с номером заказа
    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('12345')).toBeVisible();

    // закрываем модалку
    await page.getByTestId('modal-close-button').click();
    await expect(modal).not.toBeVisible();

    // проверяем, что конструктор очистился
    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();
  });
});
