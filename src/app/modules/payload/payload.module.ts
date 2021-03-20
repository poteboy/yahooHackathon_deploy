import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { getInitialState, reducersProvider, reducersToken } from './reducers';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        StoreModule.forFeature('modelPayload', reducersToken, {
            initialState: getInitialState,
        }),
        EffectsModule.forFeature([]),
    ],
    declarations: [],
    providers: [reducersProvider]
})
export class PayloadModule {}
