/* eslint-disable no-underscore-dangle */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InfosUserPopUpComponent } from '@app/components/infos-user-pop-up/infos-user-pop-up.component';
import { Game } from '@app/interfaces/game.interface';
import { CommunicationService } from '@app/services/communication.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-gamecard',
    templateUrl: './gamecard.component.html',
    styleUrls: ['./gamecard.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() game: Game;
    @Input() view: string;
    @Output() delete = new EventEmitter<string>();
    link = environment.serverUrl;
    textButton: string = 'Créer';
    username: string = '';
    constructor(public dialog: MatDialog, private socketClientService: SocketClientService, private communicationService: CommunicationService) {
        this.connectWithServer();
        this.playerWaiting();
        this.noPlayerWaiting();
    }

    ngOnInit(): void {
        this.initializeWaitingStatus();
    }

    getUsername(isSoloMode: boolean) {
        this.dialog.open(InfosUserPopUpComponent, {
            data: { username: this.username, gameId: this.game._id, isSolo: isSoloMode, isSomeoneWaiting: this.textButton === 'Rejoindre' },
        });
    }

    deleteGame() {
        this.delete.emit(this.game._id);
    }

    resetBestScore() {
        this.communicationService.resetBestScore(this.game).subscribe();
        this.windowReload(window);
    }

    private windowReload(window: Window): void {
        window.location.reload();
    }

    private connectWithServer() {
        this.socketClientService.connect();
    }

    private initializeWaitingStatus() {
        this.socketClientService.send('initializeWaitingStatus', this.game._id);
        this.socketClientService.on('initializeWaitingStatus', (response: string) => {
            const gameID = response.split(':')[0];
            const isWaiting = response.split(':')[1] === 'true';
            if (gameID === this.game._id) {
                this.textButton = isWaiting ? 'Rejoindre' : 'Créer';
            }
        });
    }

    private playerWaiting() {
        this.socketClientService.on('playerWaiting', (gameIDPlayerWaiting: string) => {
            this.textButton = gameIDPlayerWaiting === this.game._id ? 'Rejoindre' : this.textButton;
        });
    }

    private noPlayerWaiting() {
        this.socketClientService.on('noPlayerWaiting', (gameIDPlayerWaiting: string) => {
            this.textButton = gameIDPlayerWaiting === this.game._id ? 'Créer' : this.textButton;
        });
    }
}
