import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Transaction } from '@elrondnetwork/erdjs/out';

export interface TransactionInfo{
  callFunction: string;
  value?: number;
  gasLimit?: number;
}

@Component({
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.less']
})
export class TransactionModalComponent implements OnInit {
  @Input() transactionInfo: TransactionInfo;
  @Input() transactionStatus: string;
  @Input() isTransacting: boolean;
  @Input() complete: boolean;
  @Input() transactionLink: string;
  @Output() confirmEmitter = new EventEmitter();
  @Output() cancelEmitter = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  confirm(): void{
    this.confirmEmitter.emit(true);
  }

  cancel(): void{
    this.cancelEmitter.emit(true);
  }

}
