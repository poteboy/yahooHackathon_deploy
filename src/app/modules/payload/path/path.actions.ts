import actionCreatorFactory from 'typescript-fsa';
const actionCreator = actionCreatorFactory();

type PathOf = {
    path: 'home' | 'auction' | 'changeColor';
};

export interface Path {
    path: 'home' | 'auction' | 'changeColor';
}

export const actions = {
    path: actionCreator<Path>('PATH')
};
