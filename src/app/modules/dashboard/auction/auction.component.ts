import { Component, OnInit } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { actions as pathActions } from '../../payload/path/path.actions';

@Component({
  selector: 'app-auction',
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.less']
})
export class AuctionComponent implements OnInit {

  ngOnInit(): void {
      this.store$.dispatch(pathActions.path({path: 'auction'}));
  }

  constructor(private actions$: Actions, private store$: Store<any>) {}

}
