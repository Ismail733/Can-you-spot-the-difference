import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LimitedTimeSelectionComponent } from '@app/components/limited-time-selection/limited-time-selection.component';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'Jeu des Différences';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    username: string = '';

    constructor(public dialog: MatDialog) {}

    openLimitedTimeSelection() {
        this.dialog.open(LimitedTimeSelectionComponent, {
            data: { username: this.username },
        });
    }
}
