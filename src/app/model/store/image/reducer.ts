import { Image } from '../../entity';
import * as actions from './actions';
import {
    Action,
    createReducer,
    EntityState,
    EntityAdapter,
    createEntityAdapter,
    on
} from 'src/app/lib/ngrx';

export interface State extends EntityState<Image> {
    selectedAddress: string | null;
}

export const adapter: EntityAdapter<Image> = createEntityAdapter<Image>();

export const initialState: State = adapter.getInitialState({
    selectedAddress: null,
});

export function selectId(image: Image): string {
    return image.id;
}

const userReducer = createReducer(
    initialState,
    on(actions.add, (state, { image }) => {
        return adapter.addOne(image, state);
    }),
    on(actions.upsert, (state, { image }) => {
        return adapter.upsertOne(image, state);
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
