import { Account, Address, UserSigner, UserWallet } from '@elrondnetwork/erdjs/out';
import { ISigner } from '@elrondnetwork/erdjs/out/interface';

export class User {
    id: string;
    account: Account;
    signer: ISigner;
    isLoggedIn: boolean;

    constructor(acc?: Account, accSigner?: ISigner){
        this.account = acc || null;
        this.id = acc?.address.toString() || null;
        this.signer = accSigner || null;
        if (!acc || !accSigner){
            this.isLoggedIn = false;
        }else{
            this.isLoggedIn = true;
        }
    }

    static Login(keystoreFile: Buffer, password: string): User {
        try {
            const accountSecret = UserWallet.decryptSecretKey(keystoreFile, password);
            const accountAddress = new Address(accountSecret.generatePublicKey().toAddress());
            const account = new Account(accountAddress);
            const accountSigner = UserSigner.fromWallet(keystoreFile, password);
            return new User(account, accountSigner);
        } catch (err) {
            return new User();
        }
    }
}

/*usage

import {User} from '..../user';

const user = User.Login(JSONfile, "password!");
if(user.isLoggedIn){
    console.log("Logged in.");
}
console.log(user.address);
*/
