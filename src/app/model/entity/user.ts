import { Account } from '@elrondnetwork/erdjs';
import { ISigner } from '@elrondnetwork/erdjs/out/interface';
export interface User {
    id: string;
    account?: Account;
    signer?: ISigner | string;
    loggedIn?: boolean;
    password?: string;
}
