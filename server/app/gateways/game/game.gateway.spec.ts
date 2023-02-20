/* eslint-disable @typescript-eslint/no-empty-function */
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import { GameService } from '@app/services/game/game.service';
import { CLASSIC_SOLO } from '@common/constants';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, match, SinonStubbedInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';
import { GameEvents } from './game.gateway.events';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameService: SinonStubbedInstance<GameService>;
    let detectionDifferenceService: SinonStubbedInstance<DetectionDifferenceService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        gameService = createStubInstance<GameService>(GameService);
        detectionDifferenceService = createStubInstance<DetectionDifferenceService>(DetectionDifferenceService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                { provide: Logger, useValue: logger },
                { provide: GameService, useValue: gameService },
                { provide: DetectionDifferenceService, useValue: detectionDifferenceService },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
        gateway.afterInit();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('received message should be logged', () => {
        gateway.message(socket, 'X');
        expect(logger.log.called).toBeTruthy();
    });

    it('should initialize a game', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'initializeGame').mockImplementation(async () => {
            return new Promise(() => {});
        });
        const message = { games: ['acbd'], roomID: 'abcd1234' };
        gateway.initializiation(socket, message);
        expect(spy).toBeCalledWith(message);
    });
    it('should initialize a game', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'validateDifference').mockImplementation();
        const message = { roomID: 'roomId', gameID: 'gameID', position: { x: 15, y: 15 } };
        gateway.validateDifference(socket, message);
        expect(spy).toBeCalled();
    });

    it('askToPlay should call the roomsManager function', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'askToPlay');
        const message = { username: '123', roomBase: 'abc' };
        gateway.askToPlay(socket, message);
        expect(spy).toBeCalled();
    });

    it('requestAccepted should call the roomsManager function', () => {
        gateway['server'] = { sockets: { sockets: new Map<string, Socket>() } as unknown } as unknown as Server;
        const spy = jest.spyOn(gateway['roomsManager'], 'joinRoomClassicMulti').mockImplementation(() => {});
        const message = { opponentUsername: 'bob', opponentSocket: 'socket53', roomBase: '123' };
        gateway.requestAccepted(socket, message);
        expect(spy).toBeCalled();
    });

    it('requestDeclined should call the roomsManager functioPn', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'requestDeclined').mockImplementation(() => {});
        const opponent = '15kp';
        gateway.requestDeclined(socket, opponent);
        expect(spy).toBeCalled();
    });
    it('leaveWaiting should call the roomsManager function', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'leaveWaiting').mockImplementation(() => {});
        const gameId = '15';
        gateway.leaveWaiting(socket, gameId);
        expect(spy).toBeCalled();
    });

    it('leaveAsking should call the roomsManager function', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'leaveAsking').mockImplementation(() => {});
        const gameId = '15';
        gateway.leaveAsking(socket, gameId);
        expect(spy).toBeCalled();
    });
    it('gameDeleted should call the roomsManager function', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'updateWaitingList').mockImplementation(() => {});
        const gameId = '15';
        gateway.gameDeleted(socket, gameId);
        expect(spy).toBeCalled();
    });
    it('joinRoomSolo should call the roomsManager function', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'joinRoomSolo').mockImplementation(() => {});
        const username = 'mathieu';
        gateway.joinRoomSolo(socket, username);
        expect(spy).toBeCalled();
    });
    it('joinRoomSoloLimitedTime should call the joinTempsLimiteSolo function', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'joinLimitedTimeSolo').mockImplementation(() => {});
        const username = 'mathieu';
        gateway.joinRoomSoloLimitedTime(socket, username);
        expect(spy).toBeCalled();
    });
    it('clueCanvas should call the sendClue function', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'sendClue').mockImplementation(() => {});
        const message = { roomID: 'abcd', gameID: '1234', gameMode: CLASSIC_SOLO };
        gateway.clueCanvas(socket, message);
        expect(spy).toBeCalled();
    });

    it('chatMessageResponse should call the sendMessageChat function', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'sendMessageChat').mockImplementation(() => {});
        const message = { username: 'playerId', roomID: 'gameId', text: 'hello' };
        gateway.chatMessageResponse(socket, message);
        expect(spy).toBeCalled();
    });

    it('quitGame should call the quitGame function', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'quitGame').mockImplementation(() => {});
        const info = { roomID: 'abcd1234', username: 'mathieu', roomMode: false };
        gateway.quitGame(socket, info);
        expect(spy).toBeCalledWith(socket, info);
    });
    it('should initialize waiting status', () => {
        const spy = jest.spyOn(gateway['roomsManager'], 'isGameWaiting').mockImplementation(() => {});
        const gameID = 'abcd1234';
        gateway.initializeWaitingStatus(socket, gameID);
        expect(spy).toBeCalled();
    });

    it('hello message should be sent on connection', () => {
        gateway.handleConnection(socket);
        expect(socket.emit.calledWith(GameEvents.Hello, match.any)).toBeTruthy();
    });

    it('socket disconnection should be logged', () => {
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeFalsy();
    });
});
