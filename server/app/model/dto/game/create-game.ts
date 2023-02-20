import { BestScore } from '@common/best-score';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateGameDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    radius: number;

    @IsString()
    @ApiProperty()
    image1: string;

    @IsString()
    @ApiProperty()
    image2: string;

    @IsString()
    @ApiProperty()
    imageDiff: string;

    @ApiProperty()
    @IsArray()
    pixelMap: boolean[][];

    @ApiProperty()
    @IsNumber()
    nbDifferences: number;

    @ApiProperty()
    @IsArray()
    differencesGrouped: [number, number][][];

    @ApiProperty()
    @IsArray()
    bestSolo: BestScore[];

    @ApiProperty()
    @IsArray()
    bestDuo: BestScore[];
}
