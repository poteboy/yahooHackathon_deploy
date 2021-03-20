import { getEntities as getUserEntities } from 'src/app/model/store/user/selectors';
import { createSelector } from '@ngrx/store';
import { getState as getParentState } from '../selectors';

export const getState = createSelector(
    getParentState,
    state => state.path,
);
