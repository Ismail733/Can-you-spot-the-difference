/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { DrawingAreaComponent } from './drawing-area.component';
import { CommunicationService } from '@app/services/communication.service';
import { ImageCanvasComponent } from '@app/components/image-canvas/image-canvas.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { DEFAULT_SIZE } from '@common/constants';
import SpyObj = jasmine.SpyObj;

describe('DrawingAreaComponent', () => {
    let component: DrawingAreaComponent;
    let fixture: ComponentFixture<DrawingAreaComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let matDialogServiceSpy: SpyObj<MatDialog>;
    let routerSpy: SpyObj<Router>;
    let blob: Blob;
    beforeEach(async () => {
        const mockMatSnackBar = {
            open: () => {},
        };
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['validateGame', 'createGame']);
        communicationServiceSpy.validateGame.and.returnValue(of({ name: 'test', image: blob, nbDifferences: '5' }));
        communicationServiceSpy.createGame.and.returnValue(of('ok'));
        matDialogServiceSpy = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatCardModule, MatRadioModule, MatIconModule],
            declarations: [DrawingAreaComponent, ImageCanvasComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatDialog, useValue: matDialogServiceSpy },
                { provide: MatSnackBar, useValue: mockMatSnackBar },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(DrawingAreaComponent);
        component = fixture.componentInstance;
        TestBed.inject(MatSnackBar);
        fixture.detectChanges();
    });
    it('should remove the image', () => {
        component.removeBackground(true, true);
        expect(component.hasImage1).toBeFalsy();
    });
    it('should add the image 1', () => {
        component.canvas1.importImage = () => {};
        component.setImage1({ target: { files: [new File([blob], 'file.bmp', { type: 'image/bmp' }) as File] } } as unknown as Event);
        expect(component.hasImage1).toBeTruthy();
    });
    it('should add image 2', () => {
        component.canvas2.importImage = () => {};
        component.setImage2({ target: { files: [new File([blob], 'file.bmp', { type: 'image/bmp' }) as File] } } as unknown as Event);
        expect(component.hasImage2).toBeTruthy();
    });
    it('should add both image', () => {
        component.canvas2.importImage = () => {};
        component.canvas2.importImage = () => {};
        component.setImageAll({ target: { files: [new File([blob], 'file.bmp', { type: 'image/bmp' }) as File] } } as unknown as Event);
        expect(component.hasImage1).toBeTruthy();
        expect(component.hasImage2).toBeTruthy();
    });
    it('should set the tool', () => {
        component.setTool('eraser');
        expect(component.toolSelected).toEqual('eraser');
    });
    it('should set the size', () => {
        component.setSize(DEFAULT_SIZE);
        expect(component.sizeSelected).toEqual(DEFAULT_SIZE);
    });
    it('should set the color', () => {
        component.setColor('red');
        expect(component.colorSelected).toEqual('red');
    });
    it('should set the radius', () => {
        component.setRadius(3);
        expect(component.radius).toEqual(3);
    });
    it('should open openSnackBar', () => {
        component.openSnackBar('hello', 'ok');
        expect(component.openSnackBar).toBeTruthy();
    });
    it('should call validate game in communication service', () => {
        spyOn<any>(component, 'createGame');
        component.canvas1.joinCanvas = async () => {
            return new Promise<Blob>((resolve) => {
                resolve(blob);
            });
        };
        component.canvas2.joinCanvas = async () => {
            return new Promise<Blob>((resolve) => {
                resolve(blob);
            });
        };
        component.hasImage1 = true;
        component.hasImage2 = true;
        matDialogServiceSpy.open.and.returnValue({ afterClosed: () => of({ name: 'test', valider: true }) } as unknown as MatDialogRef<unknown>);
        component.validateGame();
        expect(component['createGame']).not.toHaveBeenCalled();
    });
    it('should call validate game in communication service', () => {
        spyOn<any>(component, 'createGame');
        component.canvas1.joinCanvas = async () => {
            return new Promise<Blob>((resolve) => {
                resolve(blob);
            });
        };
        component.canvas2.joinCanvas = async () => {
            return new Promise<Blob>((resolve) => {
                resolve(blob);
            });
        };
        communicationServiceSpy.validateGame.and.returnValue(of({ name: 'test', image: blob, nbDifferences: '1' }));
        component.hasImage1 = true;
        component.hasImage2 = true;
        matDialogServiceSpy.open.and.returnValue({ afterClosed: () => of({ name: 'test', valider: true }) } as unknown as MatDialogRef<unknown>);
        component.validateGame();
        expect(component['createGame']).not.toHaveBeenCalled();
    });
    it('should call createGame in communication service', () => {
        spyOn<any>(component, 'createGame');
        component.canvas1.joinCanvas = async () => {
            return new Promise<Blob>((resolve) => {
                resolve(blob);
            });
        };
        component.canvas2.joinCanvas = async () => {
            return new Promise<Blob>((resolve) => {
                resolve(blob);
            });
        };
        component.createGame();
        expect(component['createGame']).toHaveBeenCalled();
    });
});
