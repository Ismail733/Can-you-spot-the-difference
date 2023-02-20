/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { CLASSIC_SOLO, LIMITED_TIME_COOP } from '@common/constants';
import { InfosUserPopUpComponent } from './infos-user-pop-up.component';

describe('InfosUserPopUpComponent', () => {
    let component: InfosUserPopUpComponent;
    let fixture: ComponentFixture<InfosUserPopUpComponent>;

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
            declarations: [InfosUserPopUpComponent],
            imports: [MatDialogModule, FormsModule, AppRoutingModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: mockMatDialogRef },
                { provide: MatSnackBar, useValue: mockMatSnackBar },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(InfosUserPopUpComponent);
        component = fixture.componentInstance;
        component['router'] = TestBed.inject(Router);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should send to socket leaveWaiting', () => {
        const spy = spyOn<any>(component['socketClientService'], 'send');
        const event = 'leaveWaiting';
        component.leaveWaiting();
        expect(spy).toHaveBeenCalledWith(event, component.gameId);
    });
    it('should send to socket leaveAsking', () => {
        const spy = spyOn<any>(component['socketClientService'], 'send');
        const event = 'leaveAsking';
        component.leaveAsking();
        expect(spy).toHaveBeenCalledWith(event, component.gameId);
    });
    it('should call sendSoloPlayer', () => {
        const spy = spyOn<any>(component, 'sendSoloPlayer');
        component.data.isSolo = true;
        component.waitForGame();
        expect(spy).toHaveBeenCalled();
    });
    it('should call setUpwaitingMode', () => {
        const spy = spyOn<any>(component, 'setUpWaitingMode');
        component.data.isSolo = false;
        component.waitForGame();
        expect(spy).toHaveBeenCalled();
    });
    it('should accept request to play', () => {
        const spy = spyOn<any>(component['socketClientService'], 'send');
        const event = 'requestAccepted';
        component.acceptRequest();
        expect(spy).toHaveBeenCalledWith(event, {
            opponentUsername: component.usernameOpponent,
            opponentSocket: component.socketOpponent,
            roomBase: component.gameId,
        });
    });
    it('should decline a request', () => {
        const spy = spyOn<any>(component['socketClientService'], 'send');
        const event = 'requestDeclined';
        component.socketOpponent = 'test';
        component.declineRequest();
        expect(spy).toHaveBeenCalledWith(event, component.socketOpponent);
    });
    it('should remoce player how quit waiting room', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action({} as T);

            return '0';
        });
        const spy = spyOn<any>(component, 'setUpWaitingMode');
        component['askerLeft']();
        expect(spy).toHaveBeenCalled();
    });
    it('should process a received request', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action({} as T);

            return '0';
        });
        const spy = spyOn<any>(component, 'setUpRequestMode');
        component['requestReceived']();
        expect(spy).toHaveBeenCalled();
    });
    it('should decline a request', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action({ socketPlayerAsking: 'hello', playerAsking: 'test' } as unknown as T);

            return '0';
        });
        const spy = spyOn<any>(component, 'setUpRequestDeclinedMode');
        component['requestDeclined']();
        expect(spy).toHaveBeenCalled();
    });
    it('shoudl set up deblode request', () => {
        component['setUpRequestDeclinedMode']();
        expect(component.isUsernameMode).toEqual(false);
        expect(component.isWaitingMode).toEqual(false);
        expect(component.isRequestMode).toEqual(false);
        expect(component.isRequestDeclinedMode).toEqual(true);
    });
    it('should set up waiting mode', () => {
        component['setUpWaitingMode']();
        expect(component.isUsernameMode).toEqual(false);
        expect(component.isWaitingMode).toEqual(true);
        expect(component.isRequestMode).toEqual(false);
        expect(component.isRequestDeclinedMode).toEqual(false);
        expect(component.dialogRef.disableClose).toEqual(true);
    });
    it('should set up resquest mode', () => {
        component['setUpRequestMode']('opponent');
        expect(component.isUsernameMode).toEqual(false);
        expect(component.isWaitingMode).toEqual(false);
        expect(component.isRequestMode).toEqual(true);
        expect(component.isRequestDeclinedMode).toEqual(false);
        expect(component.usernameOpponent).toEqual('opponent');
    });
    it('should connect with server', () => {
        const spy = spyOn<any>(component['socketClientService'], 'connect');
        component['connectWithServer']();
        expect(spy).toHaveBeenCalled();
    });
    it('should navigate to game', () => {
        const spy = spyOn<any>(component['roomService'], 'newRoomFromServer');
        spyOn(component['socketClientService'], 'on').and.callFake(<JoinRoomInterface>(event: string, action: (data: JoinRoomInterface) => void) => {
            action({ roomID: '123', mode: CLASSIC_SOLO } as unknown as JoinRoomInterface);

            return '0';
        });
        component['goToGame']();
        expect(spy).toHaveBeenCalled();
    });
    it('should open snack bar', () => {
        spyOn(component['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action({} as T);
            return '0';
        });
        const spy = spyOn<any>(component, 'openSnackBar');
        component['gameIsNotAvailable']();
        expect(spy).toHaveBeenCalled();
    });
    it('should open snack bar', () => {
        const spy = spyOn<any>(component.snackBar, 'open');
        component['openSnackBar']('hello', 'test');
        expect(spy).toHaveBeenCalled();
    });
    it('should call waitForGame when username is valid', () => {
        const spy = spyOn<any>(component, 'waitForGame');
        component.username = 'username';
        component.checkUsername();
        expect(spy).toHaveBeenCalled();
    });
    it('should open snack bar when username is not valid', () => {
        const spy = spyOn<any>(component, 'openSnackBar');
        component.username = '';
        component.checkUsername();
        expect(spy).toHaveBeenCalled();
    });
    it('should send solo player', () => {
        const spy = spyOn<any>(component['socketClientService'], 'send');
        const event = 'joinRoomSolo';
        component.username = 'dodo';
        component['sendSoloPlayer']();
        expect(spy).toHaveBeenCalledWith(event, 'dodo');
    });
    it('should redirect player when going to game', () => {
        const spy = spyOn<any>(component['router'], 'navigateByUrl');
        spyOn(component['socketClientService'], 'on').and.callFake(<JoinRoomInterface>(event: string, action: (data: JoinRoomInterface) => void) => {
            action({ roomID: '123', mode: LIMITED_TIME_COOP } as unknown as JoinRoomInterface);

            return '0';
        });
        component['goToGame']();
        expect(spy).toHaveBeenCalled();
    });
});
