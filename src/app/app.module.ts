// Modules
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AppRoutesModule } from './app.routes.module';
import { EntityStoreModule } from './model/store/store.module';
import { RouterModule } from '@angular/router';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { PayloadModule } from 'src/app/modules/payload/payload.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Components
import { AppComponent } from './app.component';

// Others
import { AppEffects } from './app.effects';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutesModule,
    BrowserModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([AppEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 100,
    }),
    DashboardModule,
    PayloadModule,
    EntityStoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
