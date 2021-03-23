import { Auction } from './auction';

export interface Image {
    id: string;
    homeImage?: number[][];
    auctionImage?: Auction;
}
