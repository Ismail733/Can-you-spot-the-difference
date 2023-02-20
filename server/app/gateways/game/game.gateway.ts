import { GameService } from '@app/services/game/game.service';
import { ChatMessage } from '@common/chat-message';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEvents } from './game.gateway.events';
import { RoomsManager } from './managers/rooms-manager';
@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;
    private roomsManager: RoomsManager;
    constructor(private readonly logger: Logger, private gameService: GameService) {
        this.gameService = gameService;
    }

    @SubscribeMessage(GameEvents.Message)
    message(_: Socket, message: string) {
        this.logger.log(`Message reçu : ${message}`);
    }

    @SubscribeMessage(GameEvents.Initialization)
    initializiation(socket: Socket, message: { games: string[]; roomID: string }) {
        this.roomsManager.initializeGame(message);
    }

    @SubscribeMessage(GameEvents.ValidateDifference)
    validateDifference(socket: Socket, message: { roomID: string; gameID: string; position: { x: number; y: number } }) {
        this.roomsManager.validateDifference(socket, message);
    }

    @SubscribeMessage(GameEvents.AskToPlay)
    askToPlay(socket: Socket, message: { username: string; roomBase: string }) {
        this.roomsManager.askToPlay(socket, message);
    }

    @SubscribeMessage(GameEvents.RequestAccepted)
    requestAccepted(socket: Socket, message: { opponentUsername: string; opponentSocket: string; roomBase: string }) {
        const opponentSocket = this.server.sockets.sockets.get(message.opponentSocket);
        this.roomsManager.joinRoomClassicMulti(opponentSocket, message.opponentUsername, message.roomBase);
    }

    @SubscribeMessage(GameEvents.RequestDeclined)
    requestDeclined(socket: Socket, opponentSocket: string) {
        this.roomsManager.requestDeclined(opponentSocket);
    }

    @SubscribeMessage(GameEvents.LeaveWaiting)
    leaveWaiting(socket: Socket, gameID: string) {
        this.roomsManager.leaveWaiting(gameID);
    }

    @SubscribeMessage(GameEvents.LeaveAsking)
    leaveAsking(socket: Socket, gameID: string) {
        this.roomsManager.leaveAsking(gameID);
    }

    @SubscribeMessage(GameEvents.GameDeleted)
    gameDeleted(socket: Socket, id: string) {
        this.roomsManager.updateWaitingList(id);
    }

    @SubscribeMessage(GameEvents.JoinRoomSolo)
    joinRoomSolo(socket: Socket, username: string) {
        this.roomsManager.joinRoomSolo(socket, username);
    }

    @SubscribeMessage(GameEvents.JoinRoomSoloLimitedTime)
    joinRoomSoloLimitedTime(socket: Socket, username: string) {
        this.roomsManager.joinLimitedTimeSolo(socket, username);
    }

    @SubscribeMessage(GameEvents.ClueCanvas)
    clueCanvas(socket: Socket, message: { roomID: string; gameID: string; gameMode: string }) {
        const gameStatus = this.roomsManager.mapRooms.get(message.roomID);
        this.roomsManager.sendClue(socket, message, gameStatus);
    }

    @SubscribeMessage(GameEvents.ChatMessage)
    chatMessageResponse(socket: Socket, message: { username: string; roomID: string; text: string }) {
        const messageResponse = { ...message, time: new Date() } as ChatMessage;
        this.roomsManager.sendMessageChat(messageResponse);
    }

    @SubscribeMessage(GameEvents.QuitGame)
    quitGame(socket: Socket, info: { roomID: string; username: string }) {
        this.roomsManager.quitGame(socket, info);
    }

    @SubscribeMessage(GameEvents.InitializeWaitingStatus)
    initializeWaitingStatus(socket: Socket, gameID: string) {
        this.roomsManager.isGameWaiting(socket, gameID);
    }

    afterInit() {
        this.logger.log('Socket initialized');
        this.roomsManager = new RoomsManager(this.gameService, this.server);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        socket.emit(GameEvents.Hello, 'Hello World!');
    }

    handleDisconnect(socket: Socket) {
        this.roomsManager.removeFromWaiting(socket.id);
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
    }
}
