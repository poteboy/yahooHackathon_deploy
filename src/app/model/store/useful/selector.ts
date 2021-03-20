const memoize = require('lodash.memoize');
import { EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export function createSelectors<T, V>(
    adapter: EntityAdapter<T>,
    selectState: (state: V) => EntityState<T>,
  ): any {
    const selectors = adapter.getSelectors(selectState);
    const getEntities = selectors.selectEntities as (state: V) => Dictionary<T>;

    const getById = memoize((id: string) =>
      createSelector(
        getEntities,
        entities => entities[id],
      ),
    );

    return {
      getEntities,
      getById,
    };
  }
