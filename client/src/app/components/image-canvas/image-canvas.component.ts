/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Canvas } from '@app/classes/canvas';
import { HEIGHT, WIDTH } from '@common/constants';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-image-canvas',
    templateUrl: './image-canvas.component.html',
    styleUrls: ['./image-canvas.component.scss'],
})
export class ImageCanvasComponent implements AfterViewInit, OnChanges {
    @Input() idConteneur: string = '1';
    @Input() width: number = WIDTH;
    @Input() height: number = HEIGHT;
    @Input() toolSelected: string = 'brush';
    @Input() sizeSelected: number;
    @Input() colorSelected: string;
    @Input() newImage?: Event;
    loader = false;
    subscription: Subscription;

    canvas: Canvas;

    constructor(private snackBar: MatSnackBar) {}

    ngAfterViewInit(): void {
        this.canvas = new Canvas(this.idConteneur);
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.newImage && !changes.newImage.firstChange && changes.newImage.currentValue) {
            this.importImage(changes.newImage.currentValue);
        }
        if (changes.toolSelected && !changes.toolSelected.firstChange && changes.toolSelected.currentValue) {
            this.canvas.setTool(changes.toolSelected.currentValue);
        }
        if (changes.colorSelected && !changes.colorSelected.firstChange && changes.colorSelected.currentValue) {
            this.canvas.setColor(changes.colorSelected.currentValue);
        }
        if (changes.sizeSelected && !changes.sizeSelected.firstChange && changes.sizeSelected.currentValue) {
            this.canvas.setSize(changes.sizeSelected.currentValue);
        }
    }
    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, { duration: 4000 });
    }

    removeBackground() {
        this.canvas.removeBackground();
    }
    importImage(event: Event): void {
        const eventTarget = event.target as HTMLInputElement;
        if (eventTarget.files) {
            if (eventTarget.files[0] !== null) {
                const file = eventTarget.files[0];
                if (file.type.match('image.bmp')) {
                    this.importBMP(file);
                } else {
                    this.openSnackBar("Le format de l'image n'est pas supporté", 'Fermer');
                }
            }
        }
    }
    async joinCanvas() {
        const canvasJoined = this.canvas.joinCanvas();
        const blob: Promise<Blob> = new Promise((resolve) => this.convertirBlob(canvasJoined, (file: Blob) => resolve(file)));
        return blob;
    }

    importPhotoFromSrc(src: string): void {
        this.loader = true;
        const imgEl = new Image();
        imgEl.src = src;
        imgEl.onload = () => {
            this.loader = false;
            // eslint-disable-next-line deprecation/deprecation
            const as = atob(imgEl.src.split(',')[1]);
            const byteCharacters = as.toString();
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            if (byteNumbers[28] !== 24) {
                this.openSnackBar('Format de fichier non supporté', 'Fermer');
                return;
            }
            if (imgEl.width !== WIDTH || imgEl.height !== HEIGHT) {
                this.openSnackBar("La taille de l'image est invalide", 'Fermer');
                return;
            }
            if (this.canvas.ctxBackground) {
                this.canvas.ctxBackground.drawImage(imgEl, 0, 0);
                this.openSnackBar('Image importée avec succès', 'Fermer');
            }
        };
    }

    importBMP(file: Blob | File): void {
        const lecteurFichier = new FileReader();
        lecteurFichier.readAsDataURL(file);
        lecteurFichier.onload = (evLecture: ProgressEvent<FileReader>) => {
            if (evLecture.target && evLecture.target.result) {
                if (evLecture.target.readyState === FileReader.DONE) {
                    this.importPhotoFromSrc(evLecture.target.result.toString());
                }
            }
        };
    }
    private encoderBMP(canvas: HTMLCanvasElement, callback: (array: ArrayBuffer) => void) {
        const encode = () => {
            while (y < height && block > 0) {
                p = 54 + y * stride;
                x = 0;
                while (x < w4) {
                    block--;
                    v = data32[s++];
                    view.setUint8(p + x + 0, (v & 0xff0000) >> 16);
                    view.setUint8(p + x + 1, (v & 0x00ff00) >> 8);
                    view.setUint8(p + x + 2, v & 0x0000ff);
                    x += 3;
                }
                y++;
            }
            callback(file);
        };
        const set16 = (data: number) => {
            view.setUint16(pos, data, true);
            pos += 2;
        };
        const set32 = (data: number) => {
            view.setUint32(pos, data, true);
            pos += 4;
        };
        const seek = (delta: number) => {
            pos += delta;
        };
        const width = canvas.width;
        const height = canvas.height;
        const w4 = width * 3;
        const idata = (canvas.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, width, height);
        const data32 = new Uint32Array(idata.data.buffer);
        const stride = width * 3;
        const tailleArray = stride * height;
        const tailleFichier = 122 + tailleArray;
        const file = new ArrayBuffer(tailleFichier);
        const view = new DataView(file);
        const blockSize = 1 << 20;
        let block = blockSize;
        let y = 0;
        let x;
        let v;
        let pos = 0;
        let p;
        let s = 0;

        set16(0x4d42);
        set32(tailleFichier);
        seek(4);
        set32(54);
        set32(40);
        set32(width);
        set32(-height >>> 0); // eslint-disable-line no-bitwise
        set16(1);
        set16(24);

        set32(0);
        set32(tailleArray);
        set32(0);
        set32(0);
        set32(0);
        set32(0);
        pos = 54;
        encode();
    }
    private convertirBlob(canvas: HTMLCanvasElement, callback: (donne: Blob) => void) {
        this.encoderBMP(canvas, (fichier: ArrayBuffer) => {
            callback(new Blob([fichier], { type: 'image/bmp' }));
        });
    }
}
