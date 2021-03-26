import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, mergeMap, mapTo, switchMap, tap, concat } from 'src/app/lib/rxjs';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import CanvasContract from 'src/app/contract-interface/canvas-contract';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { actions as payloadActions } from 'src/app/modules/payload/payload.actions';
import { actions as pathActions } from '../../payload/path/path.actions';
import { actions as imagePayloadActions } from '../../payload/image/image.actions';
import * as imageAction from 'src/app/model/store/image/actions';
import * as userActions from 'src/app/model/store/user/actions';
import { dispatch } from 'rxjs/internal/observable/pairs';
import { getUser, getIsUserLoggedIn, getUserAddress } from '../../payload';
import { getHomeImage, getImage } from 'src/app/modules/payload/image/image.selectors';
import { User } from 'src/app/model/entity';
import { ProxyProvider } from '@elrondnetwork/erdjs/out/proxyProvider';
import { NetworkConfig } from '@elrondnetwork/erdjs/out';
import { actions as loginVisibleActions } from 'src/app/modules/payload/login/login-visible.actions';
import { getState as getPath } from '../../payload/path/path.selector';
import { environment } from 'src/environments/environment';
import { HomeAnimation } from './animation';


const CANVAS_CONTRACT_ADDRESS = environment.contractAddress;
const PROXY_PROVIDER_ENDPOINT = environment.proxyProviderEndpoint;

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.less'],
    animations: [HomeAnimation],
})
export class HomeComponent implements OnInit {
    public user$ = this.store$.select(getUser);
    public path$ = this.store$.select(getPath);
    public path = 'home';
    public image$: Observable<any> = this.store$.select(getHomeImage);
    public image: number[][];
    public loggedIn$: Observable<boolean>;
    public LoginModalIsVisible: boolean;
    public gettingCanvas: boolean;
    public foundContract: boolean;
    public url: string;

    // network
    private proxyProvider: ProxyProvider;
    private canvasContract: CanvasContract;
    private networkConfig: NetworkConfig;
    // p5js sketch

    public isLoading: boolean;
    ngOnInit(): void{
    }

    get getPath(): string {
        this.store$.select(getPath).subscribe(
            p => {
                this.path = p.path;
            }
        );
        return this.path;
    }

    onAuction(): void {
        this.store$.select(getIsUserLoggedIn).subscribe(x => {
            if (x === false) {
                this.store$.dispatch(loginVisibleActions.loginVisible({ LoginModalIsVisible: true }));
            }
        });
        this.store$.dispatch(pathActions.path({ path: 'auction' }));
    }

    onChangeColor(): void {
        this.store$.select(getIsUserLoggedIn).subscribe(x => {
            if (x === false) {
                this.store$.dispatch(loginVisibleActions.loginVisible({ LoginModalIsVisible: true }));
            }
        });
        this.store$.dispatch(pathActions.path({ path: 'changeColor' }));
    }

    onHome(): void {
        this.store$.dispatch(pathActions.path({ path: 'home' }));
    }
    onLoading(isLoading: boolean): void{
        console.log(isLoading);
        this.isLoading = isLoading;
    }
    get isHome(): boolean {
        if (this.path === 'home') {
            return true;
        }
    }

    constructor(
        private actions$: Actions,
        private store$: Store<any>,
        private sanitizer: DomSanitizer,
        private router: Router,
    ) { }
}
