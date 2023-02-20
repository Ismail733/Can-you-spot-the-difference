import { Component, Input } from '@angular/core';
import { RoomService } from '@app/services/room-service';
import { LIMITED_TIME_COOP, LIMITED_TIME_SOLO, ONE_MINUTE } from '@common/constants';

@Component({
    selector: 'app-infos-game',
    templateUrl: './infos-game.component.html',
    styleUrls: ['./infos-game.component.scss'],
})
export class InfosGameComponent {
    @Input() name: string;
    minuteChar: string = '00';
    secondChar: string = '00';
    timer: number = 0;

    startTimer: number;
    running = false;
    reloadOnce = false;

    constructor(public roomService: RoomService) {
        this.initializeInfosPartie();
    }

    limitedTimeVerifications(): boolean {
        if (this.roomService.game.maxTime - this.roomService.game.time < 0) {
            return false;
        }
        return this.roomService.game.mode === 'limited-time-coop' || this.roomService.game.mode === 'limited-time-solo';
    }
    private initializeInfosPartie(): void {
        if (this.roomService.game.mode === LIMITED_TIME_SOLO || this.roomService.game.mode === LIMITED_TIME_COOP) {
            this.timer = ONE_MINUTE - this.roomService.game.time;
        } else {
            this.timer = this.roomService.game.time;
        }
    }
}
