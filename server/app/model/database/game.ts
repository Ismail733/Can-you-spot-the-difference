import { BestScore } from '@common/best-score';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    radius: number;

    @ApiProperty()
    @Prop({ required: true })
    image1: string;

    @ApiProperty()
    @Prop({ required: true })
    image2: string;

    @ApiProperty()
    @Prop({ required: true })
    imageDiff: string;

    @ApiProperty()
    @Prop({ required: true })
    pixelMap: boolean[][];

    @ApiProperty()
    @Prop({ required: true })
    nbDifferences: number;

    @ApiProperty()
    @Prop({ required: true })
    differencesGrouped: [number, number][][];

    @ApiProperty()
    @Prop({ required: true })
    bestSolo: BestScore[];

    @ApiProperty()
    @Prop({ required: true })
    bestDuo: BestScore[];

    @ApiProperty()
    _id?: string;
}

export const gameSchema = SchemaFactory.createForClass(Game);
