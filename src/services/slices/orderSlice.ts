// создание заказа

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getOrderByNumberApi, orderBurgerApi } from '../../utils/burger-api';

import type { TOrder } from '@utils-types';

type TOrderState = {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
  //  поля для загрузки конкретного заказа
  currentOrder: TOrder | null;
  isOrderLoading: boolean;
  orderError: string | null;
};

const initialState: TOrderState = {
  orderRequest: false,
  orderModalData: null,
  error: null,
  currentOrder: null,
  isOrderLoading: false,
  orderError: null,
};

export const createOrder = createAsyncThunk<TOrder, string[], { rejectValue: string }>(
  'order/createOrder',
  async (ingredientIds, { rejectWithValue }) => {
    try {
      const response = await orderBurgerApi(ingredientIds);
      return response.order;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// новый thunk: получение заказа по номеру
export const fetchOrderByNumber = createAsyncThunk<
  TOrder,
  number,
  { rejectValue: string }
>('order/fetchOrderByNumber', async (number, { rejectWithValue }) => {
  try {
    const response = await getOrderByNumberApi(number);
    if (response.success && response.orders.length > 0) {
      return response.orders[0];
    }
    return rejectWithValue('Заказ не найден');
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderModal: (state) => {
      state.orderModalData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createOrder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.payload ?? 'Ошибка создания заказа';
      })
      // fetchOrderByNumber
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isOrderLoading = true;
        state.orderError = null;
        state.currentOrder = null; // сброс старого заказа
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.isOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.isOrderLoading = false;
        state.orderError = action.payload ?? 'Ошибка загрузки заказа';
      });
  },
});

export const { clearOrderModal } = orderSlice.actions;

export const selectOrderRequest = (state: { order: TOrderState }): boolean =>
  state.order.orderRequest;
export const selectOrderModalData = (state: { order: TOrderState }): TOrder | null =>
  state.order.orderModalData;
export const selectCurrentOrder = (state: { order: TOrderState }): TOrder | null =>
  state.order.currentOrder;
export const selectOrderLoading = (state: { order: TOrderState }): boolean =>
  state.order.isOrderLoading;
export const selectOrderError = (state: { order: TOrderState }): string | null =>
  state.order.orderError;

export default orderSlice.reducer;
