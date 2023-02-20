import { Component, HostListener } from '@angular/core';
import { RoomService } from '@app/services/room-service';

@Component({
    selector: 'app-clues-canvas',
    templateUrl: './clues-canvas.component.html',
    styleUrls: ['./clues-canvas.component.scss'],
})
export class CluesCanvasComponent {
    constructor(public roomService: RoomService) {}

    @HostListener('window:keyup', ['$event'])
    onKeyPress(event: KeyboardEvent) {
        if (event.key === 'i') {
            this.onMouseClick();
        }
    }
    onMouseClick() {
        if (this.isModeSolo(this.roomService.game.mode)) {
            this.roomService.askClueFromServer();
        }
    }

    isModeSolo(mode: string): boolean {
        return mode.includes('solo');
    }
}
