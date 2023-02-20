/* eslint-disable @typescript-eslint/no-explicit-any */
import { SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DEFAULT_SIZE } from '@common/constants';
import { ImageCanvasComponent } from './image-canvas.component';
describe('ImageCanvasComponent', () => {
    let component: ImageCanvasComponent;
    let fixture: ComponentFixture<ImageCanvasComponent>;
    let blob1: Blob;
    const mockMatSnackBar = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        open: () => {},
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImageCanvasComponent],
            providers: [{ provide: MatSnackBar, useValue: mockMatSnackBar }],
        }).compileComponents();
        fixture = TestBed.createComponent(ImageCanvasComponent);
        TestBed.inject(MatSnackBar);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should reject image that are not bmp', () => {
        const spy = spyOn(component, 'openSnackBar');
        component.importImage({ target: { files: [new File([new ArrayBuffer(1)], 'file.png', { type: 'image.png' }) as File] } } as unknown as Event);
        expect(spy).toHaveBeenCalledOnceWith("Le format de l'image n'est pas supporté", 'Fermer');
    });
    it('should accept valide image', () => {
        spyOn<any>(component, 'importBMP');
        component.importImage({ target: { files: [new File([blob1], 'file.bmp', { type: 'image/bmp' }) as File] } } as unknown as Event);
        expect(component['importBMP']).toHaveBeenCalled();
    });
    it('should accept valid image', () => {
        const canvasBefore = component.canvas.ctxBackground;
        const src = 'data:image/bmp;base64,Qk16EA4AAAAAADYAAAAoAAAAgAIAACD+//8BABgAAAAAAAAQDgAAAAAAAAAAAAAAAAAAAAAA';
        component.importPhotoFromSrc(src);
        expect(canvasBefore).not.toBeNull();
    });
    it('should reject image that are not the right size', () => {
        const canvasBefore = component.canvas.ctxBackground;
        const src = 'data:image/bmp;base64,Qk02AAMAAAAAADYAAAAoAAAAAAEAAAABAAABABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP';
        component.importPhotoFromSrc(src);
        expect(canvasBefore).toEqual(component.canvas.ctxBackground);
    });
    it('should reject image that are invalid format', () => {
        const canvasBefore = component.canvas.ctxBackground;
        const src =
            'data:image/bmp;base64,Qk02/wAAAAAAADYAAAAoAAAA/wAAAP8AAAABAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
            +'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
            'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
        component.importPhotoFromSrc(src);
        expect(canvasBefore).toEqual(component.canvas.ctxBackground);
    });
    it('should join foreground and background', async () => {
        const blob = await component.joinCanvas();
        expect(blob).toBeTruthy();
        expect(blob).toEqual(new Blob());
    });
    it('should clear background', async () => {
        const spy = spyOn(component.canvas, 'removeBackground');
        component.removeBackground();
        expect(spy).toHaveBeenCalled();
    });
    it('should change the tool', async () => {
        const change = { toolSelected: { currentValue: 'eraser' } } as unknown as SimpleChanges;
        component.ngOnChanges(change);
        expect(component.canvas.tool).toEqual('eraser');
    });
    it('should change the color', async () => {
        const change = { colorSelected: { currentValue: 'red' } } as unknown as SimpleChanges;
        component.ngOnChanges(change);
        expect(component.canvas.color).toEqual('red');
    });
    it('should change the size', async () => {
        const change = { sizeSelected: { currentValue: DEFAULT_SIZE } } as unknown as SimpleChanges;
        component.ngOnChanges(change);
        expect(component.canvas.size).toEqual(DEFAULT_SIZE);
    });
    it('should change the image', async () => {
        const spy = spyOn(component, 'importBMP');
        const change = {
            newImage: {
                currentValue: { target: { files: [new File([blob1], 'file.bmp', { type: 'image/bmp' }) as File] } } as unknown as Event,
                firstChange: false,
            },
        } as unknown as SimpleChanges;
        component.ngOnChanges(change);
        expect(spy).toHaveBeenCalled();
    });
});
