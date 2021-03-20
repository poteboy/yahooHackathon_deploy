import { Update, EntityMap, EntityMapOne, Predicate, props, createAction } from 'src/app/lib/ngrx';
import { User } from '../../entity';

export const add = createAction('[USER] ADD', props<{ user: User }>());

export const upsert = createAction('[USER] UPSERT', props<{ user: User }>());

export const update = createAction('[USER] UPDATE', props<{ update: Update<User> }>());

export const remove = createAction('[USER] REMOVE', props<{ id: string }>());

