// boiler plate. always import them
import { createSelector } from 'src/app/lib/ngrx';
import { getState as getParentState } from '../selectors';
import { adapter } from './reducer';
import { createSelectors } from '../useful/selector';

export const getState = createSelector(
    getParentState,
    state => state.test
);

export const { getEntities, getById } = createSelectors(
    adapter,
    getState
);

