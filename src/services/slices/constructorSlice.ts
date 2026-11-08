// нужен для счетчиков в IngredientsCategory

import { createSlice, nanoid } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { TConstructorIngredient, TIngredient } from '@utils-types';

type TConstructorState = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
};

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: nanoid() },
      }),
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter((item) => item.id !== action.payload);
    },
    clearConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
    },
  },
});

export const { addIngredient, removeIngredient, clearConstructor } =
  constructorSlice.actions;

export const selectConstructorBun = (state: {
  burgerConstructor: TConstructorState;
}): TConstructorIngredient | null => state.burgerConstructor.bun;
export const selectConstructorIngredients = (state: {
  burgerConstructor: TConstructorState;
}): TConstructorIngredient[] => state.burgerConstructor.ingredients;

export default constructorSlice.reducer;
