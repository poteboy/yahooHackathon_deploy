import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
import { getHomeImage } from 'src/app/modules/payload/image/image.selectors';

const CANVAS_CONTRACT_ADDRESS = environment.contractAddress;
const PROXY_PROVIDER_ENDPOINT = environment.proxyProviderEndpoint;
@Component({
  selector: 'app-change-color',
  templateUrl: './change-color.component.html',
  styleUrls: ['./change-color.component.less']
})

export class ChangeColorComponent implements OnInit {
  @Output() loadEmitter = new EventEmitter();
  public image$: Observable<any> = this.store$.select(getHomeImage);
  public user$: Observable<any> = this.store$.select(getUser);
  public user;
  public image: number[][];
  ngOnInit(): void {
    this.store$.dispatch(pathActions.path({path: 'changeColor'}));
    this.store$.select(getHomeImage).subscribe(image => {
      this.image = image;
    });
    this.store$.select(getUser).subscribe(user => {
      this.user = User.Login(user.keystoreFile, user.password);
    });
  }

  constructor(
    private actions$: Actions,
    private store$: Store<any>
  ) { }

  onLoad(isLoading: boolean): void{
    this.loadEmitter.emit(isLoading);
  }
}

