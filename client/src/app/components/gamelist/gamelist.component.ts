import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Game } from '@app/interfaces/game.interface';
import { CommunicationService } from '@app/services/communication.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { MAX_NB_IMGS } from '@common/constants';
@Component({
    selector: 'app-gamelist',
    templateUrl: './gamelist.component.html',
    styleUrls: ['./gamelist.component.scss'],
})
export class GameListComponent implements OnInit {
    @Input() page: string;
    games: Game[] = [];
    currentIndexes: number[];

    constructor(
        private communicationService: CommunicationService,
        private snackBar: MatSnackBar,
        private socketClientService: SocketClientService,
    ) {}

    ngOnInit(): void {
        this.fetchGames();
        this.connectWithServer();
    }

    prevGames(): void {
        if (this.currentIndexes[0] > MAX_NB_IMGS - 1) {
            this.decreaseIndexes();
        } else {
            this.initializeIndexes();
        }
    }

    nextGames(): void {
        if (this.currentIndexes[MAX_NB_IMGS - 1] < this.games.length - MAX_NB_IMGS) {
            this.increaseIndexes();
        } else {
            this.lastIndexes();
        }
    }

    isIndexInArray(index: number): boolean {
        for (const i of this.currentIndexes) {
            if (i === index) return true;
        }
        return false;
    }

    initializeIndexes() {
        this.currentIndexes = new Array(MAX_NB_IMGS);
        for (let i = 0; i < MAX_NB_IMGS; i++) {
            this.currentIndexes[i] = i;
        }
    }

    lastIndexes() {
        for (let i = 0; i < MAX_NB_IMGS; i++) {
            this.currentIndexes[i] = this.games.length - MAX_NB_IMGS + i;
        }
    }

    decreaseIndexes() {
        this.updateIndexes((x: number, y: number) => {
            return x - y;
        });
    }

    increaseIndexes() {
        this.updateIndexes((x: number, y: number) => {
            return x + y;
        });
    }

    updateIndexes(f: (x: number, y: number) => number) {
        for (let i = 0; i < MAX_NB_IMGS; i++) {
            this.currentIndexes[i] = f(this.currentIndexes[i], MAX_NB_IMGS);
        }
    }

    async deleteGame(id: string) {
        try {
            this.deletePlayerFromWaitingList(id);
            this.communicationService.deleteGame(id).subscribe(async () => {
                this.openSnackBar('Jeu supprimé avec succès', 'Fermer');
            });
            // eslint-disable-next-line no-underscore-dangle
            this.games = this.games.filter((g) => g._id !== id);
        } catch (error) {
            this.openSnackBar('Echec dans la suppression', 'Fermer');
        }
    }

    private connectWithServer() {
        this.socketClientService.connect();
    }

    private openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, { duration: 4000 });
    }

    private fetchGames() {
        this.games = [];
        this.communicationService.getAllGames().subscribe((infos) => {
            this.games = infos;
        });
        this.initializeIndexes();
    }

    private deletePlayerFromWaitingList(id: string) {
        this.socketClientService.send('gameDeleted', id);
    }
}
