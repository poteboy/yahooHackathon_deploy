import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { actions, Images } from './image.actions';
import { SafeUrl } from '@angular/platform-browser';

export interface State {
    id: string;
    homeImage: SafeUrl;
}

export const initialState = {
    id: 'hack',
    homeImage: null,
};


const imageAddHandler = (state: State, images: Images): State => {
    return {
    ...state,
    ...images
  };
};

const imageDeleteHandler = (state: State, images: Images): State => {
    return initialState;
};


export const reducer = reducerWithInitialState(initialState)
    .case(actions.imageAdd, imageAddHandler)
    .case(actions.imageDelete, imageDeleteHandler)
    .build();
