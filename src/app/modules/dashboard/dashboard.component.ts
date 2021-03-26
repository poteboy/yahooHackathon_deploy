import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { Router, UrlSegment } from '@angular/router';
import { Observable, map, mergeMap, mapTo, switchMap, tap, concat} from 'src/app/lib/rxjs';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import CanvasContract from 'src/app/contract-interface/canvas-contract';

// import { LoginOrLogout, LoginOrLogoutEnum, LoginOrLogoutEnum_En } from './header/log';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { actions as payloadActions } from 'src/app/modules/payload/payload.actions';
import { actions as loginVisibleActions } from 'src/app/modules/payload/login/login-visible.actions';
import * as userActions from 'src/app/model/store/user/actions';
import { dispatch } from 'rxjs/internal/observable/pairs';
import { getUser, getIsUserLoggedIn, getUserAddress } from '../payload';
// import { User } from 'src/app/contract-interface/user';
import { User } from 'src/app/model/entity';
import { ProxyProvider } from '@elrondnetwork/erdjs/out/proxyProvider';
import { NetworkConfig } from '@elrondnetwork/erdjs/out';
import { getLoginModalIsVisible } from 'src/app/modules/payload/login/login-visible.selectors';
import { Account, UserSigner } from '@elrondnetwork/erdjs';
import crypto from 'crypto-js';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less'],
})
export class DashboardComponent implements OnInit {
    public user$ = this.store$.select(getUser);
    public loggedIn$: Observable<boolean>  = this.store$.select(getIsUserLoggedIn);
    public LoginModalIsVisible$ = this.store$.select(getLoginModalIsVisible);
    public userFromStorage: User;

    ngOnInit(): void {
        this.store$.select(getUser).subscribe(user => {
            if (user === undefined) {
                if (!localStorage.getItem('user')) {
                } else {
                    console.log('hello');
                    const decryptedUser = localStorage.getItem('user');
                    this.userFromStorage =   JSON.parse(
                        crypto.AES.decrypt(decryptedUser, 'we love inaba sensei').toString(crypto.enc.Utf8));
                    this.store$.dispatch(userActions.add({user: this.userFromStorage}));
                    this.store$.dispatch(payloadActions.payload({
                        userAddress: this.userFromStorage.id, isLoggedIn: true, key: this.userFromStorage.password}));
                }
            }
        });
    }


    onLogin(loggedInOrNot: string): void {

        // this.store$.select()
        if (loggedInOrNot === 'login'){
            this.store$.dispatch(loginVisibleActions.loginVisible({LoginModalIsVisible: true}));
        }else if (loggedInOrNot === 'logout'){
            // logout function (clear cache/localstorage)
        }

    }

    onLogout(): void {
        localStorage.removeItem('user');
        this.store$.dispatch(payloadActions.reset());
        this.router.navigate(['']);
    }

    showLoginModal(show: boolean): void{
        if (!show) {
            this.store$.dispatch(loginVisibleActions.loginVisible({LoginModalIsVisible: false}));
        }
    }

    userLoggedIn(user: User): void{
        // user.keystoreFile
        // console.log(user.password);
        const jsonSigner = JSON.stringify(user.signer);
        console.log(user.keystoreFile)
        this.store$.dispatch(userActions.add(
            {user: {id: user.id,
                    loggedIn: true,
                    signer: jsonSigner,
                    account: user.account,
                    password: user.password,
                    keystoreFile: user.keystoreFile,
                }}));
        this.store$.dispatch(payloadActions.payload({userAddress: user.id, isLoggedIn: true, key: user.password}));
        this.loggedIn$ = this.store$.select(getIsUserLoggedIn);
        this.store$.dispatch(loginVisibleActions.loginVisible({LoginModalIsVisible: false}));
        this.store$.select(getUser).subscribe(user =>
            {
                const userJson = JSON.stringify(user);
                const RSAkey = 'we love inaba sensei';
                const encryptedJson = crypto.AES.encrypt(userJson, RSAkey).toString();
                localStorage.setItem('user', encryptedJson);
            });
    }


    constructor(
        private actions$: Actions,
        private store$: Store<any>,
        private sanitizer: DomSanitizer,
        private router: Router
        ) { }

}
