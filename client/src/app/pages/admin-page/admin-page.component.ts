import { Component } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { BONUS, COUNTDOWN, PENALTY } from '@common/constants';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    countdown: number = COUNTDOWN;
    penalty: number = PENALTY;
    bonus: number = BONUS;
    constructor(private communicationService: CommunicationService) {}
    resetConstants() {
        this.countdown = COUNTDOWN;
        this.penalty = PENALTY;
        this.bonus = BONUS;
    }
    resetBestScores(): void {
        this.communicationService.resetBestScores().subscribe();
        this.windowReload(window);
    }
    deleteAllGames(): void {
        this.communicationService.deleteAllGames().subscribe();
        this.windowReload(window);
    }
    private windowReload(window: Window): void {
        window.location.reload();
    }
}
