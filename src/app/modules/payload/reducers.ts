import { InjectionToken } from '@angular/core';
import {
  Action,
  ActionReducer,
  ActionReducerMap,
  MetaReducer,
} from '@ngrx/store';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
    initialState as payloadInitalState,
    reducer as payloadReducer,
    State as payloadState,
} from './payload.reducer';
import {
    initialState as loginVisibleInitialState,
    reducer as loginVisibleReducer,
    State as loginVisibleState,
} from './login/login-visible.reducer';
import {
    initialState as pathInitalState,
    reducer as pathReducer,
    State as pathState,
} from './path/path.reducer';

export interface State {
    payload: payloadState;
    loginVisible: loginVisibleState;
    path: pathState;
}

export const reducers: ActionReducerMap<State> = {
    payload: payloadReducer,
    loginVisible: loginVisibleReducer,
    path: pathReducer,
};

export function getInitialState(): State {
    return {
        payload: payloadInitalState,
        loginVisible: loginVisibleInitialState,
        path: pathInitalState,
    };
}

export const reducersToken = new InjectionToken<ActionReducerMap<State>>(
    'reducers',
);
export const getReducers = () => reducers;
export const reducersProvider = [
  { provide: reducersToken, useFactory: getReducers },
];
