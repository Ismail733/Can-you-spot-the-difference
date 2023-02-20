import { UpdateGameDto } from '@app/model/dto/game/update-game';
import { Game } from '@app/model/schema/game.schema';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Game')
@Controller('game')
export class GameController {
    constructor(private detectionDifferenceService: DetectionDifferenceService, private readonly gameService: GameService) {}

    // eslint-disable-next-line max-params
    @ApiOkResponse({
        description: 'Return all messages',
        type: Game,
        isArray: true,
    })
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'image1', maxCount: 1 },
            { name: 'image2', maxCount: 1 },
        ]),
    )
    @Post('/createGame')
    async createGame(@UploadedFiles() files: { image1?; image2? }, @Body('radius') radius, @Body('name') name, @Res() response: Response) {
        const game = new Game(name, radius);
        this.detectionDifferenceService.createGame(game, files.image1[0].buffer, files.image2[0].buffer);
        try {
            game.pixelMap = [];
            game.differencesGrouped = [];
            await this.gameService.addGame({ ...game });
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
        return { status: 'Game ajouté!' };
    }

    @ApiOkResponse({
        description: 'Return all messages',
        type: String,
    })
    @Post('/validateGame')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'image1', maxCount: 1 },
            { name: 'image2', maxCount: 1 },
        ]),
    )
    validateGame(
        @UploadedFiles() files: { image1?; image2? },
        @Body('radius') radius,
        @Body('name') name,
    ): { name: string; nbDifferences: number; image: Blob } {
        const game = new Game(name, radius);
        this.detectionDifferenceService.validateGame(game, files.image1[0].buffer, files.image2[0].buffer);
        return { name, nbDifferences: game.nbDifferences, image: files.image1[0] };
    }

    @ApiOkResponse({
        description: 'Returns all games',
        type: Game,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allGames(@Res() response: Response) {
        try {
            const allGames = await this.gameService.getAllGames();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Returns a game',
        type: Game,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:id')
    async getGame(@Param('id') _id, @Res() response: Response) {
        try {
            const game = await this.gameService.getGame(_id);
            response.status(HttpStatus.OK).json(game);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Modify a game',
        type: Game,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Patch('/')
    async resetBestScore(@Body() gameDto: UpdateGameDto, @Res() response: Response) {
        try {
            await this.gameService.resetBestScore(gameDto);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
    @ApiOkResponse({
        description: 'Reset all best scores',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Put('/')
    async resetBestScores(@Body() body: [], @Res() response: Response) {
        try {
            await this.gameService.resetBestScores();
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Deletes a game',
        type: Game,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:id')
    async deleteGame(@Param('id') _id, @Res() response: Response) {
        try {
            await this.gameService.deleteGame(_id);
            response.status(HttpStatus.NO_CONTENT);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Deletes all games',
        type: Game,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/')
    async deleteAllGames(@Res() response: Response) {
        try {
            await this.gameService.deleteAllGames();
            response.status(HttpStatus.NO_CONTENT);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
