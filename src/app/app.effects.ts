import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';

@Injectable()
export class AppEffects {
  constructor(private actions$: Actions, private router: Router) {}
}
