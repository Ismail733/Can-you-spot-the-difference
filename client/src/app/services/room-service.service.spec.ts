import { TestBed } from '@angular/core/testing';
import { CLASSIC_SOLO } from '@common/constants';
import { RoomService } from './room-service';

describe('RoomService', () => {
    let service: RoomService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RoomService);
        spyOn(service['socketClientService'], 'on').and.callFake(<T>(event: string, action: (data: T) => void) => {
            action({} as T);

            return '0';
        });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send to socket quitGame', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['socketClientService'], 'send');
        service.quitGame();
        expect(spy).toHaveBeenCalled();
    });

    it('should send to socket indiceCanvas', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['socketClientService'], 'send');
        service.askClueFromServer();
        expect(spy).toHaveBeenCalled();
    });

    it('should initialize new room', () => {
        service.newRoomFromServer({ roomID: '123', mode: CLASSIC_SOLO });
        expect(service.roomID).toBe('123');
    });

    it('should emit quadrant', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['quadrant'], 'emit');
        service['pixelOfDifference']();
        expect(spy).toHaveBeenCalled();
    });

    it('should emit differenceFoundEvent', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['differenceFoundEvent'], 'emit');
        service['initDifferenceSocket']();
        expect(spy).toHaveBeenCalled();
    });

    it('should emit errorFoundEvent', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['errorFoundEvent'], 'emit');
        service['initErrorSocket']();
        expect(spy).toHaveBeenCalled();
    });

    it('should emit victoryEvent', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['victoryEvent'], 'emit');
        service['initVictorySocket']();
        expect(spy).toHaveBeenCalled();
    });

    it('should emit defeatEvent', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['defeatEvent'], 'emit');
        service['initDefeatSocket']();
        expect(spy).toHaveBeenCalled();
    });

    it('should emit drawEvent', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['drawEvent'], 'emit');
        service['initDrawSocket']();
        expect(spy).toHaveBeenCalled();
    });

    it('should update game', () => {
        service['gameUpdate']();
        expect(service.game).toBeDefined();
    });
});
