import { createSelector } from '@ngrx/store';
import { getState as getParentState } from '../selectors';
import { adapter } from './reducer';
import { createSelectors } from '../useful/selector';

export const getState = createSelector(
    getParentState,
    state => state.user
);

export const { getEntities, getByAddress } = createSelectors(
    adapter,
    getState
);
