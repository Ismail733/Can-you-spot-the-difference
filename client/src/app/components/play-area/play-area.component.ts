import { AfterViewInit, Component, Input, NgZone, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogueGameOverComponent } from '@app/components/dialogue-game-over/dialogue-game-over.component';
import { ImageCanvasGameComponent } from '@app/components/image-canvas-game/image-canvas-game.component';
import { RoomService } from '@app/services/room-service';
import { SocketClientService } from '@app/services/socket-client.service';
import {
    CLASSIC_MULTI,
    CLASSIC_SOLO,
    DEFEAT,
    DIFFERENCE,
    DRAW,
    ERROR,
    LIMITED_TIME_COOP,
    LIMITED_TIME_SOLO,
    TIMEOUT_BLINK,
    VICTORY,
    X_DRAW_OFFSET,
    Y_DRAW_OFFSET,
} from '@common/constants';
import { GameStatus } from '@common/game-status';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @Input() urlImageOriginal: string;
    @Input() urlImageModified: string;
    @Input() gameIDs: string[];

    @ViewChild('1') imageCanvasOriginal: ImageCanvasGameComponent;
    @ViewChild('2') imageCanvasModified: ImageCanvasGameComponent;

    idCanvasOriginal: string = '1';
    idCanvasModified: string = '2';
    environment = environment;

    private sounds = new Map([
        [ERROR, new Audio(environment.serverUrl + '/file/error_sound.mp3')],
        [DIFFERENCE, new Audio(environment.serverUrl + '/file/difference_sound.mp3')],
        [VICTORY, new Audio(environment.serverUrl + '/file/victory_sound.mp3')],
    ]);

    private isOnImageOriginal: boolean = true;
    private canClick: boolean = true;
    private pixelClicked: [number, number] = [0, 0];
    // eslint-disable-next-line max-params
    constructor(
        private socketClientService: SocketClientService,
        private dialog: MatDialog,
        private router: Router,
        public roomService: RoomService,
        private ngZone: NgZone,
    ) {
        this.connectWithServer();
    }

    ngAfterViewInit(): void {
        this.roomService.quadrant.subscribe((data) => this.manageQuadrantClue(data));
        this.roomService.differenceFoundEvent.subscribe((data: { pixels: [number, number][]; playSound: boolean }) =>
            this.manageDifferenceFound(data.pixels, data.playSound),
        );
        this.roomService.errorFoundEvent.subscribe(() => this.manageErrorFound());
        this.roomService.victoryEvent.subscribe(() => this.manageEndGame(VICTORY));
        this.roomService.defeatEvent.subscribe(() => this.manageEndGame(DEFEAT));
        this.roomService.drawEvent.subscribe(() => this.manageEndGame(DRAW));
    }
    functionClick(event: MouseEvent, isOriginal: boolean) {
        const originalImageTop = this.imageCanvasOriginal.getImageTop();
        const originalImageLeft = this.imageCanvasOriginal.getImageLeft();
        const modifiedImageTop = this.imageCanvasModified.getImageTop();
        const modifiedImageLeft = this.imageCanvasModified.getImageLeft();
        if (isOriginal) {
            this.pixelClicked = this.getPixelImage(event, originalImageTop, originalImageLeft);
        } else {
            this.pixelClicked = this.getPixelImage(event, modifiedImageTop, modifiedImageLeft);
        }
        this.isOnImageOriginal = isOriginal;
        if (this.canClick) {
            this.sendMessage();
        }
    }
    private getPixelImage(event: MouseEvent, imageTop: number, imageLeft: number): [number, number] {
        return [Math.round(event.clientY - imageTop), Math.round(event.clientX - imageLeft)];
    }
    private drawError(pixelX: number, pixelY: number, isOriginal: boolean) {
        this.canClick = false;
        const xToDraw = pixelX - X_DRAW_OFFSET;
        const yToDraw = pixelY - Y_DRAW_OFFSET;
        let canvasClicked = this.imageCanvasModified;
        if (isOriginal) {
            canvasClicked = this.imageCanvasOriginal;
        }
        canvasClicked.showBlink();
        canvasClicked.drawErrorOnBlinkCanvas(xToDraw, yToDraw);
        setTimeout(() => {
            canvasClicked.hideBlink();
            canvasClicked.clearBlink();
            this.canClick = true;
        }, TIMEOUT_BLINK);
    }
    private playSound(effectName: string): void {
        const sound = this.sounds.get(effectName);
        if (sound !== undefined) {
            sound.play();
        }
    }
    private stopSound(value: HTMLAudioElement): void {
        if (value !== undefined) {
            value.pause();
        }
    }
    private stopAllSounds(): void {
        this.sounds.forEach(this.stopSound);
    }
    private openGameOverDialogue(resultGame: string) {
        if (this.dialog.openDialogs.length === 0) {
            const dialogGameOver = this.dialog.open(DialogueGameOverComponent, {
                data: { result: resultGame, username: this.roomService.game.player1.username },
            });
            dialogGameOver.afterClosed().subscribe(() => {
                if (this.roomService.game.mode === LIMITED_TIME_SOLO || this.roomService.game.mode === LIMITED_TIME_COOP) {
                    this.ngZone.run(async () => this.router.navigateByUrl('/home'));
                } else {
                    this.ngZone.run(async () => this.router.navigateByUrl('/selection'));
                }
                this.roomService.game = new GameStatus();
            });
        }
    }
    private connectWithServer() {
        this.socketClientService.connect();
    }
    private sendMessage() {
        this.socketClientService.send('validateDifference', {
            roomID: this.roomService.roomID,
            gameID: this.roomService.game.currentGameID,
            position: { x: this.pixelClicked[1], y: this.pixelClicked[0] },
        });
    }
    private manageEndGame(event: string) {
        this.playSound(event);
        this.openGameOverDialogue(event);
    }
    private manageDifferenceFound(data: [number, number][], playSound: boolean) {
        this.stopAllSounds();
        const originalImage: HTMLImageElement = new Image();
        originalImage.src = environment.serverUrl + '/file/' + this.roomService.game.image1 + '.bmp';
        if (playSound) {
            this.playSound(DIFFERENCE);
        }
        if (this.roomService.game.mode === CLASSIC_MULTI || this.roomService.game.mode === CLASSIC_SOLO) {
            this.imageCanvasModified.makeDifferenceBlink(data, originalImage);
        }
    }
    private manageQuadrantClue(data: [number, number][]) {
        this.imageCanvasModified.makeQuadrantBlink(data);
    }
    private manageErrorFound() {
        this.stopAllSounds();
        this.playSound(ERROR);
        this.drawError(this.pixelClicked[1], this.pixelClicked[0], this.isOnImageOriginal);
    }
}
