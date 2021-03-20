import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { actions, Path} from './path.actions';


export interface State {
    path: string;
}

export const initialState: State = {
    path: 'home'
};

const pathHandler = (state: State, path: Path): State => {
    return {
        ...state,
        ...path
    };
};

export const reducer = reducerWithInitialState(initialState)
        .case(actions.path, pathHandler)
        .build();


