import { Test } from '../../entity';
import * as actions from './actions';
import {
    Action,
    createReducer,
    EntityState,
    EntityAdapter,
    createEntityAdapter,
    on
} from 'src/app/lib/ngrx';



export interface State extends EntityState<Test> {
    selectedId: string |  null;
}

export const adapter: EntityAdapter<Test> = createEntityAdapter<Test>();

export const initialState: State = adapter.getInitialState({
    selectedId: null,
});

export function selectId(test: Test): string {
    return test.id;
}

const testReducer = createReducer(
    initialState,
    on(actions.add, (state, { test }) => {
        return adapter.addOne(test, state);
    }),
    on(actions.upsert, (state, { test }) => {
        return adapter.upsertOne(test, state);
    }),
    on(actions.update, (state, { update }) => {
        return adapter.updateOne(update, state);
    }),
    on(actions.remove, (state, { id }) => {
        return adapter.removeOne(id, state);
    })
);

export function reducer(state: State | undefined, action: Action): State{
    return testReducer(state, action);
}







