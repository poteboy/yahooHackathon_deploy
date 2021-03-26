import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Account, Address, NetworkConfig, ProxyProvider, Transaction, TransactionOnNetwork, UserSigner } from '@elrondnetwork/erdjs/out';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import CanvasContract from 'src/app/contract-interface/canvas-contract';
import * as p5 from 'p5';
import { timeInterval, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/contract-interface/user';
import { getUser, getIsUserLoggedIn, getUserAddress } from '../../payload';
// import { User } from 'src/app/model/entity';
import { ISigner } from '@elrondnetwork/erdjs/out/interface';
import { BooleanValue } from '@elrondnetwork/erdjs/out/smartcontracts/typesystem';
import { getHomeImage } from '../../payload/image/image.selectors';
import { TransactionInfo } from '../transaction-modal/transaction-modal.component';
// import { User } from 'src/app/contract-interface/user';
// let a: User
const CANVAS_CONTRACT_ADDRESS = environment.contractAddress;
const PROXY_PROVIDER_ENDPOINT = environment.proxyProviderEndpoint;
@Component({
  selector: 'app-change-color-child',
  templateUrl: './change-color-child.component.html',
  styleUrls: ['./change-color-child.component.less']
})
export class ChangeColorChildComponent implements OnInit {
  @Input() image: number[][];
  @Input() user: User;
  @Output() loadingEmitter = new EventEmitter();
  public pCanvas: any;
  public foundContract: boolean;
  public ownedPixels: number[];
  public address: string;
  public canvasDimensions: number[];
  public ownedPixelRGB: number[][];
  public updatedPixels: boolean[];
  public updatedPixelsSum: number;
  public canvasRGB: number[][];
  public transactionCallBacks: Transaction[];
  public transactionModalIsVisible: boolean;
  public sendingTransaction: boolean;
  public loginModalIsVisible: boolean;
  public loadingStateMessage = '';
  public complete = false;
  public transactionLink = '';
  public transacting = false;
  public transactionInfo: TransactionInfo;
  public reDrawCanvas = false;
  public userBalance: number;
  private canvasContract: CanvasContract;
  private proxyProvider: ProxyProvider;
  private networkConfig: NetworkConfig;


  async ngOnInit(): Promise<void> {
    await this.loadContractCanvas();
    
  }

  constructor(
    private actions$: Actions,
    private store$: Store<any>
  ) { }

  async updateBalance(): Promise<void>{
    await this.user.account.sync(this.proxyProvider);
    this.userBalance = Math.round(parseFloat(this.user.account.balance.toDenominated())*1000)/1000;
  }

  async loadContractCanvas(): Promise<void> {
    this.loadingEmitter.emit(true);
    this.updatedPixels = [];
    this.loadingStateMessage = 'Connecting to Proxy...';
    this.proxyProvider = new ProxyProvider(PROXY_PROVIDER_ENDPOINT, 100000);
    await NetworkConfig.getDefault().sync(this.proxyProvider);
    this.loadingStateMessage = 'Syncing network...';
    // this.user = this.store$.select(getUser); // ここにユーザー情報
    this.loadingStateMessage = 'Getting Contract...';
    await this.updateBalance();
    this.canvasContract = new CanvasContract(CANVAS_CONTRACT_ADDRESS, this.proxyProvider, this.user, this.networkConfig);

    try {
      this.loadingStateMessage = 'Getting User-Owned pixel ids...';
      this.ownedPixels = await this.canvasContract.getOwnedPixels(
        this.user.account.address,
        1,
        1,
        10000
      );
      this.loadingStateMessage = 'Getting User-Owned pixel colors...';
      let pixelArray;
      this.ownedPixelRGB = [];
      let ownedPixelId = 1;
      if (this.image.length > 0) {
        this.canvasRGB = this.image;
        for (let i = 1; i <= this.canvasRGB.length; i++){
          if (this.ownedPixels.includes(i)){
            const rgb = this.canvasRGB[i - 1];
            this.ownedPixelRGB.push([rgb[0], rgb[1], rgb[2]]);
          }
        }
      } else {
        pixelArray = await this.canvasContract.getCanvasRGB(1);
        this.canvasRGB = [];
        for (let i = 0; i < pixelArray.length; i += 3) {
          const r = pixelArray[i];
          const g = pixelArray[i + 1];
          const b = pixelArray[i + 2];
          if (this.ownedPixels.includes(ownedPixelId)) {
            // id is owned, so show it as such
            this.ownedPixelRGB.push([r, g, b]);
            this.canvasRGB.push([r, g, b]);
          } else {
            this.canvasRGB.push([r, g, b]);
          }
          ownedPixelId++;
        }
      }
      // console.log(this.ownedPixelRGB.length)
      console.log(this.ownedPixelRGB.length);
    } catch (e) {
      console.log(e);
      this.loadingStateMessage = 'failed to get address information';
      this.ownedPixels = [];
      this.ownedPixelRGB = [];
      for (let i = 0; i < 100 * 100; i++) {
        this.ownedPixels[i] = i + 1;
        this.ownedPixelRGB[i] = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
      }
    }
    this.loadingStateMessage = 'Rendering canvas...';
    console.log(this.ownedPixels.length);
    console.log('total pixels owned: ', this.ownedPixels.length);
    this.canvasDimensions = await this.canvasContract.getCanvasDimensions(1);
    this.renderCanvas(500, 500, 0.5);
    this.updatedPixels = this.ownedPixels.map(() => false);
    console.log(this.ownedPixelRGB.length);
    if (this.ownedPixels.length === 0){
      this.loadingStateMessage = 'You do not own any pixels';
    }
    this.loadingStateMessage = '';
    this.loadingEmitter.emit(false);
  }
  showTransactionModal($event): void{
    this.transactionModalIsVisible = $event;
  }
  async changeColorTransaction(): Promise<void> {
    this.transactionLink = '';
    if (this.updatedPixelsSum > 0) {
      const updatedPixelArray = this.ownedPixels.filter((el, idx) => {
        return this.updatedPixels[idx] === true;
      });
      const updatedPixelArrayRGB = this.ownedPixelRGB.filter((el, idx) => {
        return this.updatedPixels[idx] === true;
      });
      const rs = updatedPixelArrayRGB.map(rgb => rgb[0]);
      const gs = updatedPixelArrayRGB.map(rgb => rgb[1]);
      const bs = updatedPixelArrayRGB.map(rgb => rgb[2]);
      try {

        this.transactionCallBacks = [];
        const limit = 1;
        console.log('Updated pixels: ', updatedPixelArray.length);
        const batches = Math.floor(updatedPixelArray.length / limit) + 1;
        console.log('Batches: ', batches);
        for (let i = 0; i < batches; i++) {
          this.transactionCallBacks[i] = await this.canvasContract.changeBatchPixelColor(
            1,
            updatedPixelArray.slice(i * limit, (i + 1) * limit),
            rs.slice(i * limit, (i + 1) * limit),
            gs.slice(i * limit, (i + 1) * limit),
            bs.slice(i * limit, (i + 1) * limit));
        }
        this.transactionModalIsVisible = true;
        console.log('Successful transaction created.');
        this.transactionInfo = {
          callFunction: 'changeBatchPixelColor',
          value: 0,
        };
        this.loadingStateMessage = 'Pending Confirmation';
      } catch (e) {
        this.transactionModalIsVisible = false;
        console.log('Failed to create transaction');
        console.log(e);
      }
    }
  }

  async confirmTransaction(): Promise<void> {
    if (this.transacting){
      return;
    }else{
      this.transacting = true;
      this.complete = false;
    }
    console.log('Sending transaction');
    this.loadingStateMessage = 'preparing transaction...';
    await NetworkConfig.getDefault().sync(this.proxyProvider);

    this.sendingTransaction = true;
    await this.user.account.sync(this.proxyProvider);
    this.loadingStateMessage = 'signing transaction...';
    for (const transactionCallBack of this.transactionCallBacks) {

      transactionCallBack.setNonce(this.user.account.nonce);

      await this.user.signer.sign(transactionCallBack);

      this.user.account.incrementNonce();
    }
    this.loadingStateMessage = 'Updating colors.';
    const n = this.transactionCallBacks.length;
    let p = 0;
    for (const transactionCallBack of this.transactionCallBacks) {
      await this.updateBalance();
      const hash = await transactionCallBack.send(this.proxyProvider);
      this.transactionLink = 'https://devnet-explorer.elrond.com/transactions/' + hash.toString();
      this.loadingStateMessage = `Updating colors ${Math.round((p / n) * 100)}%`;
      p++;
    }

    await this.transactionCallBacks[this.transactionCallBacks.length - 1].awaitExecuted(this.proxyProvider);
    
    this.loadingStateMessage = 'Done! Reload canvas.';
    this.transacting = false;
    this.complete = true;
  }

  cancelColor(): void{
    this.updatedPixels = this.ownedPixels.map(() => false);
    this.canvasRGB = this.image;
    this.ownedPixelRGB = [];
    for (let i = 1; i <= this.canvasRGB.length; i++){
      if (this.ownedPixels.includes(i)){
        const rgb = this.canvasRGB[i - 1];
        this.ownedPixelRGB.push([rgb[0], rgb[1], rgb[2]]);
      }
    }
    this.reDrawCanvas = true;
  }

  renderCanvas(width: number, height: number, strokeWeight: number): void {
    const sketch = s => {
      const canvasW = this.canvasDimensions[0];
      const canvasH = this.canvasDimensions[1];
      const totalPixels = canvasW * canvasH;
      let img: any;
      let pGraphic: any;
      let imageGrapic: any;
      const wRatio = width / canvasW;
      const hRatio = height / canvasH;
      let sliderSize: any;
      let button: any;
      let showImage: any;

      const handeFile = file => {
        if (file.type === 'image') {
          img = s.createImg(file.data, '');
          img.hide();
        } else {
          img = null;
        }
      };

      const reDraw = () => {
        pGraphic.clear();
        for (let i = 1; i <= totalPixels; i++) {
          if (this.ownedPixels.includes(i)) {
            pGraphic.stroke(0, 0, 0, 190);
            pGraphic.strokeWeight(strokeWeight*1.5);
            const idx = this.ownedPixels.indexOf(i);
            try {
              const rgb = this.ownedPixelRGB[idx];
              pGraphic.fill(rgb[0], rgb[1], rgb[2]);
              pGraphic.rect((i - 1) % canvasW * wRatio, Math.floor((i - 1) / canvasW) * hRatio, wRatio, hRatio);
            } catch (e) {
              console.log(e);
            }
          } else {
            const rgb = this.canvasRGB[i - 1];
            pGraphic.fill(rgb[0], rgb[1], rgb[2], 20);
            pGraphic.stroke(0, 0, 0, 20);
            pGraphic.strokeWeight(strokeWeight);
            pGraphic.rect((i - 1) % canvasW * wRatio, Math.floor((i - 1) / canvasW) * hRatio, wRatio, hRatio);
          }

        }
      };

      const enableImage = () => {
        if (img) { showImage = !showImage; }

        if (showImage) { button.html('画像オフ'); }
      };

      s.setup = () => {
        const input = s.createFileInput(handeFile);
        input.parent('file-uploader');

        sliderSize = s.createSlider(1, 100, 20);
        sliderSize.parent('w-slider');

        button = s.createButton('画像オン');
        button.parent('enable-image');
        button.mousePressed(enableImage);


        const pCanvas = s.createCanvas(width, height);
        pGraphic = s.createGraphics(width, height);
        imageGrapic = s.createGraphics(width, height);
        pCanvas.parent('sketch-holder');
        s.frameRate(25);
        if (this.ownedPixels.length === this.ownedPixelRGB.length) {
          reDraw();
        } else {
          console.log('Mismatch');
          console.log(this.ownedPixels.length);
          console.log(this.ownedPixelRGB.length / 3);
          reDraw();
        }
      };

      s.draw = () => {
        s.background(255);
        if (this.reDrawCanvas){
          reDraw();
          this.reDrawCanvas = false;
        }
        s.image(pGraphic, 0, 0);
        if (img && showImage) {
          const imgW = img.width * sliderSize.value() / 100;
          const imgH = img.height * sliderSize.value() / 100;
          imageGrapic.clear();
          imageGrapic.image(img,
            s.mouseX - imgW / 2,
            s.mouseY - imgH / 2,
            imgW,
            imgH
          );
          s.image(imageGrapic, 0, 0);
        }
      };
      s.mouseClicked = () => {
        if (this.transactionModalIsVisible) { return; }
        if (s.mouseX <= 0 || s.mouseY <= 0) { return; }
        if (img) {
          // image is setting color
          const imgW = img.width * sliderSize.value() / 100;
          const imgH = img.height * sliderSize.value() / 100;
          const imgStartX = Math.min(Math.max(s.mouseX - imgW / 2, 0), s.width);
          const imgStartY = Math.min(Math.max(s.mouseY - imgH / 2, 0), s.height);

          for (let i = 0; i < this.ownedPixels.length; i++) {
            const pixelId = this.ownedPixels[i];
            const pixelX = (pixelId - 1) % canvasW * wRatio;
            const pixelY = Math.floor((pixelId - 1) / canvasW) * hRatio;
            if (
              pixelX >= imgStartX &&
              pixelX < (imgStartX + imgW) &&
              pixelY >= imgStartY &&
              pixelY < (imgStartY + imgH)
            ) {
              // pixel inside hovering image
              const c = imageGrapic.get(pixelX, pixelY);
              this.ownedPixelRGB[i] = c;
              this.updatedPixels[i] = true;
              this.updatedPixelsSum = this.updatedPixels.filter(Boolean).length;
            }
          }
          reDraw();
        }
      };
    };
    this.pCanvas = new p5(sketch);
  }
}
