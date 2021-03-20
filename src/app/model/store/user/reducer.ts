import { User } from '../../entity';
import * as actions from './actions';
import {
    Action,
    createReducer,
    EntityState,
    EntityAdapter,
    createEntityAdapter,
    on
} from 'src/app/lib/ngrx';

export interface State extends EntityState<User> {
    selectedAddress: string | null;
}

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const initialState: State = adapter.getInitialState({
    selectedAddress: null,
});

export function selectId(user: User): string {
    return user.id;
}

const userReducer = createReducer(
    initialState,
    on(actions.add, (state, { user }) => {
        return adapter.addOne(user, state);
    }),
    on(actions.upsert, (state, { user }) => {
        return adapter.upsertOne(user, state);
    }),
    on(actions.update, (state, { update }) => {
        return adapter.updateOne(update, state);
    }),
    on(actions.remove, (state, { id }) => {
        return adapter.removeOne(id, state);
    })
);

export function reducer(state: State | undefined, action: Action): State{
    return userReducer(state, action);
}


