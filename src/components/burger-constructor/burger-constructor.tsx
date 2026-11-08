import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createOrder,
  clearOrderModal,
  selectConstructorBun,
  selectConstructorIngredients,
  selectOrderRequest,
  selectOrderModalData,
} from '../../services/slices/constructorSlice';
import { selectUser } from '../../services/slices/userSlice';
import { useDispatch, useSelector } from '../../services/store';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const bun = useSelector(selectConstructorBun);
  const ingredients = useSelector(selectConstructorIngredients);
  const orderRequest = useSelector(selectOrderRequest);
  const orderModalData = useSelector(selectOrderModalData);

  const constructorItems = { bun, ingredients };

  // оформление заказа
  const onOrderClick = (): void => {
    if (!bun || orderRequest) return;

    if (!user) {
      void navigate('/login'); // если не авторизован, то логин
      return;
    }

    const ingredientIds = [bun._id, ...ingredients.map((item) => item._id), bun._id];
    void dispatch(createOrder(ingredientIds));
  };

  const closeOrderModal = (): void => {
    // закрыть модальное окно и сбросить заказ
    dispatch(clearOrderModal());
  };

  const price = useMemo(
    () =>
      (bun ? bun.price * 2 : 0) + ingredients.reduce((s: number, v) => s + v.price, 0),
    [bun, ingredients]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
