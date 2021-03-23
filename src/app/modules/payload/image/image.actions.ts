import actionCreatorFactory from 'typescript-fsa';
import { SafeUrl } from '@angular/platform-browser';
import { act } from '@ngrx/effects';

const actionCreator = actionCreatorFactory();

export interface Images {
    id: string;
    homeImage?: number[][];
}

export const actions = {
    imageAdd: actionCreator<Images>('IMAGE/ADD'),
    imageDelete: actionCreator<Images>('IMAGE/DELETE'),
    imageUpdate: actionCreator<Images>('IMAGE/UPDATE')
};
