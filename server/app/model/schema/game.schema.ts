import { BestScore } from '@common/best-score';
import { BEST_DUO, BEST_SOLO } from '@common/constants';
import { ApiProperty } from '@nestjs/swagger';
export class Game {
    @ApiProperty()
    name: string;

    @ApiProperty()
    radius: number;

    @ApiProperty()
    pixelMap: boolean[][];

    @ApiProperty()
    nbDifferences: number;

    @ApiProperty()
    differencesGrouped: [number, number][][];

    @ApiProperty()
    image1: string;

    @ApiProperty()
    image2: string;

    @ApiProperty()
    imageDiff: string;

    @ApiProperty()
    bestSolo: BestScore[];

    @ApiProperty()
    bestDuo: BestScore[];

    constructor(name: string, radius: number) {
        this.name = name;
        this.radius = radius;
        this.image1 = '';
        this.image2 = '';
        this.imageDiff = '';
        this.pixelMap = [];
        this.differencesGrouped = [];
        this.nbDifferences = 0;
        this.bestDuo = BEST_DUO;
        this.bestSolo = BEST_SOLO;
    }
}
