import { Component, OnInit, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {  map } from 'rxjs/operators';
import * as userActions from 'src/app/model/store/user/actions';
import * as testActions from 'src/app/model/store/test/actions';
import { actions as payloadActions } from 'src/app/modules/payload/payload.actions';
// import { actions as loginVisibleActions } from 'src/app/modules/payload/login/login-visible.actions';
import { getUser } from 'src/app/modules/payload/payload.selectors';
import { User } from './model/entity';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  ngOnInit(): void {}

  constructor(private actions$: Actions, private store$: Store<any>, private router: Router) {}
}
