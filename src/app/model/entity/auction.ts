import { Address, NetworkConfig, ProxyProvider, Transaction } from '@elrondnetwork/erdjs/out';

export interface Auction {
    pixelId: number;
    startingPrice: number;
    endingPrice: number;
    deadline: number;
    deadlineString: string;
    owner: Address;
    ownerAddress: string;
    currentBid: number;
    currentWinner: Address;
    currentWinnerAddress: string;
}
