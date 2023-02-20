import { Body, Controller, Get, HttpStatus, Param, Post, Res, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import * as fs from 'fs/promises';
import { createReadStream } from 'fs';
import { join } from 'path';

@ApiTags('File')
@Controller('file')
export class FileController {
    @Get('/:id')
    getFile(@Param('id') id: string, @Res({ passthrough: true }) res: Response): StreamableFile {
        const file = createReadStream(join(process.cwd(), 'assets/' + id));
        // eslint-disable-next-line @typescript-eslint/naming-convention
        res.set({ 'Content-Type': 'image/bmp' });
        return new StreamableFile(file);
    }

    @Get('/:id')
    getSound(@Param('id') id: string, @Res({ passthrough: true }) res: Response): StreamableFile {
        const file = createReadStream(join(process.cwd(), 'assets/' + id));
        // eslint-disable-next-line @typescript-eslint/naming-convention
        res.set({ 'Content-Type': 'audio/mpeg' });
        return new StreamableFile(file);
    }
    @Post('/upload')
    @ApiOkResponse({
        description: 'Path',
        type: String,
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file, @Body('name') name, @Res() response: Response) {
        try {
            await fs.writeFile('assets/' + name + '.bmp', file.buffer);
            response.status(HttpStatus.CREATED).send({ name: 'assets/' + name + '.bmp' });
        } catch (e) {
            response.status(HttpStatus.NOT_FOUND).send(e.message);
        }
    }
}
