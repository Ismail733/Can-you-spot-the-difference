import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LIMITED_TIME_COOP } from '@common/constants';
import { InfosGameComponent } from './infos-game.component';

describe('InfosGameComponent', () => {
    let component: InfosGameComponent;
    let fixture: ComponentFixture<InfosGameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfosGameComponent],
            providers: [],
        }).compileComponents();

        fixture = TestBed.createComponent(InfosGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set timer for temps limite mode', () => {
        component.roomService.game.mode = LIMITED_TIME_COOP;
        component['initializeInfosPartie']();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.timer).toBe(60);
    });
    it('should set timer for temps limite mode', () => {
        component.roomService.game.maxTime = 5;
        component.roomService.game.time = 10;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.limitedTimeVerifications()).toBeFalsy();
    });
});
