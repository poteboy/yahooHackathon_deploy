import actionCreatorFactory from 'typescript-fsa';
const actionCreator = actionCreatorFactory();

export interface Payload {
    userAddress: string | null;
    isLoggedIn: boolean;
    key: string | null;
}

export const actions = {
    payload: actionCreator<Payload>('PAYLOAD'),
    reset: actionCreator<void>('RESET_PAYLOAD'),
};
