import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RoomService } from '@app/services/room-service';
import { SocketClientService } from '@app/services/socket-client.service';
import { LIMITED_TIME_COOP, LIMITED_TIME_SOLO } from '@common/constants';
import { JoinRoomInterface } from '@common/join-room-interface';

@Component({
    selector: 'app-limited-time-selection',
    templateUrl: './limited-time-selection.component.html',
    styleUrls: ['./limited-time-selection.component.scss'],
})
export class LimitedTimeSelectionComponent implements OnInit {
    isUsernameMode: boolean = true;
    isSomeoneWaiting: boolean = true;
    username: string = '';

    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<LimitedTimeSelectionComponent>,
        private socketClientService: SocketClientService,
        private router: Router,
        private roomService: RoomService,
        public snackBar: MatSnackBar,
        private ngZone: NgZone,
    ) {
        this.connectWithServer();
        this.goToGame();
        this.playerWaiting();
        this.noPlayerWaiting();
    }

    ngOnInit(): void {
        this.initializeWaitingStatus();
    }

    playLimitedTimeSolo() {
        this.socketClientService.send('joinRoomSoloLimitedTime', this.username);
    }

    joinLimitedTimeCoop() {
        this.socketClientService.send('askToPlay', { username: this.username, roomBase: 'limited-time' });
        this.isUsernameMode = false;
    }

    leaveWaiting() {
        this.socketClientService.send('leaveWaiting', 'limited-time');
    }

    checkUsername(mode: string) {
        if (this.username.length === 0) {
            this.openSnackBar("Vous devez rentrer un nom d'utilisateur", 'Fermer');
            return;
        }
        if (mode === 'solo') {
            this.playLimitedTimeSolo();
        } else {
            this.joinLimitedTimeCoop();
        }
    }

    private connectWithServer() {
        this.socketClientService.connect();
    }

    private goToGame() {
        this.socketClientService.on('roomID', (response: JoinRoomInterface) => {
            if (response.mode === LIMITED_TIME_COOP || response.mode === LIMITED_TIME_SOLO) {
                this.ngZone.run(async () => this.router.navigateByUrl('/game/temps-limite'));
                this.dialogRef.close();
                this.roomService.newRoomFromServer(response);
            } else {
                this.dialogRef.close();
            }
        });
    }

    private initializeWaitingStatus() {
        this.socketClientService.send('initializeWaitingStatus', 'limited-time');
        this.socketClientService.on('initializeWaitingStatus', (response: string) => {
            const gameID = response.split(':')[0];
            const isWaiting = response.split(':')[1] === 'true';
            if (gameID === 'limited-time') {
                this.isSomeoneWaiting = isWaiting;
            }
        });
    }

    private playerWaiting() {
        this.socketClientService.on('playerWaiting', (gameIDPlayerWaiting: string) => {
            this.isSomeoneWaiting = gameIDPlayerWaiting === 'limited-time' ? true : this.isSomeoneWaiting;
        });
    }

    private noPlayerWaiting() {
        this.socketClientService.on('noPlayerWaiting', (gameIDPlayerWaiting: string) => {
            this.isSomeoneWaiting = gameIDPlayerWaiting === 'limited-time' ? false : this.isSomeoneWaiting;
        });
    }

    private openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, { duration: 4000 });
    }
}
