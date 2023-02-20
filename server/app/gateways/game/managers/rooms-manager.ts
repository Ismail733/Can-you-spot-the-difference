import { GameEvents } from '@app/gateways/game/game.gateway.events';
import { Game } from '@app/model/schema/game.schema';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import { GameService } from '@app/services/game/game.service';
import { ChatMessage } from '@common/chat-message';
import { CLASSIC_MULTI, CLASSIC_SOLO, GAMESTATUS_INTERVAL, LIMITED_TIME_COOP, LIMITED_TIME_SOLO } from '@common/constants';
import { GameStatus } from '@common/game-status';
import { JoinRoomInterface } from '@common/join-room-interface';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { ClueManager } from './clue-manager';
import { DifferenceManager } from './difference-manager';
@Injectable()
export class RoomsManager {
    mapRooms = new Map<string, GameStatus>();
    private mapWaitingList = new Map<string, [Socket, string]>();
    private mapIntervals = new Map<string, NodeJS.Timeout>();
    private detectionDifferenceService = new DetectionDifferenceService();
    private differenceManager: DifferenceManager;
    private clueManager: ClueManager;
    private server: Server;
    constructor(private gameService: GameService, server: Server) {
        this.server = server;
        this.differenceManager = new DifferenceManager(this);
        this.clueManager = new ClueManager();
    }
    askToPlay(socketPlayer: Socket, message: { username: string; roomBase: string }) {
        if (this.mapWaitingList.has(message.roomBase)) {
            const playerWaitingSocket = this.mapWaitingList.get(message.roomBase)[0];
            if (message.roomBase === 'limited-time') {
                this.joinLimitedTimeCoop(socketPlayer, message.username, message.roomBase);
                return;
            }
            this.server
                .to(playerWaitingSocket.id)
                .emit(GameEvents.AskToPlay, { playerAsking: message.username, socketPlayerAskingId: socketPlayer.id });
        } else {
            this.server.emit(GameEvents.PlayerWaiting, message.roomBase);
            this.mapWaitingList.set(message.roomBase, [socketPlayer, message.username]);
        }
    }
    leaveWaiting(gameID: string) {
        this.mapWaitingList.delete(gameID);
        this.server.emit(GameEvents.NoPlayerWaiting, gameID);
    }
    removeFromWaiting(socketID: string) {
        for (const [gameID, socket] of this.mapWaitingList.entries()) {
            if (socket[0].id === socketID) {
                this.mapWaitingList.delete(gameID);
                this.server.emit(GameEvents.NoPlayerWaiting, gameID);
            }
        }
    }
    leaveAsking(gameID: string) {
        const playerWaitingSocket = this.mapWaitingList.get(gameID)[0];
        this.server.to(playerWaitingSocket.id).emit(GameEvents.LeaveAsking);
    }
    requestDeclined(opponentSocketID: string) {
        this.server.to(opponentSocketID).emit(GameEvents.RequestDeclined);
    }
    async initializeGame(message: { games: string[]; roomID: string }) {
        const game = this.getRoomByID(message.roomID);
        const games = new Map<string, Game>();
        const removeFromGames = [];
        for (const gameID of message.games) {
            const gameTemp = await this.gameService.getGame(gameID);
            try {
                const image1 = await fs.readFile('assets/' + gameTemp.image1 + '.bmp');
                const image2 = await fs.readFile('assets/' + gameTemp.image2 + '.bmp');
                const newGame = new Game(gameTemp.name, gameTemp.radius);
                newGame.image1 = gameTemp.image1;
                newGame.image2 = gameTemp.image2;
                this.detectionDifferenceService.recreateGameArrays(newGame, image1, image2);
                games.set(gameID, newGame);
            } catch (e) {
                removeFromGames.push(gameID);
            }
        }
        for (const gameDelete of removeFromGames) message.games.splice(message.games.indexOf(gameDelete), 1);
        if (message.games.length > 0) {
            game.gameIDList = message.games;
            game.currentGameID = message.games[0];
            this.differenceManager.setGame(games, message.roomID);
            this.mapRooms.get(message.roomID).image1 = games.get(message.games[0]).image1;
            this.mapRooms.get(message.roomID).image2 = games.get(message.games[0]).image2;
            if (this.isModeLimitedTime(this.mapRooms.get(message.roomID).mode)) {
                this.mapRooms.get(message.roomID).nbDifferences = message.games.length;
            } else {
                this.mapRooms.get(message.roomID).nbDifferences = this.differenceManager.gameMap
                    .get(message.roomID)
                    .get(message.games[0]).nbDifferences;
                this.mapRooms.get(message.roomID).name = this.differenceManager.gameMap.get(message.roomID).get(message.games[0]).name;
            }
        }
    }
    joinRoomClassicMulti(socket: Socket, username: string, gameID: string) {
        this.server.emit(GameEvents.NoPlayerWaiting, gameID);
        this.createRoomInterval({ socket, username }, gameID, CLASSIC_MULTI);
        this.mapWaitingList.delete(gameID);
    }
    joinRoomSolo(socket: Socket, username: string) {
        this.createRoomInterval({ socket, username }, CLASSIC_SOLO, CLASSIC_SOLO);
    }
    joinLimitedTimeSolo(socket: Socket, username: string) {
        this.createRoomInterval({ socket, username }, 'limited-time', LIMITED_TIME_SOLO);
    }
    joinLimitedTimeCoop(socket, username, gameID) {
        this.server.emit(GameEvents.NoPlayerWaiting, gameID);
        this.createRoomInterval({ socket, username }, gameID, LIMITED_TIME_COOP);
        this.mapWaitingList.delete(gameID);
    }

    async validateDifference(socket: Socket, message: { roomID: string; gameID: string; position: { x: number; y: number } }) {
        await this.differenceManager.manageDifference(this.mapRooms.get(message.roomID), socket, message);
    }
    sendMessageFromServer(text: string, roomID: string) {
        const message = {
            roomID,
            text,
            username: 'server',
            time: new Date(),
        };
        this.server.sockets.in(message.roomID).emit(GameEvents.ChatMessageResponse, message);
    }
    sendMessageChat(message: ChatMessage) {
        this.server.sockets.in(message.roomID).emit(GameEvents.ChatMessageResponse, message);
    }
    sendMessageGlobal(roomID: string, text: string) {
        const message = {
            username: 'server/update',
            roomID,
            text,
            time: new Date(),
        } as ChatMessage;
        this.server.emit(GameEvents.ChatMessageResponse, message);
    }
    updateWaitingList(id: string) {
        if (this.mapWaitingList.has(id)) {
            const clientSocket = this.mapWaitingList.get(id)[0];
            this.mapWaitingList.delete(id);
            this.gameIsNotAvailable(clientSocket);
        }
    }
    isGameWaiting(socket: Socket, gameID: string) {
        socket.emit(GameEvents.InitializeWaitingStatus, gameID + ':' + this.mapWaitingList.has(gameID));
    }
    sendClue(socketPlayer: Socket, message: { roomID: string; gameID: string; gameMode: string }, gameStatus: GameStatus) {
        if (this.isModeSolo(gameStatus.mode) && gameStatus.player1.clueCounter !== 0) {
            gameStatus.time += 5;
            this.sendMessageFromServer('Indice utilisé.', gameStatus.roomID);
            if (gameStatus.player1.clueCounter === 1) {
                this.clueManager.sendLastClue(socketPlayer, message, this.differenceManager.gameMap);
            }
            if (gameStatus.player1.clueCounter === 2) {
                this.clueManager.sendSecondClue(socketPlayer, message, this.differenceManager.gameMap);
            }
            if (gameStatus.player1.clueCounter === 3) {
                this.clueManager.sendFirstClue(socketPlayer, message, this.differenceManager.gameMap);
            }
            gameStatus.player1.clueCounter--;
        }
    }
    quitGame(socket: Socket, info: { roomID: string; username: string }) {
        const gameStatus = this.mapRooms.get(info.roomID);
        if (this.isModeSolo(gameStatus.mode)) {
            this.sendMessageFromServer(gameStatus.player1.username + ' a abandonné la partie.', gameStatus.roomID);
        } else {
            this.sendMessageFromServer(
                socket.id === gameStatus.player1.socketID
                    ? gameStatus.player1.username + ' a abandonné la partie.'
                    : gameStatus.player2.username + ' a abandonné la partie.',
                gameStatus.roomID,
            );
        }
        if (gameStatus.mode === LIMITED_TIME_COOP) {
            gameStatus.mode = LIMITED_TIME_SOLO;
            socket.leave(info.roomID);
            socket.emit(GameEvents.Defeat);
            return;
        } else if (gameStatus.mode === CLASSIC_MULTI) {
            this.endGameAnnoucement(
                gameStatus.player1.socketID !== socket.id ? gameStatus.player1.socketID : gameStatus.player2.socketID,
                gameStatus.player1.socketID === socket.id ? gameStatus.player1.socketID : gameStatus.player2.socketID,
            );
            this.gameOver(info.roomID);
        } else {
            this.server.to(socket.id).emit(GameEvents.Defeat);
            this.gameOver(info.roomID);
        }
    }
    sendMessageDifferenceFound(gameStatus: GameStatus, foundBy: string) {
        if (gameStatus.mode === CLASSIC_SOLO || gameStatus.mode === LIMITED_TIME_SOLO) {
            this.sendMessageFromServer('Différence trouvée.', gameStatus.roomID);
        } else {
            this.sendMessageFromServer('Différence trouvée par ' + foundBy + '.', gameStatus.roomID);
        }
    }
    sendMessageErrorFound(gameStatus: GameStatus, foundBy: string) {
        if (gameStatus.mode === CLASSIC_SOLO || gameStatus.mode === LIMITED_TIME_SOLO) {
            this.sendMessageFromServer('Erreur.', gameStatus.roomID);
        } else {
            this.sendMessageFromServer('Erreur par ' + foundBy + '.', gameStatus.roomID);
        }
    }
    private createRoomInterval(player: { socket: Socket; username: string }, gameID: string, mode: string) {
        const newRoom = uuidv4();
        const game = new GameStatus();
        if (mode === CLASSIC_MULTI || mode === LIMITED_TIME_COOP) {
            const [player1Socket, player1Username] = this.mapWaitingList.get(gameID);
            game.player1.socketID = player1Socket.id;
            game.player1.username = player1Username;
            game.player2.socketID = player.socket.id;
            game.player2.username = player.username;
            game.gameIDList = [];
            player1Socket.join(newRoom);
            player.socket.join(newRoom);
        } else {
            game.player1.socketID = player.socket.id;
            game.player1.username = player.username;
            player.socket.join(newRoom);
        }
        game.mode = mode;
        game.roomID = newRoom;
        this.mapRooms.set(newRoom, game);
        this.server.to(newRoom).emit(GameEvents.RoomID, {
            roomID: newRoom,
            mode,
        } as JoinRoomInterface);
        const roomInterval = setInterval(() => {
            game.time++;
            if (mode === CLASSIC_MULTI || mode === LIMITED_TIME_COOP) {
                const player1Socket = this.server.sockets.sockets.get(game.player1.socketID);
                if (player1Socket.rooms.has(newRoom)) player1Socket.emit(GameEvents.UpdateGame, game);
                const tempGame = { ...game, player1: game.player2, player2: game.player1 };
                if (player.socket.rooms.has(newRoom)) player.socket.emit(GameEvents.UpdateGame, tempGame);
            } else player.socket.emit(GameEvents.UpdateGame, game);
            this.checkIfGameIsOver(game);
        }, GAMESTATUS_INTERVAL);
        this.mapIntervals.set(newRoom, roomInterval);
    }
    private gameIsNotAvailable(socketPlayer: Socket) {
        this.server.to(socketPlayer.id).emit(GameEvents.GameIsNotAvailable);
    }
    private gameOver(roomID: string) {
        this.server.socketsLeave(roomID);
        this.mapRooms.delete(roomID);
        clearInterval(this.mapIntervals.get(roomID));
    }
    private async checkIfGameIsOver(game: GameStatus) {
        switch (game.mode) {
            case LIMITED_TIME_COOP:
            case LIMITED_TIME_SOLO:
                if (game.time >= game.maxTime) {
                    this.server.to(game.roomID).emit(GameEvents.Defeat);
                    this.gameOver(game.roomID);
                } else if (game.player1.differenceCounter + game.player2.differenceCounter >= game.nbDifferences) {
                    this.server.to(game.roomID).emit(GameEvents.Victory);
                    this.gameOver(game.roomID);
                }
                break;
            case CLASSIC_MULTI:
                {
                    this.checkIfMultiplayerGameIsOVer(game);
                }
                break;
            case CLASSIC_SOLO:
                if (game.player1.differenceCounter === game.nbDifferences) {
                    this.server.to(game.roomID).emit(GameEvents.Victory, game);
                    this.gameOver(game.roomID);
                    const position = await this.gameService.updateBestScore(game, game.player1.username);
                    if (position > 0) {
                        this.sendMessageUpdateScore({
                            mode: game.mode,
                            player: game.player1.username,
                            position,
                            name: game.name,
                            roomID: game.roomID,
                        });
                    }
                }
                break;
        }
    }
    private async checkIfMultiplayerGameIsOVer(game: GameStatus) {
        const numberOfDifferenceIsEven = game.nbDifferences % 2 === 0;
        const numberOfDifferencesToWin = Math.floor(game.nbDifferences / 2) + 1;
        const numberOfDifferencesToDraw = game.nbDifferences / 2;
        if (this.hasWinner(game.player1.differenceCounter, numberOfDifferencesToWin)) {
            this.endGameAnnoucement(game.player1.socketID, game.player2.socketID);
            this.server.to(game.player1.socketID).emit(GameEvents.Victory);
            const position = await this.gameService.updateBestScore(game, game.player1.username);
            if (position > 0) {
                this.sendMessageUpdateScore({ mode: game.mode, player: game.player1.username, position, name: game.name, roomID: game.roomID });
            }
            this.gameOver(game.roomID);
        }
        if (this.hasWinner(game.player2.differenceCounter, numberOfDifferencesToWin)) {
            this.endGameAnnoucement(game.player2.socketID, game.player1.socketID);
            const position = await this.gameService.updateBestScore(game, game.player2.username);
            if (position > 0) {
                this.sendMessageUpdateScore({ mode: game.mode, player: game.player2.username, position, name: game.name, roomID: game.roomID });
            }
            this.gameOver(game.roomID);
        }
        if (
            numberOfDifferenceIsEven &&
            this.hasWinner(game.player1.differenceCounter, numberOfDifferencesToDraw) &&
            this.hasWinner(game.player2.differenceCounter, numberOfDifferencesToDraw)
        ) {
            this.server.to(game.roomID).emit(GameEvents.Draw);
            this.gameOver(game.roomID);
        }
    }
    private sendMessageUpdateScore(update: { mode: string; player: string; position: number; name: string; roomID: string }) {
        let playerNumber = 1;
        if (update.mode === CLASSIC_MULTI || update.mode === LIMITED_TIME_COOP) {
            playerNumber = 2;
        }
        this.sendMessageGlobal(
            update.roomID,
            update.player +
                ' obtient la ' +
                update.position +
                ' place dans dans les meilleurs temps du jeu ' +
                update.name +
                ' en ' +
                playerNumber +
                ' joueur(s)',
        );
    }
    private hasWinner(player: number, differenceToWin: number) {
        return player === differenceToWin;
    }
    private endGameAnnoucement(winnerID: string, loserID: string) {
        this.server.to(winnerID).emit(GameEvents.Victory);
        this.server.to(loserID).emit(GameEvents.Defeat);
    }
    private isModeSolo(mode: string): boolean {
        return mode.includes('solo');
    }
    private getRoomByID(roomID: string): GameStatus {
        return this.mapRooms.get(roomID);
    }
    private isModeLimitedTime(mode: string): boolean {
        return mode === LIMITED_TIME_COOP || mode === LIMITED_TIME_SOLO;
    }
}
