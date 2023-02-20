/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { ImageCanvasGameComponent } from '@app/components/image-canvas-game/image-canvas-game.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CLASSIC_MULTI, LIMITED_TIME_SOLO, TIMEOUT_BLINK } from '@common/constants';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let routerSpy: SpyObj<Router>;
    let matDialogServiceSpy: SpyObj<MatDialog>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
        matDialogServiceSpy = jasmine.createSpyObj('MatDialog', ['open', 'openDialogs']);
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent, ImageCanvasGameComponent],
            imports: [MatDialogModule, FormsModule, BrowserAnimationsModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: MatDialog, useValue: matDialogServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        component['router'] = TestBed.inject(Router);
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('sendMessage() should send a message to the socket', () => {
        const spySocket = spyOn(component['socketClientService'], 'send');
        component['sendMessage']();
        expect(spySocket).toHaveBeenCalled();
    });
    it('gameOver should redirect the user', () => {
        matDialogServiceSpy.open.and.returnValue({ afterClosed: () => of({ name: 'test' }) } as unknown as MatDialogRef<unknown>);
        component['openGameOverDialogue']('victory');
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/selection');
    });
    it('gameOver should redirect the user', () => {
        matDialogServiceSpy.open.and.returnValue({ afterClosed: () => of({ name: 'test' }) } as unknown as MatDialogRef<unknown>);
        component.roomService.game.mode = LIMITED_TIME_SOLO;
        component['openGameOverDialogue']('victory');
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/home');
    });
    it('stopAllSounds will pause all sounds', () => {
        const spyStopSounds = spyOn<any>(component, 'stopSound');
        component['stopAllSounds']();
        component['sounds'].forEach(() => {
            expect(spyStopSounds).toHaveBeenCalled();
        });
    });
    it('drawError handles the ability to click', fakeAsync(() => {
        const pixel = [1, 2];
        const isOriginal = true;
        component['drawError'](pixel[0], pixel[1], isOriginal);
        expect(component['canClick']).toEqual(false);
        tick(TIMEOUT_BLINK);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(component['canClick']).toEqual(true);
        });
    }));
    it('should play sound', () => {
        const sound = new Audio() as HTMLAudioElement;
        component['sounds'].set('victory', sound);
        const spyPlaySound = spyOn<any>(sound, 'play');
        component['playSound']('victory');
        expect(spyPlaySound).toHaveBeenCalled();
    });
    it('should stop sound', () => {
        const sound = new Audio() as HTMLAudioElement;
        const spyStopSound = spyOn<any>(sound, 'pause');
        component['stopSound'](sound);
        expect(spyStopSound).toHaveBeenCalled();
    });
    it('should stop all sound', () => {
        const sound = new Audio() as HTMLAudioElement;
        component['sounds'].set('victory', sound);
        const pauseSoundSpy = spyOn<any>(component, 'stopSound');
        component['stopAllSounds']();
        expect(pauseSoundSpy).toHaveBeenCalled();
    });

    it('functionClick will process the pixel clicked in the original image', () => {
        const number = 3;
        const client = { clientY: 1, clientX: 1 } as MouseEvent;
        spyOn<any>(component, 'sendMessage').and.callFake(() => {});
        component.imageCanvasOriginal.getImageTop = () => {
            return number;
        };
        component.imageCanvasOriginal.getImageLeft = () => {
            return number;
        };
        component.imageCanvasModified.getImageTop = () => {
            return number;
        };
        component.imageCanvasModified.getImageLeft = () => {
            return number;
        };
        const spyGetPixelImage = spyOn<any>(component, 'getPixelImage');
        component.functionClick(client, true);
        expect(spyGetPixelImage).toHaveBeenCalled();
    });

    it('functionClick will process the pixel clicked in modified image', () => {
        const number = 3;
        const client = { clientY: 1, clientX: 1 } as MouseEvent;
        spyOn<any>(component, 'sendMessage').and.callFake(() => {});
        component.imageCanvasOriginal.getImageTop = () => {
            return number;
        };
        const spyGetPixelImage = spyOn<any>(component, 'getPixelImage');
        component.functionClick(client, false);
        expect(spyGetPixelImage).toHaveBeenCalled();
    });

    it('should play soudn and open dialog when game is over', () => {
        const playSoundSpy = spyOn<any>(component, 'playSound');
        const openGameOverDialogueSpy = spyOn<any>(component, 'openGameOverDialogue');
        component['manageEndGame']('victory');
        expect(playSoundSpy).toHaveBeenCalledWith('victory');
        expect(openGameOverDialogueSpy).toHaveBeenCalledWith('victory');
    });
    it('should play soudn and open dialog when game is over', () => {
        component['roomService'].game.mode = CLASSIC_MULTI;
        const modifyImageSpy = spyOn<any>(component.imageCanvasModified, 'makeDifferenceBlink');
        const playSoundSpy = spyOn<any>(component, 'playSound');
        component['manageDifferenceFound']([[1, 1]], true);
        expect(playSoundSpy).toHaveBeenCalledWith('difference');
        expect(modifyImageSpy).toHaveBeenCalled();
    });
    it('should play sound and modify the image', () => {
        component['roomService'].game.mode = LIMITED_TIME_SOLO;
        const modifyImageSpy = spyOn<any>(component.imageCanvasModified, 'makeDifferenceBlink');
        const playSoundSpy = spyOn<any>(component, 'playSound');
        component['manageDifferenceFound']([[1, 1]], false);
        expect(playSoundSpy).not.toHaveBeenCalled();
        expect(modifyImageSpy).not.toHaveBeenCalled();
    });
    it('should manage clue', () => {
        const modifyImageSpy = spyOn<any>(component.imageCanvasModified, 'makeQuadrantBlink');
        component['manageQuadrantClue']([[1, 1]]);
        expect(modifyImageSpy).toHaveBeenCalled();
    });
    it('should manage error found', () => {
        const stopSoundSpy = spyOn<any>(component, 'stopAllSounds');
        const playSoundSpy = spyOn<any>(component, 'playSound');
        const drawErrorSpy = spyOn<any>(component, 'drawError');
        component['manageErrorFound']();
        expect(stopSoundSpy).toHaveBeenCalled();
        expect(playSoundSpy).toHaveBeenCalled();
        expect(drawErrorSpy).toHaveBeenCalled();
    });
    it('should compare the pixels clicked to the image', async () => {
        const client = { clientY: 1, clientX: 1 } as MouseEvent;
        const imageTop = 1;
        const imageLeft = 1;
        const result = component['getPixelImage'](client, imageTop, imageLeft);
        expect(result).toEqual([0, 0]);
    });
    it('should receive emit quadrant', async () => {
        const manageQuadrantClueSpy = spyOn<any>(component, 'manageQuadrantClue');
        component.roomService.quadrant.emit([[1, 1]]);
        expect(manageQuadrantClueSpy).toHaveBeenCalled();
    });
    it('should receive emit differenceFoundEvent', async () => {
        const manageDifferenceFoundSpy = spyOn<any>(component, 'manageDifferenceFound');
        component.roomService.differenceFoundEvent.emit({ pixels: [[1, 1]], playSound: true });
        expect(manageDifferenceFoundSpy).toHaveBeenCalled();
    });
    it('should receive emit errorFoundEvent', async () => {
        const manageErrorSpy = spyOn<any>(component, 'manageErrorFound');
        component.roomService.errorFoundEvent.emit();
        expect(manageErrorSpy).toHaveBeenCalled();
    });
    it('should receive emit victoryEvent', async () => {
        const manageEndGameSpy = spyOn<any>(component, 'manageEndGame');
        component.roomService.victoryEvent.emit();
        expect(manageEndGameSpy).toHaveBeenCalled();
    });
    it('should receive emit defeatEvent', async () => {
        const manageEndGameSpy = spyOn<any>(component, 'manageEndGame');
        component.roomService.defeatEvent.emit();
        expect(manageEndGameSpy).toHaveBeenCalled();
    });
    it('should receive emit drawEvent', async () => {
        const manageEndGameSpy = spyOn<any>(component, 'manageEndGame');
        component.roomService.drawEvent.emit();
        expect(manageEndGameSpy).toHaveBeenCalled();
    });
});
