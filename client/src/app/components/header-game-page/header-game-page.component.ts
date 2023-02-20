import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { InfosGameComponent } from '@app/components/infos-game/infos-game.component';
import { RoomService } from '@app/services/room-service';

@Component({
    selector: 'app-header-game-page',
    templateUrl: './header-game-page.component.html',
    styleUrls: ['./header-game-page.component.scss'],
})
export class HeaderGamePageComponent implements OnChanges {
    @ViewChild('1') infosGame!: InfosGameComponent;
    @Input() gameName: string;
    name: string;

    constructor(public roomService: RoomService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['gameName']) {
            this.name = changes['gameName'].currentValue;
        }
    }
}
