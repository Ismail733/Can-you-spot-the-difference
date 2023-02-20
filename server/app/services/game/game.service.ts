import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game';
import { UpdateGameDto } from '@app/model/dto/game/update-game';
import { BestScore } from '@common/best-score';
import { BEST_DUO, BEST_SOLO, CLASSIC_MULTI, CLASSIC_SOLO } from '@common/constants';
import { GameStatus } from '@common/game-status';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(@InjectModel(Game.name) public gameModel: Model<GameDocument>) {}

    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }
    async getGame(id: string): Promise<Game> {
        return this.gameModel.findOne({ _id: id });
    }
    async resetBestScore(game: UpdateGameDto): Promise<void> {
        // eslint-disable-next-line no-underscore-dangle
        const filterQuery = { _id: game._id };
        try {
            game.bestDuo = BEST_DUO;
            game.bestSolo = BEST_SOLO;
            await this.gameModel.updateOne(filterQuery, game);
        } catch (error) {
            return Promise.reject(`Failed to update document: ${error}`);
        }
    }
    async updateBestScore(game: GameStatus, player: string): Promise<number> {
        const playerTime = game.time;
        const user = player;
        const userScore = { username: user, time: playerTime };
        let gamesChanged = 0;
        const updatedGame = await this.gameModel.findOne({ _id: game.currentGameID });
        if (game.mode === CLASSIC_SOLO) {
            gamesChanged = this.modifyBestScores(updatedGame.bestSolo, userScore);
        } else if (game.mode === CLASSIC_MULTI) {
            gamesChanged = this.modifyBestScores(updatedGame.bestDuo, userScore);
        }
        try {
            await this.gameModel.updateOne({ _id: game.currentGameID }, updatedGame);
        } catch (error) {
            return 0;
        }
        return gamesChanged;
    }

    async resetBestScores(): Promise<void> {
        try {
            await this.gameModel.updateMany({}, { bestSolo: BEST_SOLO, bestDuo: BEST_DUO });
        } catch (error) {
            return Promise.reject(`Failed to update document: ${error}`);
        }
    }
    async deleteGame(id: string): Promise<void> {
        const game = await this.gameModel.findOneAndDelete({ _id: id });
        this.deleteGameImages(game);
    }

    async deleteAllGames(): Promise<void> {
        const games = await this.gameModel.find({});
        await this.gameModel.deleteMany({});
        games.forEach((game) => {
            this.deleteGameImages(game);
        });
    }

    async addGame(jeu: CreateGameDto): Promise<void> {
        try {
            await this.gameModel.create(jeu);
        } catch (error) {
            return Promise.reject(`Failed to insert game: ${error}`);
        }
    }
    private async deleteGameImages(game: Game): Promise<void> {
        try {
            this.deleteImage(game.image1);
            this.deleteImage(game.image2);
            this.deleteImage(game.imageDiff);
        } catch (error) {
            throw new Error(error);
        }
    }

    private async deleteImage(name: string): Promise<void> {
        return new Promise((res, rej) => {
            fs.unlink('assets/' + name + '.bmp', (err) => {
                if (err) rej('Could not delete image');
            });
        });
    }

    private modifyBestScores(bestScores: BestScore[], userScore: BestScore): number {
        let scoresChanged = 0;
        for (let i = 0; i < bestScores.length; i++) {
            if (userScore.time < bestScores[i].time) {
                bestScores.splice(i, 0, userScore);
                bestScores.pop();
                scoresChanged = i + 1;
                break;
            } else if (userScore.time === bestScores[i].time) break;
        }
        return scoresChanged;
    }
}
