import { Injectable } from '@angular/core';
import { User } from '../contract-interface/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public user: User;
  constructor() { }

  public setUser(u: User): void{
    this.user = u;
  }
  public getUser(): User{
    return this.user;
  }
}
