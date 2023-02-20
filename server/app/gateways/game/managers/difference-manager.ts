import { GameEvents } from '@app/gateways/game/game.gateway.events';
import { Game } from '@app/model/schema/game.schema';
import { ARRAY_ERROR, LIMITED_TIME_COOP, LIMITED_TIME_SOLO, MAX_TIME } from '@common/constants';
import { GameStatus } from '@common/game-status';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { Socket } from 'socket.io';
import { RoomsManager } from './rooms-manager';

@Injectable()
export class DifferenceManager {
    gameMap = new Map<string, Map<string, Game>>();
    constructor(private roomsManager: RoomsManager) {}
    setGame(games: Map<string, Game>, roomID: string) {
        this.gameMap.set(roomID, games);
    }
    async manageDifference(gameStatus: GameStatus, socket: Socket, message: { roomID: string; gameID: string; position: { x: number; y: number } }) {
        const foundDifference = this.validateDifference(socket, message);
        if (foundDifference) {
            if (this.isModeLimitedTime(gameStatus.mode)) {
                try {
                    const nextGame = gameStatus.gameIDList[1];
                    await fs.readFile('assets/' + this.gameMap.get(message.roomID).get(nextGame).image1 + '.bmp');
                } catch (err) {
                    gameStatus.player2.differenceCounter = gameStatus.nbDifferences - 1;
                }
                if (gameStatus.gameIDList.length > 1) {
                    gameStatus.gameIDList.shift();
                    gameStatus.currentGameID = gameStatus.gameIDList[0];
                    gameStatus.image1 = this.gameMap.get(message.roomID).get(gameStatus.currentGameID).image1;
                    gameStatus.image2 = this.gameMap.get(message.roomID).get(gameStatus.currentGameID).image2;
                    if (gameStatus.time < MAX_TIME) {
                        gameStatus.time -= 5;
                    }
                }
            }
            if (gameStatus.player1.socketID === socket.id) {
                this.roomsManager.sendMessageDifferenceFound(gameStatus, gameStatus.player1.username);
                gameStatus.player1.differenceCounter++;
            } else {
                gameStatus.player2.differenceCounter++;
                this.roomsManager.sendMessageDifferenceFound(gameStatus, gameStatus.player2.username);
            }
        } else {
            if (gameStatus.player1.socketID === socket.id) {
                this.roomsManager.sendMessageErrorFound(gameStatus, gameStatus.player1.username);
            } else {
                this.roomsManager.sendMessageErrorFound(gameStatus, gameStatus.player2.username);
            }
        }
    }
    private validateDifference(socketPlayer: Socket, message: { roomID: string; gameID: string; position: { x: number; y: number } }): boolean {
        const pixelY = message.position.y;
        const pixelX = message.position.x;
        if (this.checkDifferences(message.roomID, message.gameID, { y: pixelY, x: pixelX })) {
            const pixelsOfDifference = this.findPixelsOfDifference(message.roomID, message.gameID, { y: pixelY, x: pixelX });
            this.suppressDifference(message.roomID, message.gameID, pixelsOfDifference);
            socketPlayer.emit(GameEvents.DifferenceFound, { pixels: pixelsOfDifference, playSound: true });
            socketPlayer.broadcast.to(message.roomID).emit(GameEvents.DifferenceFound, { pixels: pixelsOfDifference, playSound: false });
            return true;
        } else {
            socketPlayer.emit(GameEvents.ErrorFound, []);
            return false;
        }
    }
    private checkDifferences(roomID: string, gameID: string, position: { y: number; x: number }): boolean {
        if (this.gameMap.get(roomID).get(gameID).pixelMap[position.y][position.x]) {
            return true;
        } else {
            return false;
        }
    }
    private findPixelsOfDifference(roomID: string, gameID: string, position: { y: number; x: number }): [number, number][] {
        for (const difference of this.gameMap.get(roomID).get(gameID).differencesGrouped) {
            for (const pixel of difference) {
                if (pixel[0] === position.y && pixel[1] === position.x) {
                    return difference;
                }
            }
        }
        return [];
    }
    private suppressDifference(roomID: string, gameID: string, difference: [number, number][]) {
        const index = this.gameMap.get(roomID).get(gameID).differencesGrouped.indexOf(difference);
        if (index > ARRAY_ERROR) {
            this.gameMap.get(roomID).get(gameID).differencesGrouped.splice(index, 1);
        }
        for (const pixel of difference) {
            this.gameMap.get(roomID).get(gameID).pixelMap[pixel[0]][pixel[1]] = false;
        }
    }
    private isModeLimitedTime(mode: string): boolean {
        return mode === LIMITED_TIME_COOP || mode === LIMITED_TIME_SOLO;
    }
}
