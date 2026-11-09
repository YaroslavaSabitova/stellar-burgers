import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import {
  ConstructorPage,
  Feed,
  Login,
  ForgotPassword,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { Preloader } from '@ui';
import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  fetchIngredients,
  selectIngredientsLoading,
  selectIngredientsError,
} from '../../services/slices/ingredientsSlice';
//  checkUserAuth вместо getUser
import { checkUserAuth } from '../../services/slices/userSlice';
import { useDispatch, useSelector } from '../../services/store';
import { ProtectedRoute } from '../protected-route/protected-route';

import type { AppContentProps } from './type';
import type { Location } from 'react-router-dom';

import '../../index.css';

import styles from './app.module.css';

type TLocationState = {
  background?: Location;
};

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const isLoading = useSelector(selectIngredientsLoading);
  const error = useSelector(selectIngredientsError);

  useEffect(() => {
    void dispatch(fetchIngredients());

    void dispatch(checkUserAuth());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent isLoading={isLoading} error={error} />
    </div>
  );
};

export default App;

/* Маршруты показываются только когда ингредиенты загружены: без них не
   отрисовать ни конструктор, ни состав заказа. */
const AppContent = ({ isLoading, error }: AppContentProps): React.JSX.Element => {
  if (isLoading) return <Preloader />;
  if (error)
    return (
      <p className={`${styles.message} text text_type_main-medium`}>
        Не удалось загрузить ингредиенты: {error}
      </p>
    );

  return <RouteComponent />;
};

type TModalWrapperProps = {
  onClose: () => void;
};

const IngredientModal = ({ onClose }: TModalWrapperProps): React.JSX.Element => {
  return (
    <Modal title="Детали ингредиента" onClose={onClose}>
      <IngredientDetails />
    </Modal>
  );
};

const OrderModal = ({ onClose }: TModalWrapperProps): React.JSX.Element => {
  const { number } = useParams();
  return (
    <Modal title={`#${number}`} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};

const OrderPageWrapper = (): React.JSX.Element => {
  const { number } = useParams();
  return (
    <>
      <p className={`text text_type_digits-default mb-10 ${styles.detailHeader}`}>
        #{number}
      </p>
      <OrderInfo />
    </>
  );
};

const RouteComponent = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as TLocationState | null;
  const background = state?.background;

  const handleCloseModal = (): void => {
    void navigate(-1);
  };

  return (
    <>
      <Routes location={background ?? location}>
        {/* Публичные маршруты */}
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />

        {/* входы по ссылке (без модалки) */}
        <Route
          path="/ingredients/:id"
          element={
            <div className={styles.detailPageWrap}>
              <h1 className={`text text_type_main-large mb-5 ${styles.detailHeader}`}>
                Детали ингредиента
              </h1>
              <IngredientDetails />
            </div>
          }
        />
        <Route
          path="/feed/:number"
          element={
            <div className={styles.detailPageWrap}>
              <OrderPageWrapper />
            </div>
          }
        />

        {/* Маршруты только для неавторизованных пользователей   */}
        <Route
          path="/login"
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />

        {/* Маршруты только для авторизованных пользователей */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />

        {/* вход на заказ из истории (защищён) */}
        <Route
          path="/profile/orders/:number"
          element={
            <ProtectedRoute>
              <div className={styles.detailPageWrap}>
                <OrderPageWrapper />
              </div>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {/* модальный блок */}
      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={<IngredientModal onClose={handleCloseModal} />}
          />
          <Route
            path="/feed/:number"
            element={<OrderModal onClose={handleCloseModal} />}
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <OrderModal onClose={handleCloseModal} />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};
