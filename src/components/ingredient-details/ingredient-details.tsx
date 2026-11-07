import { Preloader, IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import { useSelector } from '../../services/store';

import type { TIngredient } from '@utils-types';

type TStateWithIngredients = {
  ingredients?: { items?: TIngredient[] };
};

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();

  const ingredientData = useSelector((state) => {
    const s = state as unknown as TStateWithIngredients;
    return s.ingredients?.items?.find((item) => item._id === id);
  });

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
