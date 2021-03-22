import { ReadVarExpr } from '@angular/compiler';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { User } from 'src/app/contract-interface/user';
// import { User } from 'src/app/contract-interface/user';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.less']
})
export class LoginModalComponent implements OnInit {
  @Input() user: User;
  @Output() cancelEmitter = new EventEmitter<boolean>();
  @Output() loginEmitter = new EventEmitter<User>();
  public password: string;
  public file: File;
  public wrongPassword: boolean;
  constructor() { }

  ngOnInit(): void {
  }
  cancel(): void {
    this.cancelEmitter.emit(true);
  }

  handleFileInput(files: FileList): void {
    const file = files[0];
    this.file = file;
  }


  onKey(event: any): void {
    if (event.keyCode === 13) {
    } else {
      this.password = event.target.value;
      this.wrongPassword = false;
    }
  }

  login(event: any): void{
    event.preventDefault();

    if (event.keyCode === 13){
      return;
    }
    const fileReader = new FileReader();
    fileReader.readAsText(this.file);
    fileReader.onload = (e) => {
      const user = User.Login(fileReader.result.toString(), this.password);
      if (!user.isLoggedIn) {
        console.log('wrong password');
        this.password = '';
        this.wrongPassword = true;
      } else {
        this.password = '';
        this.wrongPassword = false;
        this.loginEmitter.emit(user);
      }
    };
  }

}
