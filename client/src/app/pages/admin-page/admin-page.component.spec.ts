import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { GameCardComponent } from '@app/components/gamecard/gamecard.component';
import { CommunicationService } from '@app/services/communication.service';
import { BONUS, COUNTDOWN, PENALTY } from '@common/constants';
import { of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let service: CommunicationService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent, GameCardComponent],
            imports: [FormsModule, HttpClientModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        service = TestBed.inject(CommunicationService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reset constant', () => {
        component.countdown = 0;
        component.bonus = 0;
        component.penalty = 0;
        const resetButton = fixture.debugElement.query(By.css('#resetConstants'));
        resetButton.triggerEventHandler('click', {});
        expect(component.countdown).toEqual(COUNTDOWN);
        expect(component.penalty).toEqual(PENALTY);
        expect(component.bonus).toEqual(BONUS);
    });

    it('deleteAllGames should subscribe to the service', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'windowReload').and.callFake(() => {});
        const spy = spyOn(service, 'deleteAllGames').and.returnValue(of([]));
        const subSpy = spyOn(service.deleteAllGames(), 'subscribe');
        component.deleteAllGames();
        expect(spy).toHaveBeenCalledBefore(subSpy);
        expect(subSpy).toHaveBeenCalled();
    });

    it('resetBestScores should subscribe to the service', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'windowReload').and.callFake(() => {});
        const spy = spyOn(service, 'resetBestScores').and.returnValue(of([]));
        const subSpy = spyOn(service.resetBestScores(), 'subscribe');
        component.resetBestScores();
        expect(spy).toHaveBeenCalledBefore(subSpy);
        expect(subSpy).toHaveBeenCalled();
    });

    it('window reload', () => {
        const spy = jasmine.createSpy();
        const window = {
            location: {
                reload: spy,
            },
        };
        component['windowReload'](window as unknown as Window);
        expect(spy).toHaveBeenCalled();
    });
});
