import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useSelector } from '../../services/store';
import { getOrderByNumberApi } from '../../utils/burger-api';

import type { TIngredient, TOrder } from '@utils-types';

type TStateWithOrders = {
  feed?: { orders?: TOrder[] };
  profileOrders?: { orders?: TOrder[] };
  ingredients?: { items?: TIngredient[] };
};

export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();
  const orderNumber = Number(number);

  const [fetchedOrder, setFetchedOrder] = useState<TOrder | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Ищем заказ в сторе (в ленте или в истории)
  const orderFromStore = useSelector((state) => {
    const s = state as unknown as TStateWithOrders;
    return (
      s.feed?.orders?.find((o) => o.number === orderNumber) ??
      s.profileOrders?.orders?.find((o) => o.number === orderNumber)
    );
  });

  const ingredients = useSelector((state) => {
    const s = state as unknown as TStateWithOrders;
    return s.ingredients?.items ?? [];
  });

  // Если заказа нет в сторе — запрашиваем его с сервера
  useEffect(() => {
    if (!orderFromStore && !fetchedOrder && !isFetching && orderNumber) {
      setIsFetching(true);
      getOrderByNumberApi(orderNumber)
        .then((res) => {
          if (res.success && res.orders.length > 0) {
            setFetchedOrder(res.orders[0]);
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [orderFromStore, fetchedOrder, isFetching, orderNumber]);

  const orderData = orderFromStore ?? fetchedOrder;

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

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
