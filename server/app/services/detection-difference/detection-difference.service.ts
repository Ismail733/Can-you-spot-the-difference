/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Game } from '@app/model/schema/game.schema';
import { HEIGHT, WIDTH } from '@common/constants';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Queue } from './queue';
@Injectable()
export class DetectionDifferenceService {
    game: Game;
    private image1;
    private image2;
    private output;
    private alreadyVisited: boolean[][];
    private queue: Queue;
    private inRadiusList: boolean[][];
    createGame(game: Game, image1, image2) {
        this.game = game;
        const idName = Math.floor(Math.random() * Date.now()).toString();
        this.saveImage(image1, idName + '_1');
        this.saveImage(image2, idName + '_2');
        this.importImages(image1, image2);
        this.findDifference();
        this.expandRadius();
        this.groupDifferences();
        this.saveImage(this.exportImage(), idName + '_diff');
        this.game.image1 = idName + '_1';
        this.game.image2 = idName + '_2';
        this.game.imageDiff = idName + '_diff';
    }
    validateGame(game, image1, image2) {
        this.game = game;
        this.importImages(image1, image2);
        this.findDifference();
        this.expandRadius();
        this.groupDifferences();
        this.saveImage(this.exportImage(), this.game.name);
    }
    recreateGameArrays(game, image1, image2) {
        this.game = game;
        this.importImages(image1, image2);
        this.findDifference();
        this.expandRadius();
        this.groupDifferences();
    }

    private saveImage(image, name) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        fs.writeFile('assets/' + name + '.bmp', image, () => {});
    }
    private checkBoundary(y, x) {
        if (y < HEIGHT && x < WIDTH && y >= 0 && x >= 0) return true;
        return false;
    }
    private bfsAdjacent(y, x, queue) {
        for (let i = -1; i <= 1; i += 2) {
            if (this.checkBoundary(y + i, x) && !this.alreadyVisited[y + i][x]) {
                queue.enqueue([y + i, x]);
            }
            if (this.checkBoundary(y, x + i) && !this.alreadyVisited[y][x + i]) {
                queue.enqueue([y, x + i]);
            }
        }
    }
    private bfs(y, x, queue) {
        if (this.checkBoundary(y, x)) {
            if (this.game.pixelMap[y][x] && !this.alreadyVisited[y][x]) {
                this.game.differencesGrouped[this.game.nbDifferences - 1].push([y, x]);
                this.alreadyVisited[y][x] = true;
                this.bfsAdjacent(y, x, queue);
            }
            this.alreadyVisited[y][x] = true;
        }
    }
    private groupDifferences() {
        const queue = new Queue();
        this.resetAlreadyVisited();
        let y = 0;
        let x = 0;
        while (y < this.alreadyVisited.length) {
            x = 0;
            while (x < this.alreadyVisited[y].length) {
                while (!queue.isEmpty) {
                    const dequeued = queue.dequeue();
                    this.bfs(dequeued[0], dequeued[1], queue);
                }
                if (this.game.pixelMap[y][x] && !this.alreadyVisited[y][x]) {
                    this.game.nbDifferences++;
                    this.game.differencesGrouped.push([]);
                    this.bfs(y, x, queue);
                }
                x++;
            }
            y++;
        }
    }

    private findDifference() {
        let diff = 0;
        for (let y = 0; y < HEIGHT; y++) {
            this.game.pixelMap.push([]);
            for (let x = 0; x < WIDTH; x++) {
                const pos = (y * WIDTH + x) * 4;
                const difference = this.differenceColor(pos);
                if (difference) {
                    this.game.pixelMap[y].push(true);
                    diff++;
                } else {
                    this.game.pixelMap[y].push(false);
                }
            }
        }
        return diff;
    }

    private mergeInRadius(inRadiusList) {
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                if (inRadiusList[y][x]) {
                    this.game.pixelMap[y][x] = true;
                }
            }
        }
    }
    private expandRadius() {
        const inRadiusList = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => false));
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                if (this.game.pixelMap[y][x]) {
                    this.findInRadius(y, x, inRadiusList);
                }
            }
        }
        this.mergeInRadius(inRadiusList);
    }

    private resetAlreadyVisited() {
        this.alreadyVisited = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => false));
        this.inRadiusList = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => false));
    }
    private findInRadius(y: number, x: number, inRadiusList: boolean[][]) {
        for (let i = -16; i < 16; i++) {
            for (let j = -16; j < 16; j++) {
                if (x + j < WIDTH && y + i < HEIGHT && x + j >= 0 && y + i >= 0) {
                    if (this.distance(y, x, y + i, x + j) <= this.game.radius) {
                        inRadiusList[y + i][x + j] = true;
                    }
                }
            }
        }
    }

    private differenceColor(pos: number): boolean {
        const r1 = this.image1.donnes[pos + 0];
        const v1 = this.image1.donnes[pos + 1];
        const b1 = this.image1.donnes[pos + 2];
        const a1 = this.image1.donnes[pos + 3];
        const r2 = this.image2.donnes[pos + 0];
        const v2 = this.image2.donnes[pos + 1];
        const b2 = this.image2.donnes[pos + 2];
        const a2 = this.image2.donnes[pos + 3];
        if (a1 === a2 && r1 === r2 && v1 === v2 && b1 === b2) return false;
        return true;
    }

    private importImages(image1, image2) {
        this.image1 = this.decoderBMP(image1);
        this.image2 = this.decoderBMP(image2);
        this.output = this.decoderBMP(image1);
    }
    private exportImage() {
        return this.encoderBMP(this.output);
    }

    private decoderBMP(buffer) {
        let pos = 0;
        let renverser = true;
        const flag = buffer.toString('utf-8', 0, (pos += 2));
        if (flag !== 'BM') throw new Error('Invalid BMP File');
        pos += 16;
        const width = buffer.readUInt32LE(pos);
        pos += 4;
        let height = buffer.readInt32LE(pos);
        pos += 6;
        const encodageTaillePixel = buffer.readUInt16LE(pos);
        pos += 2;
        const compression = buffer.readUInt32LE(pos);
        pos += 28;
        if (height < 0) {
            height *= -1;
            renverser = false;
        }
        const len = width * height * 4;
        const data = Buffer.alloc(len);
        if (encodageTaillePixel !== 24) throw new Error('Invalid BMP File');
        if (compression !== 0) throw new Error('Invalid BMP File');
        pos = 54;
        for (let y = height - 1; y >= 0; y--) {
            const line = renverser ? y : height - 1 - y;
            for (let x = 0; x < width; x++) {
                const blue = buffer.readUInt8(pos++);
                const green = buffer.readUInt8(pos++);
                const red = buffer.readUInt8(pos++);
                const location = line * width * 4 + x * 4;
                data[location] = 0;
                data[location + 1] = blue;
                data[location + 2] = green;
                data[location + 3] = red;
            }
        }
        const bmp = { width: 0, height: 0, donnes: null };
        bmp.width = width;
        bmp.height = height;
        bmp.donnes = data;
        return bmp;
    }

    private encoderBMP(bmp) {
        const width = bmp.width;
        const height = bmp.height;
        const extra = width % 4;
        const rgbTaile = height * (3 * width + extra);
        const headerTaille = 40;
        const flag = 'BM';
        const reserve = 0;
        const offset = 54;
        const tailleFicher = rgbTaile + offset;
        const planes = 1;
        const encodageTaillePixel = 24;
        const compression = 0;
        const couleurs = 0;
        const couleursImportantes = 0;
        const buffer = Buffer.alloc(offset + rgbTaile);
        let pos = 0;
        buffer.write(flag, pos, 2);
        buffer.writeUInt32LE(tailleFicher, (pos += 2));
        buffer.writeUInt32LE(reserve, (pos += 4));
        buffer.writeUInt32LE(offset, (pos += 4));
        buffer.writeUInt32LE(headerTaille, (pos += 4));
        buffer.writeUInt32LE(width, (pos += 4));
        buffer.writeInt32LE(-height, (pos += 4));
        buffer.writeUInt16LE(planes, (pos += 4));
        buffer.writeUInt16LE(encodageTaillePixel, (pos += 2));
        buffer.writeUInt32LE(compression, (pos += 2));
        buffer.writeUInt32LE(rgbTaile, (pos += 4));
        buffer.writeUInt32LE(0, (pos += 4));
        buffer.writeUInt32LE(0, (pos += 4));
        buffer.writeUInt32LE(couleurs, (pos += 4));

        buffer.writeUInt32LE(couleursImportantes, (pos += 4));
        pos += 4;
        const lenghtLine = 3 * width + extra;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (this.game.pixelMap[y][x]) {
                    const p = pos + y * lenghtLine + x * 3;
                    buffer[p] = 0;
                    buffer[p + 1] = 0;
                    buffer[p + 2] = 0;
                } else {
                    const p = pos + y * lenghtLine + x * 3;
                    buffer[p] = 255;
                    buffer[p + 1] = 255;
                    buffer[p + 2] = 255;
                }
            }
        }
        return buffer;
    }
    // eslint-disable-next-line max-params
    private distance = (y1, x1, y2, x2) => {
        return Math.sqrt(Math.pow(y1 - y2, 2) + Math.pow(x1 - x2, 2));
    };
}
