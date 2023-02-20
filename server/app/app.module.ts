import { FileController } from '@app/controllers/file/file.controller';
import { GameController } from '@app/controllers/game/game.controller';

import { GameGateway } from '@app/gateways/game/game.gateway';
import { Game, gameSchema } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';

import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';

import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
    ],
    controllers: [FileController, GameController],
    providers: [GameGateway, GameService, DetectionDifferenceService, Logger],
})
export class AppModule {}
