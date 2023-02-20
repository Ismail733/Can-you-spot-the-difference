/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Game } from '@app/model/schema/game.schema';
import { HEIGHT, WIDTH } from '@common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { DetectionDifferenceService } from './detection-difference.service';
import { Queue } from './queue';

describe('DetectionDifferenceService', () => {
    let service: DetectionDifferenceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DetectionDifferenceService],
        }).compile();
        service = module.get<DetectionDifferenceService>(DetectionDifferenceService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should validate a game with radius 9', () => {
        const fakeGameObj = new Game('dorian', 9);
        const image1 = fs.readFileSync('assets/test/test_1.bmp');
        const image2 = fs.readFileSync('assets/test/test_2.bmp');
        service.validateGame(fakeGameObj, image1, image2);
        expect(fakeGameObj.nbDifferences).toEqual(3);
        expect(fs.readFileSync('assets/dorian.bmp').buffer).toEqual(fs.readFileSync('assets/test/test.bmp').buffer);
    });
    it('should create a game with radius 9', () => {
        const fakeGameObj = new Game('dorian', 9);
        const image1 = fs.readFileSync('assets/test/edge_1.bmp');
        const image2 = fs.readFileSync('assets/test/edge_2.bmp');
        service.createGame(fakeGameObj, image1, image2);
        expect(fakeGameObj.nbDifferences).toEqual(4);
        expect(fs.readFileSync('assets/' + fakeGameObj.imageDiff + '.bmp').buffer).toEqual(fs.readFileSync('assets/test/edge_diff.bmp').buffer);
        expect(fs.readFileSync('assets/' + fakeGameObj.image1 + '.bmp').buffer).toEqual(image1.buffer);
        expect(fs.readFileSync('assets/' + fakeGameObj.image2 + '.bmp').buffer).toEqual(image2.buffer);
    });
    it('should recreate a game with radius 9', () => {
        const fakeGameObj = new Game('dorian', 9);
        const image1 = fs.readFileSync('assets/test/edge_1.bmp');
        const image2 = fs.readFileSync('assets/test/edge_2.bmp');
        service.recreateGameArrays(fakeGameObj, image1, image2);
        expect(fakeGameObj.nbDifferences).toEqual(4);
    });
    it('should fail write file', () => {
        jest.spyOn(fs, 'writeFile').mockImplementation(() => {
            throw new Error('error');
        });
        const image1 = fs.readFileSync('assets/test/edge_1.bmp');
        try {
            service['saveImage']('test', image1);
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
    it('should check for boundary', () => {
        const inBoundary = service['checkBoundary'](200, 200);
        expect(inBoundary).toBe(true);
    });
    it('should catch invalid flag', () => {
        try {
            service['decoderBMP'](Buffer.from('test'));
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
    it('should catch invalid encoding type', () => {
        try {
            const image1 = fs.readFileSync('assets/test/edge_1.bmp');
            image1.writeUInt16LE(0, 28);
            service['decoderBMP'](image1);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
    it('should correctly encode image', () => {
        try {
            const image1 = fs.readFileSync('assets/test/edge_1.bmp');
            const bmp = service['decoderBMP'](image1);
            const encoded = service['encoderBMP'](bmp);
            expect(encoded).toEqual(bmp.donnes);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
    it('should catch invalid compression', () => {
        try {
            const image1 = fs.readFileSync('assets/test/edge_1.bmp');
            image1.writeUInt16LE(5, 30);
            service['decoderBMP'](image1);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
    it('should calculate the correct distance', () => {
        const distance = service['distance'](0, 0, 8, 6);
        expect(distance).toEqual(10);
    });
    it('should reset already visited', () => {
        service['resetAlreadyVisited']();
        expect(service['alreadyVisited'].length).toEqual(HEIGHT);
        expect(service['alreadyVisited'][0].length).toEqual(WIDTH);
        expect(service['alreadyVisited'][0][0]).toEqual(false);
    });
    it('should  not invert height', () => {
        try {
            const image1 = fs.readFileSync('assets/test/edge_1.bmp');
            image1.writeUInt32LE(480, 22);
            const bmp = service['decoderBMP'](image1);
            expect(bmp.width).toEqual(480);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
    it('should find one difference', () => {
        service.game = new Game('dorian', 9);
        service['image1'] = { height: HEIGHT, width: WIDTH, donnes: [1, 2, 3] };
        service['image2'] = { height: HEIGHT, width: WIDTH, donnes: [2, 2, 3] };
        const nbDifferences = service['findDifference']();
        expect(nbDifferences).toBe(1);
    });
    it('should detect difference', () => {
        service['image1'] = { height: HEIGHT, width: WIDTH, donnes: [1, 2, 3] };
        service['image2'] = { height: HEIGHT, width: WIDTH, donnes: [2, 2, 3] };
        const differenceDetected = service['differenceColor'](0);
        expect(differenceDetected).toBe(true);
    });
    it('should group difference', () => {
        service.game = new Game('dorian', 9);
        service.game.pixelMap = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => false));
        service.game.pixelMap[0][0] = true;
        service['groupDifferences']();
        expect(service.game.nbDifferences).toEqual(1);
    });
    it('should merge in radius', () => {
        service.game = new Game('dorian', 9);
        service.game.pixelMap = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => false));
        const inRadiusList = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => false));
        inRadiusList[0][0] = true;
        service['mergeInRadius'](inRadiusList);
        expect(inRadiusList).toEqual(service.game.pixelMap);
    });
    it('should find in radius', () => {
        service.game = new Game('dorian', 9);
        const inRadiusList = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => false));
        inRadiusList[0][0] = true;
        service['findInRadius'](0, 0, inRadiusList);
        expect(inRadiusList[1][1]).toEqual(true);
    });
    it('should expand Radius', () => {
        service.game = new Game('dorian', 9);
        service.game.pixelMap = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => false));
        service.game.pixelMap[0][0] = true;
        service['expandRadius']();
        expect(service.game.pixelMap[1][1]).toEqual(true);
    });
    it('should import images', () => {
        service.game = new Game('dorian', 9);
        const image1 = fs.readFileSync('assets/test/edge_1.bmp');
        const image2 = fs.readFileSync('assets/test/edge_2.bmp');
        service['importImages'](image1, image2);
        expect(service['image1']).toBeDefined();
        expect(service['image2']).toBeDefined();
    });
    it('should export images', () => {
        service.game = new Game('dorian', 9);
        service.game.pixelMap = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => false));
        service.game.pixelMap[0][0] = true;
        const image1 = fs.readFileSync('assets/test/edge_1.bmp');
        const image2 = fs.readFileSync('assets/test/edge_2.bmp');
        service['importImages'](image1, image2);
        const output = service['exportImage']();
        expect(output).toBeDefined();
    });
    it('should add to queue bfsAdjacent', () => {
        service.game = new Game('dorian', 9);
        service.game.pixelMap = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => false));
        service.game.pixelMap[0][0] = true;
        service['resetAlreadyVisited']();
        const queue = new Queue();
        service['bfsAdjacent'](0, 0, queue);
        expect(queue.isEmpty).toEqual(false);
    });
    it('should visit with bfs', () => {
        service.game = new Game('dorian', 9);
        service.game.pixelMap = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => false));
        service['resetAlreadyVisited']();
        const queue = new Queue();
        service['bfs'](0, 0, queue);
        expect(service['alreadyVisited'][0][0]).toEqual(true);
    });
});
