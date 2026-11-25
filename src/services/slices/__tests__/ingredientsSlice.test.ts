import ingredientsReducer, { fetchIngredients } from '../ingredientsSlice';

describe('Тестирование ingredientsSlice', () => {
  const initialState = {
    items: [],
    isLoading: false,
    error: null,
  };

  it('должен возвращать начальное состояние при вызове с неизвестным экшеном', () => {
    const result = ingredientsReducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(result).toEqual(initialState);
  });

  it('должен обрабатывать fetchIngredients.pending', () => {
    const action = { type: fetchIngredients.pending.type };
    // передаем состояние с ошибкой, чтобы показать, что pending её очищает
    const state = ingredientsReducer(
      { ...initialState, error: 'Старая ошибка' },
      action
    );

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull(); // проверяем, что ошибка сбросилась
  });

  it('должен обрабатывать fetchIngredients.fulfilled', () => {
    const mockIngredients = [
      { _id: '1', name: 'Булка', type: 'bun', price: 100 },
      { _id: '2', name: 'Котлета', type: 'main', price: 200 },
    ];
    const action = { type: fetchIngredients.fulfilled.type, payload: mockIngredients };

    // передаем состояние isLoading: true, чтобы показать, что fulfilled его выключает
    const state = ingredientsReducer({ ...initialState, isLoading: true }, action);

    expect(state.isLoading).toBe(false); // проверяем, что загрузка прекратилась
    expect(state.items).toEqual(mockIngredients);
  });

  it('должен обрабатывать fetchIngredients.rejected', () => {
    const action = { type: fetchIngredients.rejected.type, payload: 'Ошибка сети' };

    // передаем состояние isLoading: true, чтобы показать, что rejected его выключает
    const state = ingredientsReducer({ ...initialState, isLoading: true }, action);

    expect(state.isLoading).toBe(false); // проверяем, что загрузка прекратилась
    expect(state.error).toBe('Ошибка сети');
  });
});
