import { HttpStatus, StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';
import { FileController } from './file.controller';

describe('FileController', () => {
    let controller: FileController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FileController],
        }).compile();

        controller = module.get<FileController>(FileController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should save the file to the server when uploading', async () => {
        const name = 'mathieu';
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = (response) => {
            expect(response.name).toEqual('assets/' + name + '.bmp');
            return res;
        };
        const file = await fs.readFileSync('assets/test/test_1.bmp');
        await controller.uploadFile({ buffer: file }, name, res);
    });

    it('should return the file from the server', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.set = (type) => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(type).toEqual({ 'Content-Type': 'audio/mpeg' });
            return res;
        };
        const response = await controller.getSound('victory_sound.mp3', res);
        expect(response.getStream()).toMatchObject(
            new StreamableFile(fs.createReadStream(join(process.cwd(), 'assets/victory_sound.mp3'))).getStream(),
        );
    });
    it('should return the file from the server', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.set = (type) => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(type).toEqual({ 'Content-Type': 'image/bmp' });
            return res;
        };

        const response = await controller.getFile('dorian.bmp', res);
        expect(response.getStream()).toMatchObject(new StreamableFile(fs.createReadStream(join(process.cwd(), 'assets/dorian.bmp'))).getStream());
    });
    it('shoudl not save the file when the path is invalid', async () => {
        const name = 'mathieu/mathieu';
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = (response) => {
            expect(response.includes('ENOENT: no such file or directory')).toBeTruthy();
            return res;
        };
        const file = await fs.readFileSync('assets/test/test_1.bmp');
        await controller.uploadFile({ buffer: file }, name, res);
    });
});
