import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { GameCardComponent } from '@app/components/gamecard/gamecard.component';
import { Game } from '@app/interfaces/game.interface';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    const game1: Game = { _id: '0', name: 'Game1', image1: '', image2: '', nbDifferences: 5, bestDuo: [], bestSolo: [] };
    let service: CommunicationService;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            imports: [MatDialogModule, HttpClientModule],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        component.game = game1;
        fixture.detectChanges();
        service = TestBed.inject(CommunicationService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getUsername() should open a dialog', () => {
        const openDialogSpy = spyOn(component.dialog, 'open');
        const isSolo = true;
        component.getUsername(isSolo);
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('clicking on delete should alert the parent', () => {
        spyOn(component.delete, 'emit');
        const deleteButton = fixture.debugElement.query(By.css('#deleteButton'));
        deleteButton.triggerEventHandler('click', {});
        fixture.detectChanges();
        expect(component.delete.emit).toHaveBeenCalled();
    });

    it('clicking on reset should reset the game best score', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'windowReload').and.callFake(() => {});
        const spyBestScore = spyOn(component, 'resetBestScore');
        const resetScoreButton = fixture.debugElement.query(By.css('#resetScoreButton'));
        resetScoreButton.triggerEventHandler('click', {});
        expect(spyBestScore).toHaveBeenCalledWith();
    });

    it('reset best score will call the service', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'windowReload').and.callFake(() => {});
        const spy = spyOn(service, 'resetBestScore').and.returnValue(of([]));
        const subSpy = spyOn(service.resetBestScore(component.game), 'subscribe');
        component.resetBestScore();
        expect(spy).toHaveBeenCalledBefore(subSpy);
        expect(subSpy).toHaveBeenCalled();
    });

    it('if no player waits the button should say Créer', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action('12:true' as unknown as T);
            return 'hello,mathieu';
        });
        // eslint-disable-next-line no-underscore-dangle
        component.game._id = '12:true';
        component['noPlayerWaiting']();
        expect(component.textButton).toEqual('Créer');
    });

    it('if player waits the button should say Créer', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action('12:true' as unknown as T);
            return 'hello,mathieu';
        });
        // eslint-disable-next-line no-underscore-dangle
        component.game._id = '10:true';
        component['playerWaiting']();
        expect(component.textButton).toEqual('Créer');
    });

    it('if no player waits the button should say Créer', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action('12:true' as unknown as T);
            return 'hello,mathieu';
        });
        // eslint-disable-next-line no-underscore-dangle
        component.game._id = '10:true';
        component['noPlayerWaiting']();
        expect(component.textButton).toEqual('Créer');
    });

    it('if  player waits the button should say Rejoindre', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action('12:true' as unknown as T);
            return 'hello,mathieu';
        });
        // eslint-disable-next-line no-underscore-dangle
        component.game._id = '12:true';
        component['playerWaiting']();
        expect(component.textButton).toEqual('Rejoindre');
    });
    it('if player is waiting should say Rejoindre', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action('12:false' as unknown as T);
            return 'hello,mathieu';
        });
        // eslint-disable-next-line no-underscore-dangle
        component.game._id = '12';
        component['initializeWaitingStatus']();
        expect(component.textButton).toEqual('Créer');
    });

    it('if player is waiting should say Rejoindre', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action('12:true' as unknown as T);
            return 'hello,mathieu';
        });
        // eslint-disable-next-line no-underscore-dangle
        component.game._id = '12';
        component['initializeWaitingStatus']();
        expect(component.textButton).toEqual('Rejoindre');
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
