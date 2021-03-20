import { createFeatureSelector, createSelector } from '@ngrx/store';
import { getInitialState, State } from './reducers';

export const getState = createSelector(
    createFeatureSelector<State>('modelPayload'),
    state => state || getInitialState(),
);
