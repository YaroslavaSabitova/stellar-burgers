// нужен для ленты заказов (/feed) и истории (/profile/orders)

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getFeedsApi, getOrdersApi } from '../../utils/burger-api';
import { logoutUser } from './userSlice';

import type { TOrder } from '@utils-types';

type TFeedState = {
  orders: TOrder[]; // Общая лента
  profileOrders: TOrder[]; // История заказов
  total: number;
  totalToday: number;
  isLoading: boolean;
  error: string | null;
};

const initialState: TFeedState = {
  orders: [],
  profileOrders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
};

export const fetchFeeds = createAsyncThunk<
  { orders: TOrder[]; total: number; totalToday: number },
  void,
  { rejectValue: string }
>('feed/fetchFeeds', async (_, { rejectWithValue }) => {
  try {
    return await getFeedsApi();
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const fetchProfileOrders = createAsyncThunk<
  TOrder[],
  void,
  { rejectValue: string }
>('feed/fetchProfileOrders', async (_, { rejectWithValue }) => {
  try {
    return await getOrdersApi();
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchFeeds (общая лента)
      .addCase(fetchFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Ошибка загрузки ленты';
      })
      // fetchProfileOrders (история)
      .addCase(fetchProfileOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileOrders = action.payload;
      })
      .addCase(fetchProfileOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Ошибка загрузки истории';
      })
      // ОЧИСТКА ПРИ ВЫХОДЕ ИЗ АККАУНТА
      .addCase(logoutUser.fulfilled, (state) => {
        state.profileOrders = []; // очищаем историю пользователя
      });
  },
});

export const selectFeed = (state: { feed: TFeedState }): TFeedState => state.feed;
export const selectFeedOrders = (state: { feed: TFeedState }): TOrder[] =>
  state.feed.orders;
export const selectProfileOrders = (state: { feed: TFeedState }): TOrder[] =>
  state.feed.profileOrders;
export const selectFeedLoading = (state: { feed: TFeedState }): boolean =>
  state.feed.isLoading;

export default feedSlice.reducer;
