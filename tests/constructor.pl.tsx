import { test, expect } from '@playwright/test';

test.describe('add ingredients to constructor works correctly', function () {
  test.beforeEach(async ({ page }) => {
    // моковый запрос ингредиентов
    await page.route('**/api/ingredients', async (route) => {
      const mockIngredients = {
        success: true,
        data: [
          {
            _id: '643d69a5c3f7b9001cfa093c',
            name: 'Краторная булка N-200i',
            type: 'bun',
            proteins: 80,
            fat: 24,
            carbohydrates: 53,
            calories: 420,
            price: 1255,
          },
          {
            _id: '643d69a5c3f7b9001cfa0941',
            name: 'Биокотлета из марсианской Магнолии',
            type: 'main',
            proteins: 420,
            fat: 142,
            carbohydrates: 242,
            calories: 4242,
            price: 424,
          },
        ],
      };
      await route.fulfill({ json: mockIngredients });
    });

    await page.goto('/');
    // ждём загрузку
    await expect(page.getByText('Краторная булка N-200i').first()).toBeVisible();
  });

  // ТЕСТ 1: Добавление ингредиентов
  test('should add ingredients to constructor', async ({ page }) => {
    // Чтобы добавить в конструктор, кликаем по кнопке "Добавить" в карточке булки
    // Ищем li (карточку), внутри которой есть текст булки, и кликаем по кнопке
    await page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' })
      .getByRole('button', { name: 'Добавить' })
      .click();

    // Проверяем, что заглушка "Выберите булки" пропала, а булка добавилась
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

  // ТЕСТ 2: Работа модальных окон
  test('should open and close ingredient modal', async ({ page }) => {
    // Открываем модалку кликом по ссылке (тексту) ингредиента
    await page.getByText('Краторная булка N-200i').first().click();

    // В модалке есть заголовок "Детали ингредиента"
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

  // ТЕСТ 3: Создание заказа
  test('should create order and clear constructor', async ({ page }) => {
    // 1. Мокаем пользователя
    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        json: { success: true, user: { email: 'test@test.ru', name: 'TestUser' } },
      });
    });

    // 2. Мокаем создание заказа
    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        json: { success: true, order: { number: 12345 } },
      });
    });

    // 3. Подставляем моковые токены
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

    // Перезагружаем страницу
    await page.reload();

    // Ждем, пока подтянется имя пользователя (проверка авторизации)
    await expect(page.getByText('TestUser')).toBeVisible({ timeout: 10000 });

    // Собираем бургер (кликаем по кнопкам "Добавить")
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

    // Проверяем модалку с номером заказа
    await expect(page.getByText('12345')).toBeVisible();

    // Закрываем модалку
    await page.getByTestId('modal-close-button').click();

    // Проверяем, что конструктор очистился
    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();
  });
});
