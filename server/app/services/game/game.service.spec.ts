/* eslint-disable no-underscore-dangle */
import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game';
import { BEST_DUO, BEST_SOLO, CLASSIC_MULTI, CLASSIC_SOLO } from '@common/constants';
import { GameStatus } from '@common/game-status';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GameService } from './game.service';

const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('GameServiceEndToEnd', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    const gameTest: Game = {
        name: 'test',
        radius: 0,
        image1: 'img1',
        image2: 'img2',
        imageDiff: 'imgdiff',
        pixelMap: [[true]],
        nbDifferences: 1,
        differencesGrouped: [],
        bestSolo: BEST_SOLO,
        bestDuo: BEST_DUO,
    };
    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
            ],
            providers: [GameService],
        }).compile();

        service = module.get<GameService>(GameService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(gameModel).toBeDefined();
    });

    it('can create-game', () => {
        const classCreateGame = new CreateGameDto();
        expect(classCreateGame).toBeDefined();
    });

    it('getAllGames() returns all the games in database', async () => {
        await gameModel.deleteMany({});
        expect((await service.getAllGames()).length).toEqual(0);
        await gameModel.create(gameTest);
        expect((await service.getAllGames()).length).toEqual(1);
    });

    it('updateBestScore() adds the user to the best score list if winner SOLO', async () => {
        const game1 = await gameModel.create(gameTest);
        const gameToUpdate = new GameStatus();
        gameToUpdate.currentGameID = game1._id;
        gameToUpdate.mode = CLASSIC_SOLO;
        gameToUpdate.time = 1;
        await service.updateBestScore(gameToUpdate, 'winner');
        const newGame = await service.getGame(game1._id);
        expect(newGame.bestSolo).toContainEqual({ username: 'winner', time: 1 });
    });

    it('updateBestScore() adds the user to the best score list if winner classic-multi', async () => {
        const game1 = await gameModel.create(gameTest);
        const gameToUpdate = new GameStatus();
        gameToUpdate.currentGameID = game1._id;
        gameToUpdate.mode = CLASSIC_MULTI;
        gameToUpdate.time = 1;
        await service.updateBestScore(gameToUpdate, 'winner');
        const newGame = await service.getGame(game1._id);
        expect(newGame.bestDuo).toContainEqual({ username: 'winner', time: 1 });
    });

    it('updateBestScore() should handle the error if failed', async () => {
        jest.spyOn(gameModel, 'updateOne').mockImplementation(() => {
            throw new Error();
        });
        try {
            const game1 = await gameModel.create(gameTest);
            const gameToUpdate = new GameStatus();
            gameToUpdate.currentGameID = game1._id;
            gameToUpdate.mode = CLASSIC_SOLO;
            gameToUpdate.time = 1;
            await service.updateBestScore(gameToUpdate, 'winner');
        } catch (err) {
            expect(err).toBeTruthy();
        }
    });

    it('resetBestScores() resets to default values all the best scores from all games', async () => {
        await gameModel.deleteMany({});
        const game1 = await gameModel.create(gameTest);
        const game2 = await gameModel.create(gameTest);
        await service.resetBestScores();
        expect(game1.bestSolo).toEqual(BEST_SOLO);
        expect(game2.bestSolo).toEqual(BEST_SOLO);
        expect(game1.bestDuo).toEqual(BEST_DUO);
        expect(game2.bestDuo).toEqual(BEST_DUO);
    });

    it('modifyBestScores() returns true if the scores were updated', async () => {
        const winner = { username: 'one', time: 15 };
        const bestScores = [{ username: 'two', time: 30 }];
        const scoresUpdated = service['modifyBestScores'](bestScores, winner);
        expect(scoresUpdated).toEqual(1);
    });

    it('modifyBestScores() should not update if the score is repeated', async () => {
        const winner = { username: 'one', time: 15 };
        const bestScores = [{ username: 'two', time: 15 }];
        const scoresUpdated = service['modifyBestScores'](bestScores, winner);
        expect(scoresUpdated).toEqual(0);
    });

    it('resetBestScores() should handle the error if failed', async () => {
        jest.spyOn(gameModel, 'updateMany').mockImplementation(() => {
            throw new Error();
        });
        try {
            await service.resetBestScores();
        } catch (err) {
            expect(err).toBeTruthy();
        }
    });

    it('getGame() return game with the specified id', async () => {
        const game = await gameModel.create(gameTest);
        expect(await service.getGame(game._id)).toEqual(expect.objectContaining(gameTest));
    });

    it('getGame() should return an empty array if the game is not found', async () => {
        expect(await service.getGame(gameTest._id)).toEqual(expect.objectContaining({}));
    });

    it('resetBestScore() should reset the best scores of a game', async () => {
        const game = await gameModel.create(gameTest);
        await service.resetBestScore(game);
        expect(game.bestDuo).toEqual(BEST_DUO);
        expect(game.bestSolo).toEqual(BEST_SOLO);
    });

    it('resetBestScore() should handle the error if failed', async () => {
        const game = await gameModel.create(gameTest);
        jest.spyOn(gameModel, 'updateOne').mockImplementation(() => {
            throw new Error();
        });
        try {
            await service.resetBestScore(game);
        } catch (err) {
            expect(err).toBeTruthy();
        }
    });

    it('deleteGame() should delete the game', async () => {
        await gameModel.deleteMany({});
        const game = await gameModel.create(gameTest);
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
        jest.spyOn(service as any, 'deleteGameImages').mockImplementation(() => {});
        await service.deleteGame(game._id);
        expect(await gameModel.countDocuments()).toEqual(0);
    });

    it('deleteAllGames() should delete all the games', async () => {
        await gameModel.deleteMany({});
        await gameModel.create(gameTest);
        await gameModel.create(gameTest);
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
        jest.spyOn(service as any, 'deleteGameImages').mockImplementation(() => {});
        await service.deleteAllGames();
        expect(await gameModel.countDocuments()).toEqual(0);
    });

    it('deleteGame() should call deleteImage', async () => {
        await gameModel.deleteMany({});
        const game = await gameModel.create(gameTest);
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
        const spy = jest.spyOn(service as any, 'deleteImage').mockImplementation(() => {});
        await service.deleteGame(game._id);
        expect(spy).toHaveBeenCalled();
    });

    it('deleteGameImages() should handle the error if failed', async () => {
        const game = await gameModel.create(gameTest);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn(service as any, 'deleteImage').mockImplementation(() => {
            throw new Error();
        });
        try {
            await service['deleteGameImages'](game);
        } catch (err) {
            expect(err).toBeTruthy();
        }
    });

    it('addGame() should create a game', async () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const spy = jest.spyOn(gameModel, 'create').mockImplementation(() => {});
        service.addGame(gameTest);
        expect(spy).toHaveBeenCalled();
    });

    it('addGame() should not create a game if query failed', async () => {
        jest.spyOn(gameModel, 'create').mockImplementation(async () => Promise.reject(''));
        try {
            await service.addGame(gameTest);
        } catch (err) {
            expect(err).toBeTruthy();
        }
    });

    it('deleteImage() should throw an error if the name is not found', async () => {
        await gameModel.deleteMany({});
        try {
            await service['deleteImage']('test');
        } catch (err) {
            expect(err).toBeTruthy();
        }
    });
});
