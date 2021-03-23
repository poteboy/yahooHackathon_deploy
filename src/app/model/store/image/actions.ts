import { Update, EntityMap, EntityMapOne, Predicate, props, createAction } from 'src/app/lib/ngrx';
import { Image } from '../../entity';

export const add = createAction('[IMAGE] ADD', props<{ image: Image }>());

export const upsert = createAction('[IMAGE] UPSERT', props<{ image: Image }>());

export const update = createAction('[IMAGE] UPDATE', props<{ update: Update<Image> }>());

export const remove = createAction('[IMAGE] REMOVE', props<{ id: string }>());
