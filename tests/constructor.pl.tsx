import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Подключаем HAR-файлы (update: false означает, что мы только ЧИТАЕМ данные)
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
    // Ждём загрузку ингредиентов
    await expect(page.getByText('Краторная булка N-200i').first()).toBeVisible();
  });

  test('добавление ингредиента из списка в конструктор', async ({ page }) => {
    // Добавляем булку
    await page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' })
      .getByRole('button', { name: 'Добавить' })
      .click();

    // Проверяем, что заглушка "Выберите булки" пропала
    await expect(page.getByText('Выберите булки')).not.toBeVisible();

    // Добавляем начинку
    await page
      .locator('li')
      .filter({ hasText: 'Биокотлета из марсианской Магнолии' })
      .getByRole('button', { name: 'Добавить' })
      .click();

    // Проверяем, что заглушка "Выберите начинку" пропала
    await expect(page.getByText('Выберите начинку')).not.toBeVisible();
  });

  test('открытие и закрытие модального окна ингредиента', async ({ page }) => {
    // Открываем модалку
    await page.getByText('Краторная булка N-200i').first().click();
    await expect(page.getByText('Детали ингредиента')).toBeVisible();

    // Закрываем по крестику
    await page.getByTestId('modal-close-button').click();
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();

    // Снова открываем
    await page.getByText('Краторная булка N-200i').first().click();
    await expect(page.getByText('Детали ингредиента')).toBeVisible();

    // Закрываем по оверлею
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();
  });

  test('создание заказа, проверка номера и очистка конструктора', async ({ page }) => {
    // Подставляем моковые токены авторизации
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

    // Перезагружаем страницу, чтобы применились токены и загрузился пользователь из HAR
    await page.reload();

    // Ждем, пока подтянется имя пользователя (из auth.har)
    await expect(page.getByText('TestUser')).toBeVisible({ timeout: 10000 });

    // Собираем бургер
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

    // Нажимаем "Оформить заказ"
    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    // Проверяем модалку с номером заказа (из orders.har)
    await expect(page.getByText('12345')).toBeVisible();

    // Закрываем модалку
    await page.getByTestId('modal-close-button').click();

    // Проверяем, что конструктор очистился
    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();
  });
});
