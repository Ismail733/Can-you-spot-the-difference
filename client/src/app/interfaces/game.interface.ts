import { BestScore } from '@common/best-score';

export interface Game {
    _id: string;
    name: string;
    image1: string;
    image2: string;
    nbDifferences: number;
    bestSolo: BestScore[];
    bestDuo: BestScore[];
}
