import { Game } from '@app/model/database/game';
import { UpdateGameDto } from '@app/model/dto/game/update-game';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import { GameService } from '@app/services/game/game.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameController } from './game.controller';

describe.only('GameController', () => {
    let controller: GameController;
    let gameService: SinonStubbedInstance<GameService>;
    let detectionDifferenceService: SinonStubbedInstance<DetectionDifferenceService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        detectionDifferenceService = createStubInstance(DetectionDifferenceService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: gameService,
                },
                {
                    provide: DetectionDifferenceService,
                    useValue: detectionDifferenceService,
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allGames() should return all games', async () => {
        const gamesExample = [new Game(), new Game()];
        gameService.getAllGames.resolves(gamesExample);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (games) => {
            expect(games).toEqual(gamesExample);
            return res;
        };

        await controller.allGames(res);
    });

    it('allGames() should return NOT_FOUND when unable to get the games', async () => {
        gameService.getAllGames.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.allGames(res);
    });

    it('createGame() should succeed if service able to add the game', async () => {
        gameService.addGame.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        await controller.createGame({ image1: ['abc'], image2: ['def'] }, 2, 'game1', res);
    });

    it('createGame() should return NOT_FOUND when unable to create the game', async () => {
        gameService.addGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.createGame({ image1: ['abc'], image2: ['def'] }, 2, 'game1', res);
    });

    it('getGame() should return the game with the chosen id', async () => {
        const testGame = new Game();
        gameService.getGame.resolves(testGame);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (games) => {
            expect(games).toEqual(testGame);
            return res;
        };

        await controller.getGame('id', res);
    });

    it('getGame() should return NOT_FOUND when service cannot get the game', async () => {
        gameService.getGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.getGame('id', res);
    });

    it('validateGame() should succeed when a game is sent for validation', async () => {
        await controller.validateGame({ image1: ['abc'], image2: ['def'] }, 3, 'test');
    });

    it('deleteGame() should succeed if service able to delete the game', async () => {
        gameService.deleteGame.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;

        await controller.deleteGame('', res);
    });

    it('deleteAllGames() should return NOT_FOUND when service cannot delete the games', async () => {
        gameService.deleteAllGames.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.deleteAllGames(res);
    });

    it('deleteAllGames() should succeed if service able to delete the games', async () => {
        gameService.deleteAllGames.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;

        await controller.deleteAllGames(res);
    });

    it('deleteGame() should return NOT_FOUND when service cannot delete the game', async () => {
        gameService.deleteGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.deleteGame('', res);
    });

    it('resetBestScore() should succeed if service able to reset the best scores of a game', async () => {
        const game = new UpdateGameDto();
        gameService.resetBestScore.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.resetBestScore(game, res);
    });

    it('resetBestScore() should return NOT_FOUND when service cannot reset the best scores of the game', async () => {
        const game = new UpdateGameDto();
        gameService.resetBestScore.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.resetBestScore(game, res);
    });

    it('resetBestScores() should succeed if service able to reset the best scores', async () => {
        gameService.resetBestScores.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.resetBestScores([], res);
    });

    it('resetBestScores() should return NOT_FOUND when service cannot reset the best scores', async () => {
        gameService.resetBestScores.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.resetBestScores([], res);
    });
});
