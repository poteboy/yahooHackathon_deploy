// Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard.routing.module';
import { StoreModule } from '@ngrx/store';

// Components
import { DashboardComponent } from './dashboard.component';
import { HeaderComponent } from './header/header.component';
import { LoginModalComponent } from './login-modal/login-modal.component';
import { HomeComponent } from './home/home.component';
import { TransactionModalComponent } from './transaction-modal/transaction-modal.component';
import { AuctionComponent } from './auction/auction.component';
import { ChangeColorComponent } from './change-color/change-color.component';
import { ChangeColorChildComponent } from './change-color/change-color-child.component';
import { HomeChildComponent } from './home/home-child/home-child.component';

@NgModule({
    imports: [
    CommonModule,
    DashboardRoutingModule,

    ],
    declarations: [
    DashboardComponent,
    HeaderComponent,
    LoginModalComponent,
    HomeComponent,
    HomeChildComponent,
    TransactionModalComponent,
    AuctionComponent,
    ChangeColorComponent,
    ChangeColorChildComponent,
    ],
    exports: [],
    providers: [],
})
export class DashboardModule {}
