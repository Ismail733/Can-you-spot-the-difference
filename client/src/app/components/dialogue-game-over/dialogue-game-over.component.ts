import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DEFEAT, DRAW, MSG_DEFEAT, MSG_DRAW, MSG_VICTORY, VICTORY } from '@common/constants';

@Component({
    selector: 'app-dialogue-game-over',
    templateUrl: './dialogue-game-over.component.html',
    styleUrls: ['./dialogue-game-over.component.scss'],
})
export class DialogueGameOverComponent {
    username: string;
    message: string;
    constructor(@Inject(MAT_DIALOG_DATA) public data: { result: string; username: string }) {
        this.username = data.username;
        if (this.isVictory(data.result)) {
            this.setUpVictory();
        }
        if (this.isDefeat(data.result)) {
            this.setUpDefeat();
        }
        if (this.isDraw(data.result)) {
            this.setUpDraw();
        }
    }

    private isVictory(result: string): boolean {
        return result === VICTORY;
    }

    private isDefeat(result: string): boolean {
        return result === DEFEAT;
    }

    private isDraw(result: string): boolean {
        return result === DRAW;
    }

    private setUpVictory() {
        this.message = MSG_VICTORY;
    }

    private setUpDefeat() {
        this.message = MSG_DEFEAT;
    }

    private setUpDraw() {
        this.message = MSG_DRAW;
    }
}
