// нужен для счетчиков в IngredientsCategory

import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit';

import { orderBurgerApi } from '../../utils/burger-api';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { TConstructorIngredient, TIngredient, TOrder } from '@utils-types';

type TConstructorState = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
};

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
  orderRequest: false,
  orderModalData: null,
  error: null,
};

export const createOrder = createAsyncThunk<TOrder, string[], { rejectValue: string }>(
  'burgerConstructor/createOrder',
  async (ingredientIds, { rejectWithValue }) => {
    try {
      const response = await orderBurgerApi(ingredientIds);
      return response.order;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

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
    moveIngredient: (state, action: PayloadAction<{ from: number; to: number }>) => {
      const { from, to } = action.payload;
      const item = state.ingredients.splice(from, 1)[0];
      state.ingredients.splice(to, 0, item);
    },
    clearOrderModal: (state) => {
      state.orderModalData = null;
      state.error = null;
    },
    clearConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
      state.orderModalData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
        state.bun = null;
        state.ingredients = [];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.payload ?? 'Ошибка создания заказа';
      });
  },
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearOrderModal,
  clearConstructor,
} = constructorSlice.actions;

export const selectConstructorBun = (state: {
  burgerConstructor: TConstructorState;
}): TConstructorIngredient | null => state.burgerConstructor.bun;
export const selectConstructorIngredients = (state: {
  burgerConstructor: TConstructorState;
}): TConstructorIngredient[] => state.burgerConstructor.ingredients;
export const selectOrderRequest = (state: {
  burgerConstructor: TConstructorState;
}): boolean => state.burgerConstructor.orderRequest;
export const selectOrderModalData = (state: {
  burgerConstructor: TConstructorState;
}): TOrder | null => state.burgerConstructor.orderModalData;

export default constructorSlice.reducer;
