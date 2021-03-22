import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, mergeMap, mapTo, switchMap, tap, concat } from 'src/app/lib/rxjs';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import CanvasContract from 'src/app/contract-interface/canvas-contract';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { actions as payloadActions } from 'src/app/modules/payload/payload.actions';
import { actions as pathActions } from '../../payload/path/path.actions';
import { actions as imageActions } from '../../payload/image/image.actions';
import * as userActions from 'src/app/model/store/user/actions';
import { dispatch } from 'rxjs/internal/observable/pairs';
import { getUser, getIsUserLoggedIn, getUserAddress } from '../../payload';
import { getHomeImage } from 'src/app/modules/payload/image/image.selectors';
import { User } from 'src/app/model/entity';
import { ProxyProvider } from '@elrondnetwork/erdjs/out/proxyProvider';
import { NetworkConfig } from '@elrondnetwork/erdjs/out';
import { Navigator } from '../navigator';
import { getLoginModalIsVisible } from 'src/app/modules/payload/login/login-visible.selectors';
import { actions as loginVisibleActions } from 'src/app/modules/payload/login/login-visible.actions';
import { getState as getPath } from '../../payload/path/path.selector';
import { environment } from 'src/environments/environment';
import { HomeAnimation } from './animation';
import * as p5 from 'p5';
// import { User } from 'src/app/contract-interface/user';


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
    public image: SafeUrl;
    public image$: Observable<any> = this.store$.select(getHomeImage);
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
    public loadingStateMessage: string;
    public ownedPixels: number[];
    public canvasRGB: number[][];
    public ownedPixelRGB: number[][];
    public canvasDimensions: number[];
    public pCanvas: any;
    public redraw: boolean;

    async ngOnInit(): Promise<void> {
        this.store$.dispatch(pathActions.path({ path: 'home' }));

        // Fetch canvas rgb array
        this.loadingStateMessage = 'Connecting to Proxy...';
        this.proxyProvider = new ProxyProvider(PROXY_PROVIDER_ENDPOINT, 1000000);
        this.loadingStateMessage = 'Syncing to network...';
        await NetworkConfig.getDefault().sync(this.proxyProvider);
        this.loadingStateMessage = 'Getting Contract...';
        this.canvasContract = new CanvasContract(
            CANVAS_CONTRACT_ADDRESS,
            this.proxyProvider,
            // this.user$,
            // this.networkConfig
        );
        try {
            this.loadingStateMessage = 'Getting Canvas...';
            this.canvasDimensions = await this.canvasContract.getCanvasDimensions(1);
            const totalPixels = this.canvasDimensions[0] * this.canvasDimensions[1];
            const pixelArray = await this.canvasContract.getCanvasRGB(1);
            console.log(pixelArray.length);
            this.canvasRGB = [];
            for (let i = 0; i < totalPixels * 3; i += 3) {
                if (pixelArray.length > i) {
                    const r = pixelArray[i];
                    const g = pixelArray[i + 1];
                    const b = pixelArray[i + 2];
                    this.canvasRGB.push([r, g, b]);
                } else {
                    this.canvasRGB.push([120, 120, 120]);
                }
            }
            console.log(this.canvasRGB.slice(0, 10));
        } catch (e) {
            console.log('Failed to get canvas');
            this.loadingStateMessage = 'Failed to fetch canvas.';
            const totalPixels = 10000;
            this.canvasRGB = [];
            for (let i = 0; i < totalPixels; i++) {
                this.canvasRGB.push([120, 120, 120]);
            }
        }
        console.log(this.canvasRGB.length);
        this.loadingStateMessage = 'Rendering canvas...';
        this.renderCanvas(500, 500, 0.5);
        this.loadingStateMessage = '';
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

    get isHome(): boolean {
        if (this.path === 'home') {
            return true;
        }
    }

    renderCanvas(width: number, height: number, strokeWeight: number): void {
        const sketch = s => {
            const canvasW = this.canvasDimensions[0];
            const canvasH = this.canvasDimensions[1];
            const totalPixels = canvasW * canvasH;
            let pGraphic: any;
            const wRatio = width / canvasW;
            const hRatio = height / canvasH;
            const reDraw = () => {
                pGraphic.clear();
                for (let i = 1; i <= totalPixels; i++) {
                    const rgb = this.canvasRGB[i - 1];
                    pGraphic.fill(rgb[0], rgb[1], rgb[2], 255);
                    pGraphic.stroke(0, 0, 0, 10);
                    pGraphic.strokeWeight(strokeWeight);
                    pGraphic.rect((i - 1) % canvasW * wRatio, Math.floor((i - 1) / canvasW) * hRatio, wRatio, hRatio);
                }
            };

            s.setup = () => {
                const pCanvas = s.createCanvas(width, height);
                pGraphic = s.createGraphics(width, height);
                pCanvas.parent('sketch-holder');
                reDraw();
                s.noLoop();
            };
            s.draw = () => {
                s.background(255);
                s.image(pGraphic, 0, 0);
            };
        };
        this.pCanvas = new p5(sketch);
    }
    constructor(
        private actions$: Actions,
        private store$: Store<any>,
        private sanitizer: DomSanitizer,
        private router: Router,
    ) { }
}
