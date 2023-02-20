import { GameEvents } from '@app/gateways/game/game.gateway.events';
import { DirectionInterface } from '@app/interfaces/clues.interfaces';
import { QuadrantInterface } from '@app/interfaces/quadrant.interface';
import { Socket } from 'socket.io';

import { AxeInterface } from '@app/interfaces/axe.interfaces';
import { Game } from '@app/model/schema/game.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClueManager {
    private clue: { x: number; y: number } = { x: 0, y: 0 };

    private cluePixels: [number, number][] = [];

    private currentQuadrant: QuadrantInterface = {
        pixelStart: { y: 0, x: 0 },
        pixelEnd: { y: 0, x: 0 },
    };
    sendSecondClue(socketPlayer: Socket, message: { roomID: string; gameID: string }, gameMap: Map<string, Map<string, Game>>) {
        this.resetValues();
        this.makeClue(message, gameMap);
        this.cluePixels = [];
        this.findQuadrant(this.clue, this.currentQuadrant);

        socketPlayer.emit(GameEvents.ClueCanvas, this.cluePixels);
        this.resetValues();
    }

    sendLastClue(socketPlayer: Socket, message: { roomID: string; gameID: string }, gameMap: Map<string, Map<string, Game>>) {
        this.resetValues();
        this.makeClue(message, gameMap);
        this.cluePixels = [];
        this.makeLastClue();
        socketPlayer.emit(GameEvents.ClueCanvas, this.cluePixels);
        this.resetValues();
    }

    sendFirstClue(socketPlayer: Socket, message: { roomID: string; gameID: string }, gameMap: Map<string, Map<string, Game>>) {
        this.makeClue(message, gameMap);

        socketPlayer.emit(GameEvents.ClueCanvas, this.cluePixels);
        this.resetValues();
    }

    private getRandomIndex(max: number) {
        return Math.floor(Math.random() * max);
    }

    private findQuadrant(clue: { x: number; y: number }, quadrant: QuadrantInterface) {
        const endY = (quadrant.pixelEnd.y - quadrant.pixelStart.y) / 2 + quadrant.pixelStart.y;
        const endX = (quadrant.pixelEnd.x - quadrant.pixelStart.x) / 2 + quadrant.pixelStart.x;
        if (clue.y >= endY && clue.x >= endX) {
            this.currentQuadrant.pixelStart.y = endY;
            this.currentQuadrant.pixelStart.x = endX;
            this.currentQuadrant.pixelEnd = quadrant.pixelEnd;
        }
        if (clue.y < endY && clue.x > endX) {
            this.currentQuadrant.pixelStart.y = quadrant.pixelStart.y;
            this.currentQuadrant.pixelStart.x = endX;
            this.currentQuadrant.pixelEnd.x = quadrant.pixelEnd.x;
            this.currentQuadrant.pixelEnd.y = endY;
        }
        if (clue.y >= endY && clue.x <= endX) {
            this.currentQuadrant.pixelStart.y = endY;
            this.currentQuadrant.pixelStart.x = quadrant.pixelStart.x;
            this.currentQuadrant.pixelEnd.y = quadrant.pixelEnd.y;
            this.currentQuadrant.pixelEnd.x = endX;
        }
        if (clue.y < endY && clue.x < endX) {
            this.currentQuadrant.pixelStart = quadrant.pixelStart;
            this.currentQuadrant.pixelEnd.y = endY;
            this.currentQuadrant.pixelEnd.x = endX;
        }
        this.createQuadrantPixels(this.currentQuadrant);
    }

    private createQuadrantPixels(quadrant: QuadrantInterface) {
        this.currentQuadrant = quadrant;
        const pixels: DirectionInterface = {
            top: this.fillClueLines({ startValue: quadrant.pixelStart.x, stopValue: quadrant.pixelEnd.x }, quadrant.pixelStart.y, false),
            bottom: this.fillClueLines({ startValue: quadrant.pixelStart.x, stopValue: quadrant.pixelEnd.x }, quadrant.pixelEnd.y, false),
            right: this.fillClueLines({ startValue: quadrant.pixelStart.y, stopValue: quadrant.pixelEnd.y }, quadrant.pixelEnd.x, true),
            left: this.fillClueLines({ startValue: quadrant.pixelStart.y, stopValue: quadrant.pixelEnd.y }, quadrant.pixelStart.x, true),
        };

        this.expandLineRadius(pixels);
    }

    private expandLineRadius(pixels: DirectionInterface) {
        const maxRadius = 10;
        for (const pixel of pixels.left) {
            for (let radius = 0; radius < maxRadius; radius++) {
                this.cluePixels.push([pixel[0], pixel[1] + radius]);
            }
        }

        for (const pixel of pixels.right) {
            for (let radius = 0; radius < maxRadius; radius++) {
                this.cluePixels.push([pixel[0], pixel[1] - radius]);
            }
        }

        for (const pixel of pixels.top) {
            for (let radius = 0; radius < maxRadius; radius++) {
                this.cluePixels.push([pixel[0] + radius, pixel[1]]);
            }
        }

        for (const pixel of pixels.bottom) {
            for (let radius = 0; radius < maxRadius; radius++) {
                this.cluePixels.push([pixel[0] - radius, pixel[1]]);
            }
        }
    }

    private fillClueLines(value: { startValue: number; stopValue: number }, constant: number, axe: boolean) {
        const line: [number, number][] = [];

        if (axe) {
            for (let i = value.startValue; i <= value.stopValue; i++) {
                line.push([i, constant]);
            }
            return line;
        } else {
            for (let i = value.startValue; i <= value.stopValue; i++) {
                line.push([constant, i]);
            }
            return line;
        }
    }

    private makeClue(message: { roomID: string; gameID: string }, gameMap: Map<string, Map<string, Game>>) {
        const difference = gameMap.get(message.roomID).get(message.gameID).differencesGrouped[
            this.getRandomIndex(gameMap.get(message.roomID).get(message.gameID).differencesGrouped.length)
        ];
        this.clue.y = difference[this.getRandomIndex(difference.length)][0];
        this.clue.x = difference[this.getRandomIndex(difference.length)][1];

        this.findQuadrant(this.clue, {
            pixelStart: { y: 0, x: 0 },
            pixelEnd: { y: 480, x: 640 },
        });
    }

    private makeLastClue() {
        const pixels: AxeInterface = {
            left: this.makeCross(false),
            right: this.makeCross(true),
        };

        this.expandRadius(pixels);
    }

    private makeCross(axe: boolean) {
        const radius = 40;
        const line: [number, number][] = [];
        if (!axe) {
            for (let i = -radius; i <= radius; i++) {
                line.push([this.clue.y + i, this.clue.x + i]);
            }
        } else {
            for (let i = radius; i >= -radius; i--) {
                line.push([this.clue.y - i, this.clue.x + i]);
            }
        }
        return line;
    }

    private expandRadius(pixels: AxeInterface) {
        const maxRadius = 20;
        for (const pixel of pixels.right) {
            for (let radius = 0; radius < maxRadius; radius++) {
                this.cluePixels.push([pixel[0], pixel[1] + radius]);
            }
        }

        for (const pixel of pixels.left) {
            for (let radius = 0; radius < maxRadius; radius++) {
                this.cluePixels.push([pixel[0], pixel[1] + radius]);
            }
        }
    }

    private resetValues() {
        this.currentQuadrant = {
            pixelStart: { y: 0, x: 0 },
            pixelEnd: { y: 0, x: 0 },
        };
        this.clue = { x: 0, y: 0 };
        this.cluePixels = [];
    }
}
