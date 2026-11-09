import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

//  селекторы заказов и ингредиентов
import { selectFeedOrders, selectProfileOrders } from '../../services/slices/feedSlice';
import { selectIngredients } from '../../services/slices/ingredientsSlice';
//  новые экшены и селекторы заказа
import {
  fetchOrderByNumber,
  selectCurrentOrder,
  selectOrderLoading,
  selectOrderError,
} from '../../services/slices/orderSlice';
import { useDispatch, useSelector } from '../../services/store';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();
  const orderNumber = Number(number);
  const dispatch = useDispatch();

  //  данные из существующих селекторов
  const feedOrders = useSelector(selectFeedOrders);
  const profileOrders = useSelector(selectProfileOrders);
  const ingredients = useSelector(selectIngredients);

  // ищем заказ в ленте или истории
  const orderFromStore =
    feedOrders.find((o) => o.number === orderNumber) ??
    profileOrders.find((o) => o.number === orderNumber);

  //  данные загрузки из orderSlice
  const currentOrder = useSelector(selectCurrentOrder);
  const isLoading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  // если заказа нет в сторе — запрашиваем через thunk
  useEffect(() => {
    if (!orderFromStore && orderNumber) {
      void dispatch(fetchOrderByNumber(orderNumber));
    }
  }, [orderFromStore, orderNumber, dispatch]);

  // выбираем, что отображать: заказ из ленты/истории или загруженный
  const orderData = orderFromStore ?? currentOrder;

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);
    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = { ...ingredient, count: 1 };
          }
        } else {
          acc[item].count++;
        }
        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return { ...orderData, ingredientsInfo, date, total };
  }, [orderData, ingredients]);

  // обработка состояний загрузки и ошибок
  if (isLoading && !orderData) {
    return <Preloader />;
  }

  if (error && !orderData) {
    return (
      <p className="text text_type_main-medium mt-10">
        Заказ не найден или произошла ошибка при загрузке
      </p>
    );
  }

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
