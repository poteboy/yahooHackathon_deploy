import { Account, Address, UserSigner, UserWallet } from '@elrondnetwork/erdjs/out';
import { ISigner } from '@elrondnetwork/erdjs/out/interface';

export class User {
    id: string;
    account: Account;
    signer: ISigner;
    isLoggedIn: boolean;
    keystoreFile: string;
    password: string;
    constructor(acc?: Account, accSigner?: ISigner, keystoreFile?: string, password?: string){
        this.account = acc || null;
        this.id = acc?.address.toString() || null;
        this.signer = accSigner || null;
        this.keystoreFile = keystoreFile || null;
        this.password = password || null;
        if (!acc || !accSigner){
            this.isLoggedIn = false;
        }else{
            this.isLoggedIn = true;
        }
    }

    static Login(keystoreFile: string, password: string): User {
        try {
            const accountSecret = UserWallet.decryptSecretKey(JSON.parse(keystoreFile), password);
            const accountAddress = new Address(accountSecret.generatePublicKey().toAddress());
            const account = new Account(accountAddress);
            const accountSigner = UserSigner.fromWallet(JSON.parse(keystoreFile), password);
            return new User(account, accountSigner, keystoreFile, password);
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
