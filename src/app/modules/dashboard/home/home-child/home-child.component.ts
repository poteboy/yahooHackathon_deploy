import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Store } from 'src/app/lib/ngrx';
import { Observable } from 'src/app/lib/rxjs';
import { getState as getPath } from 'src/app/modules/payload/path/path.selector';
import { actions as pathActions } from 'src/app/modules/payload/path/path.actions';
import { actions as imagePayloadActions } from 'src/app/modules/payload/image/image.actions';
import { getUser } from 'src/app/modules/payload';
import { getHomeImage, getImage } from 'src/app/modules/payload/image/image.selectors';
import { environment } from 'src/environments/environment';
import { NetworkConfig, ProxyProvider } from '@elrondnetwork/erdjs/out';
import CanvasContract from 'src/app/contract-interface/canvas-contract';
import * as p5 from 'p5';

const CANVAS_CONTRACT_ADDRESS = environment.contractAddress;
const PROXY_PROVIDER_ENDPOINT = environment.proxyProviderEndpoint;
@Component({
  selector: 'app-home-child',
  templateUrl: './home-child.component.html',
  styleUrls: ['./home-child.component.less']
})
export class HomeChildComponent implements OnInit {
    @Output() loadingEmitter = new EventEmitter();
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
    public loadingStateMessage: string;
    public ownedPixels: number[];
    public canvasRGB: number[][];
    public canvasRGB$: Observable<number[][]> = this.store$.select(getImage);
    public ownedPixelRGB: number[][];
    public canvasDimensions: number[];
    public pCanvas: any;
    public redraw: boolean;
    
    constructor(
      private store$: Store<any>,
    ) { }

    async ngOnInit(): Promise<void> {
      this.loadingEmitter.emit(true);
      this.store$.dispatch(pathActions.path({ path: 'home' }));
      this.store$.select(getHomeImage).subscribe(image => {
          this.image = image;
      });
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
          if (this.image) {
              this.canvasRGB = this.image;
              console.log(this.canvasRGB.slice(0, 10));
          } else {
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
          }

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
      this.store$.dispatch(imagePayloadActions.imageAdd({id: 'hack', homeImage: this.canvasRGB}));
      this.loadingEmitter.emit(false);
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
                pGraphic.stroke(0, 0, 0, 5);
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
}
