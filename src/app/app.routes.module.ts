import { NgModule } from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { config } from './config';

const r = config.routes;

export const routes: Routes = [
    {
        path: r.root,
        loadChildren: () => import('./modules/dashboard').then(m => m.DashboardModule),
    }
];

@NgModule({
    imports: [
      RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollOffset: [0, 70],
    relativeLinkResolution: 'legacy'
}),
    ],
    exports: [RouterModule],
  })
export class AppRoutesModule {}
