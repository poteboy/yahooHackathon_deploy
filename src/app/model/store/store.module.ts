import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { getInitialState, reducersProvider, reducersToken } from './reducers';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        StoreModule.forFeature('entityStore', reducersToken, {
            initialState: getInitialState,
        }),
    ],
    declarations: [],
    providers: [reducersProvider],
})
export class EntityStoreModule {}
