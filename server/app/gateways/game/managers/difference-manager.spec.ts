/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Game } from '@app/model/schema/game.schema';
import { CLASSIC_MULTI, CLASSIC_SOLO, LIMITED_TIME_COOP, LIMITED_TIME_SOLO } from '@common/constants';
import { GameStatus } from '@common/game-status';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs/promises';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { DifferenceManager } from './difference-manager';
import { RoomsManager } from './rooms-manager';
describe('DifferenceManager', () => {
    let manager: DifferenceManager;
    let roomsManager: SinonStubbedInstance<RoomsManager>;

    beforeEach(async () => {
        roomsManager = createStubInstance(RoomsManager);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DifferenceManager,
                {
                    provide: RoomsManager,
                    useValue: roomsManager,
                },
                Game,
                { provide: Buffer, useValue: [] },
            ],
        }).compile();
        manager = module.get<DifferenceManager>(DifferenceManager);
    });
    it('should be defined', () => {
        expect(manager).toBeDefined();
    });
    it('setGame should call the roomsManager function', () => {
        const map = new Map<string, Game>();
        manager.setGame(map, '1234');
        expect(manager['gameMap'].size).toEqual(1);
    });
    it('validateDifference should emit ValidateDifference event on false pixel map', () => {
        const map = new Map<string, Game>();
        const game = new Game('mathieu', 3);
        game.pixelMap = [
            [true, true],
            [true, true],
        ];
        game.differencesGrouped = [[[1, 1]]];
        map.set('1234', game);
        manager.setGame(map, 'abcd');
        const socketPlayer = {
            broadcast: {
                to: () => {
                    return { emit: () => {} };
                },
            },
            emit: () => {},
        };
        const result = manager['validateDifference'](socketPlayer as any, { roomID: 'abcd', gameID: '1234', position: { x: 1, y: 1 } });
        expect(result).toBe(true);
    });
    it('validateDifference should emit ValidateDifference event on false pixel map', () => {
        const map = new Map<string, Game>();
        const game = new Game('mathieu', 3);
        game.pixelMap = [
            [true, true],
            [true, false],
        ];
        game.differencesGrouped = [[[1, 1]]];
        map.set('1234', game);
        manager.setGame(map, 'abcd');
        const socketPlayer = {
            broadcast: {
                to: () => {
                    return { emit: () => {} };
                },
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            emit: () => {},
        };
        const result = manager['validateDifference'](socketPlayer as any, { roomID: 'abcd', gameID: '1234', position: { x: 1, y: 1 } });
        expect(result).toBe(false);
    });

    it('should find difference of empty array', () => {
        const map = new Map<string, Game>();
        const game = new Game('1234', 2);
        game.differencesGrouped = [];
        map.set('1234', game);
        manager.gameMap.set('asdf', map);
        const result = manager['findPixelsOfDifference']('asdf', '1234', { y: 1, x: 1 });
        expect(result).toEqual([]);
    });

    describe('isModeLimitedTime should return the right boolean', () => {
        interface TestCase {
            mode: string;
            expected: boolean;
        }

        const testCases: TestCase[] = [
            {
                mode: LIMITED_TIME_COOP,
                expected: true,
            },
            {
                mode: LIMITED_TIME_SOLO,
                expected: true,
            },
            {
                mode: CLASSIC_SOLO,
                expected: false,
            },
            {
                mode: CLASSIC_MULTI,
                expected: false,
            },
            {
                mode: 'LIMITED_TIME_SOLO',
                expected: false,
            },
        ];

        testCases.forEach((tc) => {
            it(`test for mode (${tc.mode})`, () => {
                expect(manager['isModeLimitedTime'](tc.mode)).toBe(tc.expected);
            });
        });
    });

    describe('isModeLimitedTime should return the right boolean', () => {
        interface TestCase {
            socketID: string;
        }
        const map = new Map<string, Game>();
        const game = new Game('gameID', 2);
        const gameStatus = new GameStatus();

        beforeEach(async () => {
            game.differencesGrouped = [];
            game.pixelMap = [
                [true, true],
                [true, false],
            ];
            game.image1 = 'image1';
            game.image2 = 'image2';
            map.set('gameID', game);
            map.set('gameID1', game);
            manager.gameMap.set('roomID', map);
            gameStatus.mode = LIMITED_TIME_COOP;
            gameStatus.currentGameID = 'gameID';
            gameStatus.gameIDList.push('gameID');
            gameStatus.gameIDList.push('gameID');
            gameStatus.gameIDList.push('gameID');
            gameStatus.player1.socketID = 'socketID';
            gameStatus.player2.differenceCounter = 5;
            gameStatus.nbDifferences = 10;
        });

        const testCases: TestCase[] = [
            {
                socketID: 'socketID',
            },
            {
                socketID: 'socketWrongID',
            },
        ];

        testCases.forEach((tc) => {
            it('manageDifference should send error', async () => {
                const socketPlayer = {
                    broadcast: {
                        to: () => {
                            return { emit: () => {} };
                        },
                    },
                    emit: () => {},
                    id: tc.socketID,
                };
                jest.spyOn(manager as any, 'validateDifference').mockImplementation(() => {
                    return false;
                });
                jest.spyOn(manager['roomsManager'], 'sendMessageErrorFound').mockImplementation(() => {});

                manager['manageDifference'](gameStatus, socketPlayer as any, { roomID: 'roomID', gameID: 'gameID', position: { x: 0, y: 0 } });
                expect(manager['validateDifference']).toHaveBeenCalled();
                expect(manager['roomsManager'].sendMessageErrorFound).toHaveBeenCalled();
            });
            it('manageDifference should send difference', async () => {
                const socketPlayer = {
                    broadcast: {
                        to: () => {
                            return { emit: () => {} };
                        },
                    },
                    emit: () => {},
                    id: tc.socketID,
                };
                jest.spyOn(fs, 'readFile').mockResolvedValue('y');
                const spyValidateDifference = jest.spyOn(manager as any, 'validateDifference').mockImplementation(() => {
                    return true;
                });
                const spyRoomsManager = jest.spyOn(manager['roomsManager'], 'sendMessageDifferenceFound').mockImplementation(() => {});
                manager['manageDifference'](gameStatus, socketPlayer as any, { roomID: 'roomID', gameID: 'gameID', position: { x: 0, y: 0 } });
                expect(spyValidateDifference).toHaveBeenCalled();
                expect(spyRoomsManager).not.toHaveBeenCalled();
            });
            it('manageDifference should throw error', async () => {
                const socketPlayer = {
                    broadcast: {
                        to: () => {
                            return { emit: () => {} };
                        },
                    },
                    emit: () => {},
                    id: 'socketID',
                };
                jest.spyOn(fs, 'readFile').mockImplementation(() => {
                    throw new Error('Something went wrong');
                });
                jest.spyOn(manager as any, 'validateDifference').mockImplementation(() => {
                    return true;
                });

                manager['manageDifference'](gameStatus, socketPlayer as any, { roomID: 'roomID', gameID: 'gameID', position: { x: 0, y: 0 } });
                expect(gameStatus.player2.differenceCounter).toEqual(9);
            });
        });
    });
});
