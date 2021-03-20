import { getEntities as getUserEntities } from 'src/app/model/store/user/selectors';
import { createSelector } from '@ngrx/store';
import { getState as getParentState } from './selectors';

export const getState = createSelector(
    getParentState,
    state => state.payload,
);

export const getUserAddress = createSelector(
    getState,
    state => state.userAddress,
);

export const getIsUserLoggedIn = createSelector(
    getState,
    state => state.isLoggedIn,
);

export const getUser = createSelector(
    getUserEntities,
    getUserAddress,
    (entities, id) => {
        if (id) {
            return entities[id];
        }
    },
);


