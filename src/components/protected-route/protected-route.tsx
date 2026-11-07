import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { useSelector } from '../../services/store';

import type React from 'react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  onlyUnAuth?: boolean;
};

type TLocationState = {
  from?: { pathname?: string };
};

export const ProtectedRoute = ({
  children,
  onlyUnAuth = false,
}: ProtectedRouteProps): React.ReactNode => {
  const { isAuthChecked, user } = useSelector((state) => state.user);

  const location = useLocation();

  // приводим state к нашему типу (или null, если state не передали)
  const state = location.state as TLocationState | null;

  //  путь, откуда пришёл пользователь. Если его нет — главная страница
  const from = state?.from?.pathname ?? '/';

  // прелоадер, пока не завершилась проверка токена
  if (!isAuthChecked) {
    return <Preloader />;
  }

  const isAuthenticated = Boolean(user);

  // роут только для гостей, а пользователь уже вошёл — на главную (или откуда пришёл)
  if (onlyUnAuth && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // роут защищённый, а пользователь не вошёл — на логин
  if (!onlyUnAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // все проверки пройдены — рендер защищённого контента
  return <>{children}</>;
};
