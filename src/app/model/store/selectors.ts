import { createFeatureSelector, createSelector} from 'src/app/lib/ngrx';
import { getInitialState, State } from './reducers';

export const getState = createSelector(
    createFeatureSelector<State>('entityStore'),
    state => state || getInitialState(),
);
