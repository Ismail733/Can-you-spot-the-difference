/* eslint-disable @typescript-eslint/no-explicit-any */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { CLASSIC_SOLO, LIMITED_TIME_COOP } from '@common/constants';
import { LimitedTimeSelectionComponent } from './limited-time-selection.component';

describe('LimitedTimeSelectionComponent', () => {
    let component: LimitedTimeSelectionComponent;
    let fixture: ComponentFixture<LimitedTimeSelectionComponent>;

    beforeEach(async () => {
        const mockMatSnackBar = {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            open: () => {},
        };
        const mockMatDialogRef = {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            close: () => {},
        };

        await TestBed.configureTestingModule({
            declarations: [LimitedTimeSelectionComponent],
            imports: [MatDialogModule, AppRoutingModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: mockMatDialogRef },
                { provide: MatSnackBar, useValue: mockMatSnackBar },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LimitedTimeSelectionComponent);
        component = fixture.componentInstance;
        component['router'] = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should send to socket joinRoomSoloLimitedTime', () => {
        const spy = spyOn<any>(component['socketClientService'], 'send');
        const event = 'joinRoomSoloLimitedTime';
        component.playLimitedTimeSolo();
        expect(spy).toHaveBeenCalledWith(event, component.username);
    });

    it('should send to socket askToPlay', () => {
        const spy = spyOn<any>(component['socketClientService'], 'send');
        const event = 'askToPlay';
        component.joinLimitedTimeCoop();
        expect(spy).toHaveBeenCalledWith(event, { username: component.username, roomBase: 'limited-time' });
    });

    it('should send to socket leaveWaiting', () => {
        const spy = spyOn<any>(component['socketClientService'], 'send');
        const event = 'leaveWaiting';
        component.leaveWaiting();
        expect(spy).toHaveBeenCalledWith(event, 'limited-time');
    });

    it('should connect to server', () => {
        const spy = spyOn<any>(component['socketClientService'], 'connect');
        component['connectWithServer']();
        expect(spy).toHaveBeenCalled();
    });

    it('should go to game when receiving a roomID', () => {
        const spy = spyOn<any>(component['roomService'], 'newRoomFromServer');
        spyOn(component['socketClientService'], 'on').and.callFake(<JoinRoomInterface>(event: string, action: (data: JoinRoomInterface) => void) => {
            action({ roomID: '', mode: LIMITED_TIME_COOP } as unknown as JoinRoomInterface);

            return '0';
        });
        component['goToGame']();
        expect(spy).toHaveBeenCalled();
    });

    it('should close dialog if not the right mode', () => {
        const spy = spyOn<any>(component['dialogRef'], 'close');
        spyOn(component['socketClientService'], 'on').and.callFake(<JoinRoomInterface>(event: string, action: (data: JoinRoomInterface) => void) => {
            action({ roomID: '', mode: CLASSIC_SOLO } as unknown as JoinRoomInterface);

            return '0';
        });
        component['goToGame']();
        expect(spy).toHaveBeenCalled();
    });

    it('should initialize waiting status', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action('limited-time:true' as unknown as T);

            return '0';
        });
        component['initializeWaitingStatus']();
        expect(component.isSomeoneWaiting).toBeTrue();
    });

    it('should turn isSomeoneWaiting to true when receiving this', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action('limited-time' as unknown as T);

            return '0';
        });
        component['playerWaiting']();
        expect(component.isSomeoneWaiting).toBeTrue();
    });

    it('should turn isSomeoneWaiting to false when classic mode', () => {
        component.isSomeoneWaiting = false;
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action('multi' as unknown as T);

            return '0';
        });
        component['playerWaiting']();
        expect(component.isSomeoneWaiting).toBeFalse();
    });

    it('should turn isSomeoneWaiting to false when receiving this', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action('limited-time' as unknown as T);

            return '0';
        });
        component['noPlayerWaiting']();
        expect(component.isSomeoneWaiting).toBeFalse();
    });

    it('should turn isSomeoneWaiting to true when classic mode', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action('multi' as unknown as T);

            return '0';
        });
        component['noPlayerWaiting']();
        expect(component.isSomeoneWaiting).toBeTrue();
    });

    it('should open snackbar when no username entered', () => {
        const spy = spyOn<any>(component, 'openSnackBar').and.callFake(() => {
            return;
        });
        component.username = '';
        component.checkUsername('solo');
        expect(spy).toHaveBeenCalled();
    });

    it('should open snackbar', () => {
        const spy = spyOn<any>(component.snackBar, 'open').and.callFake(() => {
            return;
        });
        component.username = '';
        component.checkUsername('solo');
        expect(spy).toHaveBeenCalled();
    });

    it('should go to play solo', () => {
        const spy = spyOn<any>(component, 'playLimitedTimeSolo').and.callFake(() => {
            return;
        });
        component.username = 'dodo';
        component.checkUsername('solo');
        expect(spy).toHaveBeenCalled();
    });

    it('should go to play coop', () => {
        const spy = spyOn<any>(component, 'joinLimitedTimeCoop').and.callFake(() => {
            return;
        });
        component.username = 'dodo';
        component.checkUsername('coop');
        expect(spy).toHaveBeenCalled();
    });
});
