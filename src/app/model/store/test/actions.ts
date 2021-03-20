import { Update, EntityMap, EntityMapOne, Predicate, props, createAction } from 'src/app/lib/ngrx';
import { Test } from '../../entity';


export const add = createAction('[TEST] ADD', props<{ test: Test }>());

export const upsert = createAction('[TEST] UPSERT', props<{ test: Test }>());

export const update = createAction('[TEST] UPDATE', props<{ update: Update<Test> }>());

export const remove = createAction('[TEST] REMOVE', props<{ id: string }>());






