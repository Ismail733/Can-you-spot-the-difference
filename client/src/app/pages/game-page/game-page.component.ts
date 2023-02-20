import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderGamePageComponent } from '@app/components/header-game-page/header-game-page.component';
import { Game } from '@app/interfaces/game.interface';
import { CommunicationService } from '@app/services/communication.service';
import { RoomService } from '@app/services/room-service';
import { SocketClientService } from '@app/services/socket-client.service';
import { RANDOM_GENERATOR } from '@common/constants';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    @ViewChild('1') header!: HeaderGamePageComponent;

    imageOriginalURL: string = '';
    imageModifiedURL: string = '';

    game: Game;
    gameName: string;
    gameIDs: string[];
    routeID: string;
    // eslint-disable-next-line max-params
    constructor(
        private communicationService: CommunicationService,
        private route: ActivatedRoute,
        public roomService: RoomService,
        private socketClientService: SocketClientService,
    ) {}
    ngOnInit(): void {
        this.gameIDs = [];
        this.getGameID();
        if (this.routeID === 'temps-limite') {
            this.initializeLimitedTime();
        } else {
            this.initializeClassic();
        }
    }

    quitGame() {
        this.roomService.quitGame();
    }

    private getInfosGame() {
        this.communicationService.getGame(this.routeID).subscribe((data) => {
            this.game = data;
            this.gameName = this.game.name;
        });
    }

    private getGameID() {
        const routeParams = this.route.snapshot.paramMap;
        this.routeID = String(routeParams.get('gameId'));
    }

    private initializeLimitedTime() {
        this.communicationService.getAllGames().subscribe((data) => {
            for (const game of data) {
                // eslint-disable-next-line no-underscore-dangle
                this.gameIDs.push(game._id);
            }
            this.socketClientService.send('initialization', {
                games: this.gameIDs.sort(() => Math.random() - RANDOM_GENERATOR),
                roomID: this.roomService.roomID,
            });
        });
        this.gameName = 'Temps Limite';
    }

    private initializeClassic() {
        this.gameIDs.push(this.routeID);
        this.socketClientService.send('initialization', { games: this.gameIDs, roomID: this.roomService.roomID });
        this.getInfosGame();
    }
}
