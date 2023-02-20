/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { QuadrantInterface } from '@app/interfaces/quadrant.interface';
import { Game } from '@app/model/schema/game.schema';
import { HEIGHT, WIDTH } from '@common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { ClueManager } from './clue-manager';

describe('clue manager tests', () => {
    let manager: ClueManager;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [ClueManager, { provide: Server, useValue: server }],
        }).compile();
        manager = module.get<ClueManager>(ClueManager);
    });
    it('should be defined', () => {
        expect(manager).toBeDefined();
    });
    it('getRandomIndex should return a random number', () => {
        expect(manager['getRandomIndex'](10)).toBeLessThan(11);
        expect(manager['getRandomIndex'](5)).toBeLessThan(6);
        expect(manager['getRandomIndex'](30)).toBeLessThan(31);
    });

    describe('findQuadrant should return the right quadrant', () => {
        interface TestCase {
            clue: { x: number; y: number };
            quadrant: QuadrantInterface;
            expected: QuadrantInterface;
        }

        const testCases: TestCase[] = [
            {
                clue: { x: 25, y: 25 },
                quadrant: {
                    pixelStart: { y: 0, x: 0 },
                    pixelEnd: { y: HEIGHT, x: WIDTH },
                },
                expected: {
                    pixelStart: { y: 0, x: 0 },
                    pixelEnd: { y: HEIGHT / 2, x: WIDTH / 2 },
                },
            },
            {
                clue: { x: 500, y: 25 },
                quadrant: {
                    pixelStart: { y: 0, x: 0 },
                    pixelEnd: { y: HEIGHT, x: WIDTH },
                },
                expected: {
                    pixelStart: { y: 0, x: WIDTH / 2 },
                    pixelEnd: { y: HEIGHT / 2, x: WIDTH },
                },
            },
            {
                clue: { x: 500, y: 400 },
                quadrant: {
                    pixelStart: { y: 0, x: 0 },
                    pixelEnd: { y: HEIGHT, x: WIDTH },
                },
                expected: {
                    pixelStart: { y: HEIGHT / 2, x: WIDTH / 2 },
                    pixelEnd: { y: HEIGHT, x: WIDTH },
                },
            },
        ];

        testCases.forEach((tc) => {
            it(`test for clue (${tc.clue.y},${tc.clue.x})`, () => {
                jest.spyOn(manager as any, 'createQuadrantPixels').mockImplementation(() => {});
                manager['findQuadrant'](tc.clue, tc.quadrant);
                expect(manager['currentQuadrant']).toStrictEqual(tc.expected);
                expect(manager['createQuadrantPixels']).toHaveBeenCalled();
            });
        });
    });

    describe('createQuadrantPixels should call functions', () => {
        it('should call fillClueLines', () => {
            jest.spyOn(manager as any, 'fillClueLines').mockImplementation(() => {
                return [
                    [0, 0],
                    [0, 1],
                    [0, 2],
                    [0, 3],
                    [0, 4],
                    [0, 5],
                ];
            });

            manager['createQuadrantPixels']({
                pixelStart: { y: 0, x: 0 },
                pixelEnd: { y: HEIGHT / 2, x: WIDTH / 2 },
            });
            expect(manager['fillClueLines']).toHaveBeenCalled();
        });
        it('should call expandLineRadius', () => {
            jest.spyOn(manager as any, 'expandLineRadius').mockImplementation(() => {});

            manager['createQuadrantPixels']({
                pixelStart: { y: 0, x: 0 },
                pixelEnd: { y: HEIGHT, x: WIDTH },
            });
            expect(manager['expandLineRadius']).toHaveBeenCalled();
        });
    });

    describe('sendSecondClue should call functions', () => {
        const message = { roomID: 'roomID', gameID: 'gameID' };
        const gameMap: Map<string, Map<string, Game>> = new Map();
        it('should call resetValues', () => {
            jest.spyOn(manager as any, 'makeClue').mockImplementation(() => {});

            jest.spyOn(manager as any, 'resetValues').mockImplementation(() => {});

            manager['sendSecondClue'](socket, message, gameMap);
            expect(manager['resetValues']).toHaveBeenCalledTimes(2);
        });
    });
    describe('sendLastClue should call functions', () => {
        const message = { roomID: 'roomID', gameID: 'gameID' };
        const gameMap: Map<string, Map<string, Game>> = new Map();
        it('should call resetValues', () => {
            jest.spyOn(manager as any, 'makeClue').mockImplementation(() => {});

            jest.spyOn(manager as any, 'resetValues').mockImplementation(() => {});

            manager['sendLastClue'](socket, message, gameMap);
            expect(manager['resetValues']).toHaveBeenCalledTimes(2);
        });
    });
    describe('sendFirstClue should call functions', () => {
        const message = { roomID: 'roomID', gameID: 'gameID' };
        const gameMap: Map<string, Map<string, Game>> = new Map();
        it('should call resetValues', () => {
            jest.spyOn(manager as any, 'makeClue').mockImplementation(() => {});

            jest.spyOn(manager as any, 'resetValues').mockImplementation(() => {});

            manager['sendFirstClue'](socket, message, gameMap);
            expect(manager['resetValues']).toHaveBeenCalled();
        });
    });
    describe('resetValues should reset values', () => {
        it('should reset currentQuadrant', () => {
            manager['currentQuadrant'] = {
                pixelStart: { y: 0, x: 0 },
                pixelEnd: { y: HEIGHT, x: WIDTH },
            };
            manager['resetValues']();
            expect(manager['currentQuadrant']).toStrictEqual({
                pixelStart: { y: 0, x: 0 },
                pixelEnd: { y: 0, x: 0 },
            });
        });
        it('should reset clue', () => {
            manager['clue'] = { x: 50, y: 50 };
            manager['resetValues']();
            expect(manager['clue']).toStrictEqual({ x: 0, y: 0 });
        });
        it('should reset cluePixels', () => {
            manager['cluePixels'] = [[0, 1]];
            manager['resetValues']();
            expect(manager['cluePixels']).toStrictEqual([]);
        });
    });

    describe('makeClue should call functions', () => {
        const message = { roomID: 'roomID', gameID: 'gameID' };
        const gameMap: Map<string, Map<string, Game>> = new Map();
        const gameMap2: Map<string, Game> = new Map();

        gameMap2.set(`${message.gameID}`, { differencesGrouped: [[1, 1]] } as unknown as Game);
        gameMap.set(`${message.roomID}`, gameMap2);
        it('should call getRandomIndex and findQuadrant', () => {
            jest.spyOn(manager as any, 'getRandomIndex').mockImplementation(() => {
                return 0;
            });
            jest.spyOn(manager as any, 'findQuadrant').mockImplementation(() => {});

            manager['makeClue'](message, gameMap);
            expect(manager['getRandomIndex']).toHaveBeenCalled();
            expect(manager['findQuadrant']).toHaveBeenCalled();
        });
    });
});
