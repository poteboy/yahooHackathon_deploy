import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { Address, NetworkConfig, ProxyProvider, Transaction } from '@elrondnetwork/erdjs/out';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'node:constants';
import * as p5 from 'p5';
import { Observable } from 'rxjs';
import CanvasContract from 'src/app/contract-interface/canvas-contract';
import { User } from 'src/app/contract-interface/user';
import { environment } from 'src/environments/environment';
import { actions as pathActions } from '../../payload/path/path.actions';

const CANVAS_CONTRACT_ADDRESS = environment.contractAddress;
const PROXY_PROVIDER_ENDPOINT = environment.proxyProviderEndpoint;

interface Auction {
  pixelId: number;
  startingPrice: number;
  endingPrice: number;
  deadline: number;
  deadlineString: string;
  owner: Address;
  ownerAddress: string;
  currentBid: number;
  currentWinner: Address;
  currentWinnerAddress: string;
}
@Component({
  selector: 'app-auction',
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.less']
})
export class AuctionComponent implements OnInit {
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
  public user: User;
  private currentSelection: number;
  // p5js sketch
  public ownedPixels: number[];
  public canvasRGB: number[][];
  public ownedPixelRGB: number[][];
  public canvasDimensions: number[];
  public pCanvas: any;
  public redraw: boolean;
  async ngOnInit(): Promise<void> {
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
      this.activeAuctions = await this.canvasContract.getAuctions(1, 1, 10000);
      console.log('Active auctions', this.activeAuctions);
      // this.canvasDimensions = await this.canvasContract.getCanvasDimensions(1);
      this.canvasDimensions = [100, 100];
      this.canvasRGB = [];
      for (let i = 1; i <= this.canvasDimensions[0] * this.canvasDimensions[1]; i++) {
        if (this.activeAuctions.includes(i)) {
          this.canvasRGB.push([0, 255, 47]);
        } else {
          this.canvasRGB.push([192, 196, 196]);
        }
      }
    } catch (e) {
      console.log(e);
    }
    this.renderCanvas(500, 500, 0.5);
    this.loadingStateMessage = '';
  }

  constructor(private actions$: Actions, private store$: Store<any>) {
  }

  showLoginModal(show: boolean): void {
    this.loginModalIsVisible = show;
  }
  async createAuctionTransaction(): Promise<void> {
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
        this.transactionModalIsVisible = true;
      } catch (e) {
        this.transactionModalIsVisible = false;
        console.log('Failed at transacion creation');
        console.log(e);
      }
    }

  }
  onKey($event: any): void {
    this.bidAmount = $event.target.value;
  }

  async confirmTransaction(): Promise<void> {
    const selection = this.currentAuction.pixelId;
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
    this.loadingStateMessage = 'processing transaction...';
    await this.transactionCallBack.awaitExecuted(this.proxyProvider);

    const executed = await this.proxyProvider.getTransactionStatus(hash);
    this.loadingStateMessage = 'finished!';
    if (executed.isSuccessful()) {
      this.currentAuction = await this.getAuctionInfo(selection);
      this.loadingStateMessage = '';
    } else {
      this.currentAuction = await this.getAuctionInfo(selection);
      this.loadingStateMessage = '';
      console.log('done');
    }

  }

  async userLoggedIn(user: User): Promise<void> {
    this.user = user;
    this.loginModalIsVisible = false;
  }
  // dirty solution to codec problem;
  async getAuctionInfo(id: number): Promise<Auction> {
    try {
      let startingPrice = await this.canvasContract.getAuctionStartingPrice(1, id);
      let endingPrice = await this.canvasContract.getAuctionEndingPrice(1, id);
      const deadline = await this.canvasContract.getAuctionDeadline(1, id);
      const owner: Address = await this.canvasContract.getAuctionOwner(1, id);
      let currentBid = await this.canvasContract.getAuctionCurrentBid(1, id);
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
      const deadlineString = new Date(deadline * 1000).toString();
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
    if (this.user) {
      console.log(this.user.account.address.bech32());
    }
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
        for (let i = 1; i <= totalPixels; i++) {
          const rgb = this.canvasRGB[i - 1];
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
