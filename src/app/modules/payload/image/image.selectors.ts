import { getEntities as getImageEntities } from 'src/app/model/store/image/selectors';
import { createSelector } from '@ngrx/store';
import { getState as getParentState } from '../selectors';


export const getState = createSelector(
    getParentState,
    state => state.image,
);

export const getHomeImage = createSelector(
    getState,
    state => state.homeImage
);

export const getImageId = createSelector(
    getState,
    state => state.id
);

export const getImage = createSelector(
    getImageEntities,
    getImageId,
    (entities, id) => {
        if (id) {
            return entities[id];
        }
    },
);
