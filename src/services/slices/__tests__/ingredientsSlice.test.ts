import ingredientsReducer, { fetchIngredients } from '../ingredientsSlice';

describe('Тестирование ingredientsSlice', () => {
  const initialState = {
    items: [],
    isLoading: false,
    error: null,
  };

  it('должен возвращать начальное состояние при вызове с неизвестным экшеном', () => {
    // Передаем undefined в качестве начального состояния, чтобы проверить initialState по умолчанию
    const result = ingredientsReducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(result).toEqual(initialState);
  });

  it('должен обрабатывать fetchIngredients.pending', () => {
    const action = { type: fetchIngredients.pending.type };
    const state = ingredientsReducer(initialState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('должен обрабатывать fetchIngredients.fulfilled', () => {
    const mockIngredients = [
      { _id: '1', name: 'Булка', type: 'bun', price: 100 },
      { _id: '2', name: 'Котлета', type: 'main', price: 200 },
    ];
    const action = { type: fetchIngredients.fulfilled.type, payload: mockIngredients };
    const state = ingredientsReducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.items).toEqual(mockIngredients);
  });

  it('должен обрабатывать fetchIngredients.rejected', () => {
    const action = { type: fetchIngredients.rejected.type, payload: 'Ошибка сети' };
    const state = ingredientsReducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Ошибка сети');
  });
});
