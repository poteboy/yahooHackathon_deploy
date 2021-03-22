import { createSelector } from '@ngrx/store';
import { getState as getParentState } from '../selectors';
import { adapter } from './reducer';
import { createSelectors } from '../useful/selector';
import { state } from '@angular/animations';
import { create } from 'node:domain';

export const getState = createSelector(
    getParentState,
    state => state.image
);

export const { getEntities, getByAddress } = createSelectors(
    adapter,
    getState
);
