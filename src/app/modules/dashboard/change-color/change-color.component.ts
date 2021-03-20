import { Component, OnInit } from '@angular/core';
import { Address, NetworkConfig, ProxyProvider, Transaction } from '@elrondnetwork/erdjs/out';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import CanvasContract from 'src/app/contract-interface/canvas-contract';
import * as p5 from 'p5';
import { timeInterval, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/contract-interface/user';
import { getUser, getIsUserLoggedIn, getUserAddress } from '../../payload';
import { actions as pathActions } from '../../payload/path/path.actions';

const CANVAS_CONTRACT_ADDRESS = environment.contractAddress;
const PROXY_PROVIDER_ENDPOINT = environment.proxyProviderEndpoint;
@Component({
  selector: 'app-change-color',
  templateUrl: './change-color.component.html',
  styleUrls: ['./change-color.component.less']
})

export class ChangeColorComponent implements OnInit {

  public user$ = this.store$.select(getUser);

  ngOnInit(): void {
    this.store$.dispatch(pathActions.path({path: 'changeColor'}));
  }

  constructor(
    private actions$: Actions,
    private store$: Store<any>
  ) { }
}





//   const proxyProvider = new ProxyProvider('http://localhost:7950', 1000000);
  //   try {
  //     await NetworkConfig.getDefault().sync(proxyProvider);
  //   } catch (e) {
  //     console.log("Failed to get network config.");
  //   }


  //   try {
  //     this.canvasContract = new CanvasContract(
  //       'erd1qqqqqqqqqqqqqpgqfzydqmdw7m2vazsp6u5p95yxz76t2p9rd8ss0zp9ts', //smart contract address
  //       proxyProvider
  //     );
  //   } catch (e) {
  //     this.canvasContract = new CanvasContract();

  //   }
  //   if (this.canvasContract.proxyProvider) {
  //     this.foundContract = true;
  //   } else {
  //     this.foundContract = false;
  //   }
  //   if(!this.foundContract)return;
  //   let user;
  //   this.store$.select(getUserAddress).subscribe(x => {
  //     this.address = x;
