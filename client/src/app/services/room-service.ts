import { EventEmitter, Injectable } from '@angular/core';
import { GameStatus } from '@common/game-status';
import { JoinRoomInterface } from '@common/join-room-interface';
import { SocketClientService } from './socket-client.service';
@Injectable({
    providedIn: 'root',
})
export class RoomService {
    roomID: string;
    mode: string;
    quadrant = new EventEmitter<[number, number][]>();
    differenceFoundEvent = new EventEmitter<{ pixels: [number, number][]; playSound: boolean }>();
    errorFoundEvent = new EventEmitter<[number, number][]>();
    defeatEvent = new EventEmitter<void>();
    victoryEvent = new EventEmitter<void>();
    drawEvent = new EventEmitter<void>();
    opponentHasAbandoned = new EventEmitter<boolean>();
    game: GameStatus;
    constructor(private socketClientService: SocketClientService) {
        this.game = new GameStatus();
        this.connectWithServer();
        this.initDifferenceSocket();
        this.initErrorSocket();
        this.initDrawSocket();
        this.initVictorySocket();
        this.initDefeatSocket();
        this.gameUpdate();
        this.pixelOfDifference();
    }
    newRoomFromServer(response: JoinRoomInterface) {
        this.roomID = response.roomID;
        this.mode = response.mode;
    }
    quitGame() {
        this.socketClientService.send('quitGame', { roomID: this.roomID, username: this.game.player1.username });
    }
    askClueFromServer() {
        this.socketClientService.send('clueCanvas', { roomID: this.roomID, gameID: this.game.currentGameID, gameMode: this.game.mode });
    }

    private connectWithServer() {
        this.socketClientService.connect();
    }

    private pixelOfDifference() {
        this.socketClientService.on('clueCanvas', (data) => {
            this.quadrant.emit(data as [number, number][]);
        });
    }

    private initDifferenceSocket() {
        this.socketClientService.on('differenceFound', (data: { pixels: [number, number][]; playSound: boolean }) => {
            this.differenceFoundEvent.emit(data);
        });
    }
    private initErrorSocket() {
        this.socketClientService.on('errorFound', (data) => {
            this.errorFoundEvent.emit(data as [number, number][]);
        });
    }
    private initVictorySocket() {
        this.socketClientService.on('victory', () => {
            this.victoryEvent.emit();
        });
    }
    private initDefeatSocket() {
        this.socketClientService.on('defeat', () => {
            this.defeatEvent.emit();
        });
    }
    private initDrawSocket() {
        this.socketClientService.on('draw', () => {
            this.drawEvent.emit();
        });
    }
    private gameUpdate() {
        this.socketClientService.on('update', (data: GameStatus) => {
            this.game = data;
        });
    }
}
