import { SimpleChange } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { ImageCanvasGameComponent } from './image-canvas-game.component';

describe('ImageCanvasGameComponent', () => {
    let component: ImageCanvasGameComponent;
    let fixture: ComponentFixture<ImageCanvasGameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImageCanvasGameComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ImageCanvasGameComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load image', () => {
        component.imageURL = environment.serverUrl + '/file/blink_image.bmp';
        component.ngOnChanges({
            imageURL: new SimpleChange(null, component.imageURL, false),
        });
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
    it('should return background canvas', () => {
        const backgroundCanvas = component.getCanvasCtxDessin();
        expect(backgroundCanvas).toBeTruthy();
    });
    it('should should throw error when canvas is not defined', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component.background as HTMLCanvasElement, 'getContext').and.returnValue(null);
        try {
            component.getCanvasCtxDessin();
        } catch (e) {
            expect(e).toBeTruthy();
        }
    });
    it('should show error blink on canvas', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>((component.foreground as HTMLCanvasElement).getContext('2d'), 'drawImage');
        component.drawErrorOnBlinkCanvas(0, 0);
        expect(spy).toHaveBeenCalled();
    });
    it('should show blink', () => {
        component.showBlink();
        expect(component.foreground['hidden']).toBeFalsy();
    });
    it('should hide blink', () => {
        component.hideBlink();
        expect(component.foreground.getAttribute('hidden')).toBe('hidden');
    });
    it('should clear blink', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyOnclearRectImage = spyOn<any>((component.foreground as HTMLCanvasElement).getContext('2d'), 'clearRect');
        component.clearBlink();
        expect(spyOnclearRectImage).toHaveBeenCalled();
    });
    it('should clear difference', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component.getCanvasCtxDessin(), 'drawImage').and.callFake(() => {
            return;
        });
        const originalImage: HTMLImageElement = new Image();
        component.clearDifference([[1, 1]], originalImage);
        expect(spy).toHaveBeenCalled();
    });
    it('should make difference blink', fakeAsync(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component, 'drawDifferenceOnBlinkCanvas').and.callFake(() => {
            return;
        });
        spyOn(component, 'clearBlink').and.callFake(() => {
            return;
        });
        spyOn(component, 'clearDifference').and.callFake(() => {
            return;
        });
        const originalImage: HTMLImageElement = new Image();
        component.makeDifferenceBlink([[1, 1]], originalImage);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        tick(2000);
        expect(spy).toHaveBeenCalled();
    }));
    it('should make quadrant blink', fakeAsync(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component, 'drawDifferenceOnBlinkCanvas').and.callFake(() => {
            return;
        });
        spyOn(component, 'clearBlink').and.callFake(() => {
            return;
        });
        component.makeQuadrantBlink([[1, 1]]);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        tick(2500);
        expect(spy).toHaveBeenCalled();
    }));
    it('should return image top', () => {
        const imageTop = component.getImageTop();
        expect(imageTop).toBeGreaterThan(0);
    });
    it('should return image left', () => {
        const imageLeft = component.getImageLeft();
        expect(imageLeft).toBeGreaterThan(0);
    });
    it('should draw difference on blink canvas', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyOnDrawImage = spyOn<any>((component.foreground as HTMLCanvasElement).getContext('2d'), 'drawImage');
        component['drawDifferenceOnBlinkCanvas']([[0, 0]]);
        expect(spyOnDrawImage).toHaveBeenCalled();
    });

    it('should draw on canvas image', () => {
        const src = 'data:image/bmp;base64,Qk16EA4AAAAAADYAAAAoAAAAgAIAACD+//8BABgAAAAAAAAQDgAAAAAAAAAAAAAAAAAAAAAA';
        component['uploadGameImage'](src);
        expect(document.getElementById('canvas-game-' + component.idContainer)).toBeTruthy();
    });
    it('should show blink if not showing when blinking', () => {
        component.isBlinking = false;
        const spy = spyOn(component, 'showBlink');
        component['blinking']();
        expect(spy).toHaveBeenCalled();
    });
    it('should hide blink is already blinking', () => {
        component.isBlinking = true;
        const spy = spyOn(component, 'hideBlink');
        component['blinking']();
        expect(spy).toHaveBeenCalled();
    });
});
