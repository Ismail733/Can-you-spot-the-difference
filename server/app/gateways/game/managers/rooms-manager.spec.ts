/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Game } from '@app/model/schema/game.schema';
import { GameService } from '@app/services/game/game.service';
import { CLASSIC_MULTI, CLASSIC_SOLO, GAMESTATUS_INTERVAL, LIMITED_TIME_COOP } from '@common/constants';
import { GameStatus } from '@common/game-status';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs/promises';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { RoomsManager } from './rooms-manager';

describe('Room manager tests', () => {
    let manager: RoomsManager;
    let socket: SinonStubbedInstance<Socket>;
    let socket2: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        socket2 = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        gameService = createStubInstance(GameService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomsManager,
                {
                    provide: GameService,
                    useValue: gameService,
                },
                { provide: Server, useValue: server },
            ],
        }).compile();
        manager = module.get<RoomsManager>(RoomsManager);
    });
    it('should be defined', () => {
        expect(manager).toBeDefined();
    });
    it('should initialize a game in mode classic-multi', async () => {
        const game = new GameStatus();
        game.mode = CLASSIC_MULTI;
        manager.mapRooms.set('abcd', game);
        jest.spyOn(manager['gameService'], 'getGame').mockImplementation(async () => {
            return Promise.resolve(new Game('test', 3));
        });
        jest.spyOn(fs, 'readFile').mockImplementation();
        jest.spyOn(manager['detectionDifferenceService'], 'recreateGameArrays').mockImplementation(() => {});
        await manager.initializeGame({ games: ['1234', '5678'], roomID: 'abcd' });
        expect(manager['differenceManager'].gameMap.size).toBe(1);
    });
    it('should initialize a game in mode limited-time-coop', async () => {
        const game = new GameStatus();
        game.mode = LIMITED_TIME_COOP;
        manager.mapRooms.set('abcd', game);
        jest.spyOn(manager['gameService'], 'getGame').mockImplementation(async () => {
            return Promise.resolve(new Game('test', 3));
        });
        jest.spyOn(fs, 'readFile').mockImplementation();
        jest.spyOn(manager['detectionDifferenceService'], 'recreateGameArrays').mockImplementation(() => {});
        await manager.initializeGame({ games: ['1234', '5678'], roomID: 'abcd' });
        expect(manager['differenceManager'].gameMap.size).toBe(1);
    });
    it('should initialize a game in mode classic-multi', async () => {
        const game = new GameStatus();
        game.mode = CLASSIC_MULTI;
        manager.mapRooms.set('abcd', game);
        jest.spyOn(manager['gameService'], 'getGame').mockImplementation(async () => {
            return Promise.resolve(new Game('test', 3));
        });
        jest.spyOn(fs, 'readFile').mockImplementation(() => {
            throw new Error('TEST');
        });

        jest.spyOn(manager['detectionDifferenceService'], 'recreateGameArrays').mockImplementation(() => {});
        await manager.initializeGame({ games: ['1234', '5678'], roomID: 'abcd' });
        expect(manager['differenceManager'].gameMap.size).toBe(0);
    });
    it('should createRoomInterval a game in mode classic-multi', async () => {
        socket = { id: 1111, join: () => {}, leave: () => {}, rooms: { has: jest.fn().mockReturnValue(true) }, emit: () => {} } as any;
        manager['mapWaitingList'].set('1234', [socket, 'mathieu']);
        jest.useFakeTimers();
        const socketMap = new Map<string, Socket>();
        socketMap.set(socket.id, socket);
        manager['server'] = {
            to: () => {
                return {
                    emit: () => {},
                };
            },
            sockets: {
                in: jest.fn().mockReturnValue({
                    emit: jest.fn(),
                }),
                sockets: socketMap,
            },
        } as unknown as Server;
        socket.join('1234');
        manager['createRoomInterval']({ socket, username: 'mathieu' }, '1234', CLASSIC_MULTI);
        jest.advanceTimersByTime(GAMESTATUS_INTERVAL);
        expect(manager['mapRooms'].size).toBe(1);
        expect(manager['mapIntervals'].size).toBe(1);
        clearInterval(manager['mapIntervals'].get('1234'));
    });
    it('should createRoomInterval a game in mode classic-solo', async () => {
        socket = { id: 1111, join: () => {}, leave: () => {}, rooms: { has: jest.fn().mockReturnValue(true) }, emit: () => {} } as any;
        manager['mapWaitingList'].set('1234', [socket, 'mathieu']);
        jest.useFakeTimers();
        const socketMap = new Map<string, Socket>();
        socketMap.set(socket.id, socket);
        manager['server'] = {
            to: () => {
                return {
                    emit: () => {},
                };
            },
            sockets: {
                in: jest.fn().mockReturnValue({
                    emit: jest.fn(),
                }),
                sockets: socketMap,
            },
        } as unknown as Server;
        socket.join('1234');
        manager['createRoomInterval']({ socket, username: 'mathieu' }, '1234', CLASSIC_SOLO);
        jest.advanceTimersByTime(GAMESTATUS_INTERVAL);
        expect(manager['mapRooms'].size).toBe(1);
        expect(manager['mapIntervals'].size).toBe(1);
        clearInterval(manager['mapIntervals'].get('1234'));
    });
    it('should createRoomInterval a game in mode classic-solo', async () => {
        manager['mapWaitingList'].set('1234', [socket, 'mathieu']);
        jest.useFakeTimers();
        jest.spyOn(global, 'setInterval');
        jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        manager['createRoomInterval']({ socket, username: 'mathieu' }, '1234', CLASSIC_SOLO);
        expect(manager['mapRooms'].size).toBe(1);
        expect(manager['mapIntervals'].size).toBe(1);
        clearInterval(manager['mapIntervals'].get('1234'));
    });
    it('should validate difference on player 1 in classic-multi', async () => {
        const game = new GameStatus();
        game.mode = CLASSIC_MULTI;
        game.player1.socketID = socket.id;
        socket.join('1234');
        manager['mapRooms'].set('1234', game);
        const spy = jest.spyOn(manager['differenceManager'], 'manageDifference').mockImplementation();
        manager.validateDifference(socket, { roomID: '1234', gameID: 'abcd', position: { x: 1, y: 2 } });
        expect(spy).toHaveBeenCalled();
    });

    it('should check if game is over in mode limited-time-coop', async () => {
        const game = new GameStatus();
        game.mode = LIMITED_TIME_COOP;
        game.time = 35;
        game.roomID = '1234';
        socket.join('1234');
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        manager['checkIfGameIsOver'](game);
        expect(spy).toHaveBeenCalled();
    });
    it('should check if game is over in mode limited-time-coop', async () => {
        const game = new GameStatus();
        game.mode = LIMITED_TIME_COOP;
        game.time = 29;
        game.nbDifferences = 5;
        game.player1.differenceCounter = 5;
        game.roomID = '1234';
        socket.join('1234');
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        manager['checkIfGameIsOver'](game);
        expect(spy).toHaveBeenCalled();
    });
    it('should check if game is over in mode classic-multi', async () => {
        const game = new GameStatus();
        game.mode = CLASSIC_MULTI;
        game.nbDifferences = 5;
        game.player1.differenceCounter = 3;
        game.roomID = '1234';
        socket.join('1234');
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        jest.spyOn(manager['gameService'], 'updateBestScore').mockImplementation(async () => {
            return Promise.resolve(1);
        });
        manager['checkIfGameIsOver'](game);
        expect(spy).toHaveBeenCalled();
    });
    it('should check if game is over in mode classic-multi', async () => {
        const game = new GameStatus();
        game.mode = CLASSIC_MULTI;
        game.nbDifferences = 5;
        game.player2.differenceCounter = 3;
        game.roomID = '1234';
        socket.join('1234');
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        jest.spyOn(manager['gameService'], 'updateBestScore').mockImplementation(async () => {
            return Promise.resolve(1);
        });
        manager['checkIfGameIsOver'](game);
        expect(spy).toHaveBeenCalled();
    });
    it('should check if game is over in mode classic-multi', async () => {
        const game = new GameStatus();
        game.mode = CLASSIC_MULTI;
        game.nbDifferences = 4;
        game.player1.differenceCounter = 2;
        game.player2.differenceCounter = 2;
        game.roomID = '1234';
        socket.join('1234');
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        manager['checkIfGameIsOver'](game);
        expect(spy).toHaveBeenCalled();
    });
    it('should check if game is over in mode classic-solo', async () => {
        const game = new GameStatus();
        game.mode = CLASSIC_SOLO;
        game.nbDifferences = 4;
        game.player1.differenceCounter = 4;
        game.roomID = '1234';
        socket.join('1234');
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        jest.spyOn(manager['gameService'], 'updateBestScore').mockImplementation(() => {
            return 1 as any;
        });
        jest.spyOn(manager as any, 'sendMessageUpdateScore').mockImplementation();
        manager['checkIfGameIsOver'](game);
        expect(spy).toHaveBeenCalled();
    });
    it('should call', async () => {
        const update = { mode: LIMITED_TIME_COOP, player: 'string', position: 1, name: 'string', roomID: 'string' };

        jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });

        const spy = jest.spyOn(manager as any, 'sendMessageGlobal').mockImplementation();
        manager['sendMessageUpdateScore'](update);
        expect(spy).toHaveBeenCalled();
    });
    it('should quit game in classic-multi', async () => {
        const game = new GameStatus();
        game.mode = CLASSIC_MULTI;
        manager.mapRooms.set('abcd', game);
        socket = { id: 1234 } as any;
        socket2 = { id: 5678 } as any;
        game.player1.socketID = socket.id;
        game.player2.socketID = socket2.id;
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        jest.spyOn(manager as any, 'sendMessageFromServer').mockImplementation();
        manager.quitGame(socket, { roomID: 'abcd', username: 'mathieu' });
        expect(spy).toHaveBeenCalledWith(socket.id);
    });
    it('should quit game in classic-multi with player 2', async () => {
        const game = new GameStatus();
        game.mode = CLASSIC_MULTI;
        manager.mapRooms.set('abcd', game);
        socket = { id: 1234 } as any;
        socket2 = { id: 5678 } as any;
        game.player1.socketID = socket.id;
        game.player2.socketID = socket2.id;
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        jest.spyOn(manager as any, 'sendMessageFromServer').mockImplementation();
        manager.quitGame(socket2, { roomID: 'abcd', username: 'mathieu' });
        expect(spy).toHaveBeenCalledWith(socket.id);
    });
    it('should quit game in limited-time', async () => {
        const game = new GameStatus();
        game.mode = LIMITED_TIME_COOP;
        manager.mapRooms.set('abcd', game);
        const spy = jest.spyOn(manager as any, 'sendMessageFromServer').mockImplementation();
        jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        socket = { id: 1234, leave: () => {}, emit: () => {} } as any;
        socket2 = { id: 5678, leave: () => {}, emit: () => {} } as any;
        game.player1.socketID = socket.id;
        game.player2.socketID = socket2.id;
        manager.quitGame(socket, { roomID: 'abcd', username: 'mathieu' });
        expect(spy).toHaveBeenCalled();
    });
    it('should quit game in limited-time with player 2', async () => {
        const game = new GameStatus();
        game.mode = LIMITED_TIME_COOP;
        manager.mapRooms.set('abcd', game);
        jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        socket = { id: 1234, leave: () => {}, emit: () => {} } as any;
        socket2 = { id: 5678, leave: () => {}, emit: () => {} } as any;
        game.player1.socketID = socket.id;
        game.player2.socketID = socket2.id;
        const spy = jest.spyOn(manager as any, 'sendMessageFromServer').mockImplementation();
        manager.quitGame(socket2, { roomID: 'abcd', username: 'mathieu' });
        expect(spy).toHaveBeenCalled();
    });
    it('should quit game in classic-solo', async () => {
        const game = new GameStatus();
        game.mode = CLASSIC_SOLO;
        manager.mapRooms.set('abcd', game);
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        jest.spyOn(manager as any, 'sendMessageFromServer').mockImplementation();
        manager.quitGame(socket, { roomID: 'abcd', username: 'mathieu' });
        expect(spy).toHaveBeenCalledWith(socket.id);
    });

    it('should manage when player join room multi', async () => {
        jest.spyOn(manager['mapWaitingList'], 'delete');
        jest.spyOn(manager['server'], 'emit');
        const spy = jest.spyOn(manager as any, 'createRoomInterval').mockImplementation();
        manager.joinRoomClassicMulti(socket, 'opponent', '123');
        expect(spy).toHaveBeenCalled();
    });

    it('should return true if mode is solo', async () => {
        expect(manager['isModeSolo']('solo')).toBeTruthy();
    });

    it('should manage when game is not available', async () => {
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        manager['gameIsNotAvailable'](socket);
        expect(spy).toHaveBeenCalled();
    });

    it('should send message when difference found in solo mode', async () => {
        const game = new GameStatus();
        game.mode = 'classic-solo';
        const spy = jest.spyOn(manager, 'sendMessageFromServer').mockImplementation();
        manager['sendMessageDifferenceFound'](game, 'dodo');
        expect(spy).toHaveBeenCalled();
    });

    it('should send message when difference found in multi mode', async () => {
        const game = new GameStatus();
        game.mode = 'classic-multi';
        const spy = jest.spyOn(manager, 'sendMessageFromServer').mockImplementation();
        manager['sendMessageDifferenceFound'](game, 'dodo');
        expect(spy).toHaveBeenCalled();
    });

    it('should send message when error found in solo mode', async () => {
        const game = new GameStatus();
        game.mode = 'classic-solo';
        const spy = jest.spyOn(manager, 'sendMessageFromServer').mockImplementation();
        manager['sendMessageErrorFound'](game, 'dodo');
        expect(spy).toHaveBeenCalled();
    });

    it('should send message when error found in multi mode', async () => {
        const game = new GameStatus();
        game.mode = 'classic-multi';
        const spy = jest.spyOn(manager, 'sendMessageFromServer').mockImplementation();
        manager['sendMessageErrorFound'](game, 'dodo');
        expect(spy).toHaveBeenCalled();
    });

    it('should send first clue', async () => {
        const game = new GameStatus();
        game.mode = 'classic-solo';
        game.player1.clueCounter = 3;
        jest.spyOn(manager as any, 'isModeSolo').mockReturnValue(true);
        jest.spyOn(manager as any, 'sendMessageFromServer').mockImplementation();
        const spy = jest.spyOn(manager['clueManager'], 'sendFirstClue').mockImplementation();
        manager.sendClue(socket, { roomID: '123', gameID: '456', gameMode: 'solo' }, game);
        expect(spy).toHaveBeenCalled();
    });

    it('should send second clue', async () => {
        const game = new GameStatus();
        game.mode = 'classic-solo';
        game.player1.clueCounter = 2;
        jest.spyOn(manager as any, 'isModeSolo').mockReturnValue(true);
        jest.spyOn(manager as any, 'sendMessageFromServer').mockImplementation();
        const spy = jest.spyOn(manager['clueManager'], 'sendSecondClue').mockImplementation();
        manager.sendClue(socket, { roomID: '123', gameID: '456', gameMode: 'solo' }, game);
        expect(spy).toHaveBeenCalled();
    });

    it('should send last clue', async () => {
        const game = new GameStatus();
        game.mode = 'classic-solo';
        game.player1.clueCounter = 1;
        jest.spyOn(manager as any, 'isModeSolo').mockReturnValue(true);
        jest.spyOn(manager as any, 'sendMessageFromServer').mockImplementation();
        const spy = jest.spyOn(manager['clueManager'], 'sendLastClue').mockImplementation();
        manager.sendClue(socket, { roomID: '123', gameID: '456', gameMode: 'solo' }, game);
        expect(spy).toHaveBeenCalled();
    });

    it('should initialize waiting status', async () => {
        const spy = jest.spyOn(socket, 'emit').mockImplementation();
        manager.isGameWaiting(socket, '123');
        expect(spy).toHaveBeenCalled();
    });

    it('should update waiting list', async () => {
        manager['mapWaitingList'].set('123', [socket, 'mathieu']);
        jest.spyOn(manager['mapWaitingList'], 'has').mockReturnValue(true);
        const spy = jest.spyOn(manager as any, 'gameIsNotAvailable').mockImplementation();
        manager.updateWaitingList('123');
        expect(spy).toHaveBeenCalled();
    });

    it('should send a message from server', async () => {
        const game = new GameStatus();
        game.mode = 'classic-multi';
        game.nbDifferences = 4;
        game.player1.differenceCounter = 1;
        game.player2.differenceCounter = 2;
        game.roomID = '123';
        socket.join('123');
        manager['server'] = {
            sockets: {
                in: jest.fn().mockReturnValue({
                    emit: jest.fn(),
                }),
            },
        } as unknown as Server;
        const spy = jest.spyOn(manager['server'].sockets.in('test'), 'emit');
        manager.sendMessageFromServer('message', '123');
        expect(spy).toHaveBeenCalled();
    });

    it('should send a message to chat', async () => {
        const game = new GameStatus();
        game.mode = 'classic-multi';
        game.nbDifferences = 4;
        game.player1.differenceCounter = 1;
        game.player2.differenceCounter = 2;
        game.roomID = '123';
        socket.join('123');

        manager['server'] = {
            sockets: {
                in: jest.fn().mockReturnValue({
                    emit: jest.fn(),
                }),
            },
        } as unknown as Server;
        const spy = jest.spyOn(manager['server'].sockets.in('test'), 'emit');
        manager.sendMessageChat({
            username: 'dodo',
            text: 'message',
            roomID: '123',
            time: new Date(),
        });
        expect(spy).toHaveBeenCalled();
    });

    it('should send a global message', async () => {
        const spy = jest.spyOn(manager['server'], 'emit').mockImplementation();
        manager.sendMessageGlobal('123', 'message');
        expect(spy).toHaveBeenCalled();
    });

    it('should join room solo', async () => {
        const spy = jest.spyOn(manager as any, 'createRoomInterval').mockImplementation();
        manager.joinRoomSolo(socket, 'player');
        expect(spy).toHaveBeenCalled();
    });

    it('should join room solo temps limite', async () => {
        const spy = jest.spyOn(manager as any, 'createRoomInterval').mockImplementation();
        manager.joinLimitedTimeSolo(socket, 'player');
        expect(spy).toHaveBeenCalled();
    });

    it('should join room coop temps limite', async () => {
        const spy = jest.spyOn(manager as any, 'createRoomInterval').mockImplementation();
        manager.joinLimitedTimeCoop(socket, 'opponent', 'limited-time');
        expect(spy).toHaveBeenCalled();
    });

    it('should decline request', async () => {
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        manager.requestDeclined(socket.id);
        expect(spy).toHaveBeenCalled();
    });

    it('should leave asking', async () => {
        manager['mapWaitingList'].set('123', [socket, 'mathieu']);
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        manager.leaveAsking('123');
        expect(spy).toHaveBeenCalled();
    });

    it('should leave waiting', async () => {
        jest.spyOn(manager['mapWaitingList'], 'delete').mockImplementation();
        const spy = jest.spyOn(manager['server'], 'emit').mockImplementation();
        manager.leaveWaiting('123');
        expect(spy).toHaveBeenCalled();
    });

    it('should remove from waiting', async () => {
        manager['mapWaitingList'].set('123', [socket, 'mathieu']);
        const spy = jest.spyOn(manager['server'], 'emit').mockImplementation();
        manager.removeFromWaiting(socket.id);
        expect(spy).toHaveBeenCalled();
    });

    it('should go to game coop temps-limite', async () => {
        manager['mapWaitingList'].set('limited-time', [socket, 'mathieu']);
        jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        const spy = jest.spyOn(manager, 'joinLimitedTimeCoop').mockImplementation();
        manager.askToPlay(socket, { username: 'dodo', roomBase: 'limited-time' });
        expect(spy).toHaveBeenCalled();
    });

    it('should ask the player in waiting mode to play', async () => {
        manager['mapWaitingList'].set('123', [socket, 'mathieu']);
        jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        const spy = jest.spyOn(manager['server'], 'to').mockImplementation(() => {
            return { emit: () => {} } as any;
        });
        manager.askToPlay(socket, { username: 'dodo', roomBase: '123' });
        expect(spy).toHaveBeenCalled();
    });
});
