// Modules
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './home/home.component';
import { AuctionComponent } from './auction/auction.component';
import { ChangeColorComponent } from './change-color/change-color.component';

// Others
import { config } from '../../config';

const r = config.routes;

const routes: Routes = [
    {
        path: r.root,
        component: DashboardComponent,
        children: [
        {
            path: r.root,
            component: HomeComponent,
            data: { animation: 'home' }
        },
        {
            path: r.auction,
            component: AuctionComponent,
            data: { animation: 'auction' }
        },
        {
            path: r.changeColor,
            component: ChangeColorComponent,
            data: { animation: 'changeColor' }
        }
    ]
    }
];



@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
  })
export class DashboardRoutingModule {}
