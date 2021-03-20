import { Account, UserSigner } from '@elrondnetwork/erdjs';

export interface User {
    id: string;
    account?: Account;
    signer?: UserSigner | string;
    loggedIn?: boolean;
}
