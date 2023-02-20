import { Player } from "./player";
export class GameStatus {
    player1: Player;
    player2: Player;
    roomID: string;
    time: number;
    mode: string;
    currentGameID: string;
    gameIDList: string[];
    image1: string;
    image2: string;
    nbDifferences: number;
    maxTime: number;
    timeDecrement: number;
    name: string;
    constructor() {
        this.player1 = new Player();
        this.player2 = new Player();
        this.time = 0;
        this.mode = '';
        this.currentGameID = '';
        this.image1 = '';
        this.image2 = '';
        this.gameIDList = [];
        this.maxTime = 30;

    }
}