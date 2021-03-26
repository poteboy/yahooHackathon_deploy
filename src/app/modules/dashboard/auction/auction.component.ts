import { ThrowStmt } from '@angular/compiler';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Address, NetworkConfig, ProxyProvider, Transaction } from '@elrondnetwork/erdjs/out';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import * as p5 from 'p5';
import { Observable } from 'rxjs';
import CanvasContract from 'src/app/contract-interface/canvas-contract';
// import { User } from 'src/app/contract-interface/user';
import { environment } from 'src/environments/environment';
import { actions as pathActions } from '../../payload/path/path.actions';
import { Auction } from 'src/app/model/entity';
import { getHomeImage } from '../../payload/image/image.selectors';
import { getUser } from '../../payload';
import { User } from 'src/app/contract-interface/user';
import { TransactionInfo } from '../transaction-modal/transaction-modal.component';
const CANVAS_CONTRACT_ADDRESS = environment.contractAddress;
const PROXY_PROVIDER_ENDPOINT = environment.proxyProviderEndpoint;

@Component({
  selector: 'app-auction',
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.less']
})
export class AuctionComponent implements OnInit {
  @Output() loadingEmitter = new EventEmitter();
  public image$: Observable<any> = this.store$.select(getHomeImage);
  public user$: Observable<any> = this.store$.select(getUser);
  public image: number[][];
  public transactionModalIsVisible: boolean;
  public sendingTransaction: boolean;
  public loginModalIsVisible: boolean;
  public loadingStateMessage: string;
  public currentAuction: Auction;
  public transactionCallBack: Transaction;
  private canvasContract: CanvasContract;
  private proxyProvider: ProxyProvider;
  private networkConfig: NetworkConfig;
  public activeAuctions: number[];
  public bidAmount = 0;
  public startingPrice = 0;
  public endingPrice = 0;
  public deadlineH = 0;
  public user: User;
  public isSelling = false;
  public sellId: number;
  public transactionLink: string;
  public fetchingOwnedPixels: boolean;
  private currentSelection: number;
  // p5js sketch
  public ownedPixels: number[] = [];
  public auctionRGB: number[][];
  public ownedPixelRGB: number[][];
  public canvasDimensions: number[];
  public pCanvas: any;
  public redraw: boolean;
  public transactionInfo: TransactionInfo;
  public transacting = false;
  public complete = false;
  public timeNow;
  async ngOnInit(): Promise<void> {
    this.loadingEmitter.emit(true);
    this.store$.select(getHomeImage).subscribe(image => {
      this.image = image;
    });
    this.store$.select(getUser).subscribe(user => {
      // console.log(user);
      this.user = User.Login(user.keystoreFile, user.password);
      // console.log(this.user);
    });
    this.store$.dispatch(pathActions.path({ path: 'auction' }));
    this.proxyProvider = new ProxyProvider(PROXY_PROVIDER_ENDPOINT, 1000000);
    this.loadingStateMessage = 'Connecting to Proxy...';
    await NetworkConfig.getDefault().sync(this.proxyProvider);
    this.loadingStateMessage = 'Syncing network...';
    this.loadingStateMessage = 'Getting Contract...';
    this.canvasContract = new CanvasContract(
      CANVAS_CONTRACT_ADDRESS,
      this.proxyProvider,
      this.user,
      this.networkConfig
    );
    try {
      this.loadingStateMessage = 'Getting Active Auctions';
      this.fetchingOwnedPixels = true;
      this.activeAuctions = await this.canvasContract.getAuctions(1, 1, 10000);
      console.log('Active auctions', this.activeAuctions);
      if (this.activeAuctions.length === 0){
        this.loadingStateMessage = 'No Active Auctions';
      }
      this.loadingStateMessage = '';
      // this.canvasDimensions = await this.canvasContract.getCanvasDimensions(1);
      this.canvasDimensions = [100, 100];
      this.auctionRGB = [];
      for (let i = 1; i <= this.canvasDimensions[0] * this.canvasDimensions[1]; i++) {
        if (this.activeAuctions.includes(i)) {
          this.auctionRGB.push([117, 250, 255]);
        } else {
          this.auctionRGB.push([89, 96, 117, 50]);
        }
      }
    } catch (e) {
      console.log(e);
    }
    this.loadingStateMessage = 'Rendering Canvas';
    this.renderCanvas(500, 500, 0.5);
    this.loadingStateMessage = '';
    if (this.activeAuctions.length === 0){
      this.loadingStateMessage = 'No Active Auctions';
    }
    if (this.user.account){
      this.loadingStateMessage = 'Fetching Owned Pixels...';
      this.ownedPixels = await this.canvasContract.getOwnedPixels(
        this.user.account.address,
        1,
        1,
        10000
      );
    }
    this.fetchingOwnedPixels = false;
    this.loadingStateMessage = '';
    console.log(this.ownedPixels.length);
    this.loadingEmitter.emit(false);
  }

  constructor(private actions$: Actions, private store$: Store<any>) {
  }
  showTransactionModal(show: boolean): void{
    this.transactionModalIsVisible = show;
    if (!show){
      this.transactionInfo = null;
      this.complete = false;
      this.transactionLink = '';
    }
  }
  showLoginModal(show: boolean): void {
    this.loginModalIsVisible = show;
  }
  async createAuctionTransaction(): Promise<void> {
    this.transactionLink = '';
    if (!this.user) {
      this.loginModalIsVisible = true;
    } else {
      try {
        this.transactionCallBack = await this.canvasContract.bidAuction(
          1,
          this.currentAuction.pixelId,
          this.bidAmount
        );
        console.log('Successful transaction created.');
        this.transactionInfo = {
          callFunction: 'auctionPixel',
          value: this.bidAmount,
        };
        this.loadingStateMessage = 'Pending Confirmation';
        this.transactionModalIsVisible = true;
      } catch (e) {
        this.transactionModalIsVisible = false;
        console.log('Failed at transacion creation');
        console.log(e);
      }
    }

  }
  async createSellAuctionTransaction(): Promise<void>{
    this.transactionLink = '';
    try {
      this.transactionCallBack = await this.canvasContract.createAuction(
        1,
        this.sellId,
        this.startingPrice,
        this.endingPrice,
        this.deadlineH * 60 * 60,
      );
      console.log('Successful transaction created.');
      this.transactionInfo = {
        callFunction: 'auctionPixel',
        value: 0,
      };
      this.loadingStateMessage = 'Pending Confirmation';
      this.transactionModalIsVisible = true;
    } catch (e) {
      this.transactionModalIsVisible = false;
      console.log('Failed at transacion creation');
      console.log(e);
    }
  }
  async createEndTransaction(): Promise<void>{
    this.transactionLink = '';
    try {
      this.transactionCallBack = await this.canvasContract.endAuction(
        1,
        this.currentAuction.pixelId
      );
      console.log('Successful transaction created.');
      this.transactionInfo = {
        callFunction: 'endAuction',
        value: 0,
      };
      this.loadingStateMessage = 'Pending Confirmation';
      this.transactionModalIsVisible = true;
    } catch (e) {
      this.transactionModalIsVisible = false;
      console.log('Failed at transacion creation');
      console.log(e);
    }
  }
  changeMode($event: any): void{
    if ($event === 'sell' && this.ownedPixels.length > 0){
      this.isSelling = true;
      this.redraw = true;
      this.loadingStateMessage = '';
    }else{
      this.isSelling = false;
      this.redraw = true;
    }
  }
  onKey($event: any): void {
    if (!this.isSelling){
      this.bidAmount = $event.target.value;
    }else{
      if ($event.target.name === 'starting-price'){
        this.startingPrice = $event.target.value;
      }else if ($event.target.name === 'ending-price'){
        this.endingPrice = $event.target.value;
      }else if ($event.target.name === 'deadline'){
        this.deadlineH = $event.target.value;
      }
    }
  }

  async confirmTransaction(): Promise<void> {
    let selection;
    if (this.transacting){
      return;
    }else{
      this.transacting = true;
      this.complete = false;
    }
    if (!this.isSelling){
      selection = this.currentAuction.pixelId;
    }else{
      selection = this.sellId;
    }
    console.log('Sending transaction');
    this.loadingStateMessage = 'preparing transaction...';
    await NetworkConfig.getDefault().sync(this.proxyProvider);

    this.sendingTransaction = true;

    await this.user.account.sync(this.proxyProvider);

    this.transactionCallBack.setNonce(this.user.account.nonce);
    this.loadingStateMessage = 'signing transaction...';
    await this.user.signer.sign(this.transactionCallBack);

    this.user.account.incrementNonce();
    this.loadingStateMessage = 'sending transaction...';
    const hash = await this.transactionCallBack.send(this.proxyProvider);
    this.transactionLink = 'https://devnet-explorer.elrond.com/transactions/' + hash.toString();
    this.loadingStateMessage = 'processing transaction...';
    await this.transactionCallBack.awaitExecuted(this.proxyProvider);

    const executed = await this.proxyProvider.getTransactionStatus(hash);
    this.loadingStateMessage = 'finished!';
    this.transacting = false;
    this.complete = true;
    if (executed.isSuccessful()) {
      this.loadingStateMessage = 'refreshing...';
      this.currentAuction = await this.getAuctionInfo(selection);
      this.loadingStateMessage = 'getting auction info...';
      this.ownedPixels = await this.canvasContract.getOwnedPixels(
        this.user.account.address,
        1,
        1,
        10000
      );
      this.activeAuctions = await this.canvasContract.getAuctions(1, 1, 10000);
      this.loadingStateMessage = '';
    } else {
      this.loadingStateMessage = 'refreshing...';
      this.currentAuction = await this.getAuctionInfo(selection);
      this.loadingStateMessage = 'getting auction info...';
      this.ownedPixels = await this.canvasContract.getOwnedPixels(
        this.user.account.address,
        1,
        1,
        10000
      );
      this.activeAuctions = await this.canvasContract.getAuctions(1, 1, 10000);
      this.loadingStateMessage = '';
    }
    this.redraw = true;
  }

  async userLoggedIn(user: User): Promise<void> {
    this.user = user;
    this.loginModalIsVisible = false;
  }
  // dirty solution to codec problem;
  async getAuctionInfo(id: number): Promise<Auction> {
    this.timeNow = Date.now() / 1000;
    try {
      this.loadingStateMessage = 'getting starting price...';
      let startingPrice = await this.canvasContract.getAuctionStartingPrice(1, id);
      this.loadingStateMessage = 'getting ending price...';
      let endingPrice = await this.canvasContract.getAuctionEndingPrice(1, id);
      this.loadingStateMessage = 'getting deadline...';
      const deadline = await this.canvasContract.getAuctionDeadline(1, id);
      this.loadingStateMessage = 'getting owner...';
      const owner: Address = await this.canvasContract.getAuctionOwner(1, id);
      this.loadingStateMessage = 'getting current bids...';
      let currentBid = await this.canvasContract.getAuctionCurrentBid(1, id);
      this.loadingStateMessage = 'getting current winner...';
      const currentWinner = await this.canvasContract.getAuctionCurrentWinner(1, id);
      let currentWinnerAddress;
      if (currentWinner) {
        currentWinnerAddress = currentWinner.bech32().slice(0, 4) + '...' + currentWinner.bech32().slice(-4, -1);
      } else {
        currentWinnerAddress = null;
      }
      startingPrice /= 10 ** 18;
      endingPrice /= 10 ** 18;
      currentBid /= 10 ** 18;
      const deadlineString = new Date(deadline * 1000).toLocaleString();
      const ownerAddress = owner.bech32();
      console.log(ownerAddress);
      const selectedAuctionInfo: Auction = {
        pixelId: id,
        startingPrice,
        endingPrice,
        deadline,
        deadlineString,
        owner,
        ownerAddress,
        currentBid,
        currentWinner,
        currentWinnerAddress
      };
      return selectedAuctionInfo;
    } catch (e) {
      console.log(e);
    }
  }

  async selectPixel(id: number): Promise<void> {
    if (this.isSelling){
      if (this.ownedPixels.includes(id)){
        this.sellId = id;
        this.redraw = true;
      }else{
        console.log('You do not own this pixel');
      }
    }else{
      try {
        if (this.activeAuctions.includes(id)) {
          this.currentSelection = id;
          this.loadingStateMessage = 'fetching auction information...';
          this.currentAuction = await this.getAuctionInfo(id);
          this.loadingStateMessage = '';
          this.redraw = true;
        } else {
          console.log('Pixel not on auction');
        }
      } catch (e) {
        console.log(id);
        console.log(e);
      }
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
        let selected = false;
        let selectedX;
        let selectedY;
        pGraphic.clear();
        if (this.isSelling){
          for (let i = 1; i <= totalPixels; i++){
            if (this.ownedPixels && this.ownedPixels.includes(i)){
              const rgb = this.image[i - 1];
              pGraphic.fill(rgb[0], rgb[1], rgb[2]);
              pGraphic.stroke(0, 0, 0, 20);
              pGraphic.strokeWeight(strokeWeight);
              if (this.sellId && this.sellId === i){
                pGraphic.stroke(255, 89, 0);
                pGraphic.strokeWeight(3);
              }
            }else{
              pGraphic.strokeWeight(strokeWeight);
              pGraphic.stroke(0, 0, 0, 20);
              pGraphic.fill(89, 96, 117, 50);
            }
            pGraphic.rect(
              (i - 1) % canvasW * wRatio,
              Math.floor((i - 1) / canvasW) * hRatio,
              wRatio,
              hRatio
            );
          }
        }else{
          for (let i = 1; i <= totalPixels; i++) {
            const rgb = this.auctionRGB[i - 1];
            pGraphic.fill(rgb[0], rgb[1], rgb[2], 255);
            pGraphic.stroke(0, 0, 0, 10);
            pGraphic.strokeWeight(strokeWeight);
            if (this.currentAuction && this.currentAuction.pixelId === i) {
              console.log('redrew');
              pGraphic.stroke(255, 89, 0);
              pGraphic.strokeWeight(3);
              selectedX = (i - 1) % canvasW * wRatio;
              selectedY = Math.floor((i - 1) / canvasW) * hRatio;
              selected = true;
            }
            pGraphic.rect(
              (i - 1) % canvasW * wRatio,
              Math.floor((i - 1) / canvasW) * hRatio,
              wRatio,
              hRatio
            );
          }
          if (selected) {
            pGraphic.stroke(255, 89, 0);
            pGraphic.strokeWeight(3);
            pGraphic.rect(
              selectedX,
              selectedY,
              wRatio * 1.1,
              hRatio * 1.1
            );
          }
        }
      };

      s.setup = () => {
        const pCanvas = s.createCanvas(width, height);
        pGraphic = s.createGraphics(width, height);
        pCanvas.parent('sketch-holder');
        // s.frameRate(25);
        reDraw();
      };

      s.draw = () => {
        s.background(255);
        s.image(pGraphic, 0, 0);
        const x = Math.floor(s.mouseX / wRatio) * wRatio;
        const y = Math.floor(s.mouseY / hRatio) * hRatio;
        s.stroke(255, 89, 0);
        s.fill(255, 174, 0, 20);
        s.strokeWeight(2);
        s.rect(x, y, wRatio, hRatio);
        s.strokeWeight(1);
        s.noFill();
        s.rect(0, 0, x, y);
        if (this.redraw) {
          reDraw();
          this.redraw = false;
        }
      };
      s.mouseClicked = () => {
        if (s.mouseX > 0 && s.mouseX < width && s.mouseY > 0 && s.mouseY < height && !this.loginModalIsVisible) {
          const x = Math.floor(s.mouseX / wRatio) * wRatio;
          const y = Math.floor(s.mouseY / hRatio) * hRatio;
          console.log(y);
          const idx = x / wRatio + (y / hRatio) * width / hRatio;
          this.selectPixel(idx + 1);
        }
      };
    };
    this.pCanvas = new p5(sketch);
  }


}
