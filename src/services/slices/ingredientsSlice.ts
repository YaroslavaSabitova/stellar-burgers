// загрузка ингредиентов с сервера

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getIngredientsApi } from '../../utils/burger-api';

import type { TIngredient } from '@utils-types';

type TIngredientsState = {
  items: TIngredient[];
  isLoading: boolean;
  error: string | null;
};

const initialState: TIngredientsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchIngredients = createAsyncThunk<
  TIngredient[],
  void,
  { rejectValue: string }
>('ingredients/fetchIngredients', async (_, { rejectWithValue }) => {
  try {
    return await getIngredientsApi();
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Ошибка загрузки ингредиентов';
      });
  },
});

export const selectIngredients = (state: {
  ingredients: TIngredientsState;
}): TIngredient[] => state.ingredients.items;
export const selectIngredientsLoading = (state: {
  ingredients: TIngredientsState;
}): boolean => state.ingredients.isLoading;
export const selectIngredientsError = (state: {
  ingredients: TIngredientsState;
}): string | null => state.ingredients.error;

export default ingredientsSlice.reducer;
