import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
} from '../constructorSlice';
import { createOrder } from '../orderSlice';

import type { TIngredient } from '@utils-types';

describe('Тестирование constructorSlice', () => {
  const initialState = {
    bun: null,
    ingredients: [],
  };

  const mockBun: TIngredient = {
    _id: '1',
    name: 'Булка',
    type: 'bun',
    price: 100,
    image: '',
    image_large: '',
    image_mobile: '',
    proteins: 0,
    fat: 0,
    carbohydrates: 0,
    calories: 0,
  };
  const mockMain: TIngredient = {
    _id: '2',
    name: 'Котлета',
    type: 'main',
    price: 200,
    image: '',
    image_large: '',
    image_mobile: '',
    proteins: 0,
    fat: 0,
    carbohydrates: 0,
    calories: 0,
  };

  it('должен возвращать начальное состояние при вызове с неизвестным экшеном', () => {
    const result = constructorReducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(result).toEqual(initialState);
  });

  it('должен добавлять булку через addIngredient', () => {
    const state = constructorReducer(initialState, addIngredient(mockBun));
    expect(state.bun?.name).toBe('Булка');
    expect(state.ingredients).toHaveLength(0);
  });

  it('должен добавлять начинку через addIngredient', () => {
    const state = constructorReducer(initialState, addIngredient(mockMain));
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0].name).toBe('Котлета');
  });

  it('должен удалять ингредиент через removeIngredient', () => {
    // Сначала добавим
    let state = constructorReducer(initialState, addIngredient(mockMain));
    const idToRemove = state.ingredients[0].id; // id генерируется nanoid

    // Потом удалим
    state = constructorReducer(state, removeIngredient(idToRemove));
    expect(state.ingredients).toHaveLength(0);
  });

  it('должен перемещать ингредиенты через moveIngredient', () => {
    let state = constructorReducer(initialState, addIngredient(mockMain));
    state = constructorReducer(
      state,
      addIngredient({ ...mockMain, _id: '3', name: 'Второй ингредиент' })
    );

    const firstId = state.ingredients[0].id;
    const secondId = state.ingredients[1].id;

    // Перемещаем с 0 на 1
    state = constructorReducer(state, moveIngredient({ from: 0, to: 1 }));

    expect(state.ingredients[0].id).toBe(secondId);
    expect(state.ingredients[1].id).toBe(firstId);
  });

  it('должен очищать конструктор при успешном создании заказа (createOrder.fulfilled)', () => {
    // Сначала заполним конструктор
    let state = constructorReducer(initialState, addIngredient(mockBun));
    state = constructorReducer(state, addIngredient(mockMain));

    // Имитируем успешное создание заказа
    const action = { type: createOrder.fulfilled.type, payload: { number: 123 } };
    state = constructorReducer(state, action);

    // Проверяем, что всё очистилось
    expect(state.bun).toBeNull();
    expect(state.ingredients).toHaveLength(0);
  });
});
