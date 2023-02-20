import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RoomService } from '@app/services/room-service';
import { SocketClientService } from '@app/services/socket-client.service';
import { LIMITED_TIME_COOP } from '@common/constants';
import { JoinRoomInterface } from '@common/join-room-interface';

@Component({
    selector: 'app-infos-user-pop-up',
    templateUrl: './infos-user-pop-up.component.html',
    styleUrls: ['./infos-user-pop-up.component.scss'],
})
export class InfosUserPopUpComponent implements OnInit {
    username: string = '';
    gameId: number = 0;
    isUsernameMode = true;
    isWaitingMode = false;
    isRequestMode = false;
    isRequestDeclinedMode = false;
    usernameOpponent: string;
    socketOpponent: string;
    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<InfosUserPopUpComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { username: string; gameId: number; isSolo: boolean; isSomeoneWaiting: boolean },
        private socketClientService: SocketClientService,
        private router: Router,
        public snackBar: MatSnackBar,
        private roomService: RoomService,
        private ngZone: NgZone,
    ) {
        this.connectWithServer();
        this.requestReceived();
        this.goToGame();
        this.gameIsNotAvailable();
        this.requestDeclined();
        this.askerLeft();
    }

    ngOnInit(): void {
        this.username = this.data.username;
        this.gameId = this.data.gameId;
    }

    leaveWaiting() {
        this.socketClientService.send('leaveWaiting', this.gameId);
    }

    leaveAsking() {
        this.socketClientService.send('leaveAsking', this.gameId);
    }

    checkUsername() {
        if (this.username.length === 0) {
            this.openSnackBar("Vous devez rentrer un nom d'utilisateur", 'Fermer');
            return;
        }
        this.waitForGame();
    }

    waitForGame() {
        if (this.data.isSolo) {
            this.sendSoloPlayer();
        } else {
            this.askToPlay();
            this.setUpWaitingMode();
        }
    }

    acceptRequest() {
        this.socketClientService.send('requestAccepted', {
            opponentUsername: this.usernameOpponent,
            opponentSocket: this.socketOpponent,
            roomBase: this.gameId,
        });
    }

    declineRequest() {
        this.socketClientService.send('requestDeclined', this.socketOpponent);
        this.setUpWaitingMode();
    }

    private sendSoloPlayer() {
        this.socketClientService.send('joinRoomSolo', this.username);
    }

    private askToPlay() {
        this.socketClientService.send('askToPlay', { username: this.username, roomBase: this.gameId });
        this.setUpWaitingMode();
    }

    private askerLeft() {
        this.socketClientService.on('leaveAsking', () => {
            this.setUpWaitingMode();
        });
    }

    private requestReceived() {
        this.socketClientService.on('askToPlay', (response: { playerAsking: string; socketPlayerAskingId: string }) => {
            this.socketOpponent = response.socketPlayerAskingId;
            this.setUpRequestMode(response.playerAsking);
        });
    }

    private requestDeclined() {
        this.socketClientService.on('requestDeclined', () => {
            this.setUpRequestDeclinedMode();
        });
    }
    private setUpRequestDeclinedMode() {
        this.isUsernameMode = false;
        this.isWaitingMode = false;
        this.isRequestMode = false;
        this.isRequestDeclinedMode = true;
    }

    private setUpWaitingMode() {
        this.isUsernameMode = false;
        this.isWaitingMode = true;
        this.isRequestMode = false;
        this.isRequestDeclinedMode = false;
        this.dialogRef.disableClose = true;
    }

    private setUpRequestMode(opponentPlayer: string) {
        this.isUsernameMode = false;
        this.isWaitingMode = false;
        this.isRequestMode = true;
        this.isRequestDeclinedMode = false;
        this.usernameOpponent = opponentPlayer;
    }

    private connectWithServer() {
        this.socketClientService.connect();
    }

    private goToGame() {
        this.socketClientService.on('roomID', (response: JoinRoomInterface) => {
            if (response.mode === LIMITED_TIME_COOP || response.mode === 'limited-time-multi') {
                this.ngZone.run(async () => this.router.navigateByUrl('/game/temps-limite'));
            } else {
                this.ngZone.run(async () => this.router.navigateByUrl('/game/' + this.data.gameId));
            }
            this.dialogRef.close();
            this.roomService.newRoomFromServer(response);
        });
    }

    private gameIsNotAvailable() {
        this.socketClientService.on('gameIsNotAvailable', () => {
            this.dialogRef.close();
            this.openSnackBar('Désolé, ce jeu n’existe plus', 'Fermer');
        });
    }

    private openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, { duration: 4000 });
    }
}
