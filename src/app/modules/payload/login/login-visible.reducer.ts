import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { actions, LoginVisible } from './login-visible.actions';

export interface State {
    LoginModalIsVisible: boolean;
}

export const initialState: State =  {
    LoginModalIsVisible: false,
};

const loginVisibleHandler = (state: State, loginVisible: LoginVisible): State => {
    return {
    ...state,
    ...loginVisible
  };
};

export const reducer = reducerWithInitialState(initialState)
    .case(actions.loginVisible, loginVisibleHandler)
    .build();

