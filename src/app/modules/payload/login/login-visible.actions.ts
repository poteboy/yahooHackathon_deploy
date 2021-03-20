import actionCreatorFactory from 'typescript-fsa';
const actionCreator = actionCreatorFactory();

export interface LoginVisible {
    LoginModalIsVisible: boolean;
}

export const actions = {
    loginVisible: actionCreator<LoginVisible>('LOGIN/VISIBLE')
};
