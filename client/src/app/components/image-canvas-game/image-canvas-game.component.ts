import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BLINK_INTERVAL, DIFFERENCE_BLINK_TIMEOUT, HEIGHT, QUADRANT_BLINK_TIMEOUT, WIDTH } from '@common/constants';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-image-canvas-game',
    templateUrl: './image-canvas-game.component.html',
    styleUrls: ['./image-canvas-game.component.scss'],
})
export class ImageCanvasGameComponent implements AfterViewInit, OnChanges {
    @Input() idContainer: string = '1';
    @Input() imageURL: string;
    @Input() width: number = WIDTH;
    @Input() height: number = HEIGHT;

    loader = false;
    isBlinking: boolean = true;
    blinkLayer: HTMLCanvasElement;

    background: HTMLElement;
    foreground: HTMLElement;

    private blinkImage: HTMLImageElement;
    private errorImage: HTMLImageElement;

    ngAfterViewInit() {
        this.uploadGameImage(this.imageURL);
        this.blinkImage = new Image();
        this.blinkImage.src = environment.serverUrl + '/file/degrade.bmp';
        this.errorImage = new Image();
        this.errorImage.src = environment.serverUrl + '/file/erreur_click.bmp';
        this.background = document.getElementById('canvas-game-' + this.idContainer) as HTMLElement;
        this.foreground = document.getElementById('canvas-blink-' + this.idContainer) as HTMLElement;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['imageURL'].currentValue !== changes['imageURL'].previousValue) {
            this.uploadGameImage(this.imageURL);
        }
    }

    getCanvasCtxDessin(): CanvasRenderingContext2D {
        const ctxBackground = (this.background as HTMLCanvasElement).getContext('2d');
        if (ctxBackground !== undefined && ctxBackground !== null) {
            return ctxBackground;
        }
        throw new Error('Canvas context is undefined');
    }

    clearDifference(difference: [number, number][], originalImage: HTMLImageElement) {
        for (const pixel of difference) {
            this.getCanvasCtxDessin().drawImage(originalImage, pixel[1], pixel[0], 1, 1, pixel[1], pixel[0], 1, 1);
        }
    }

    makeDifferenceBlink(difference: [number, number][], originalImage: HTMLImageElement) {
        this.drawDifferenceOnBlinkCanvas(difference);
        const stopBlinking = setInterval(() => this.blinking(), BLINK_INTERVAL);
        setTimeout(() => {
            clearInterval(stopBlinking);
            this.clearBlink();
            this.clearDifference(difference, originalImage);
        }, DIFFERENCE_BLINK_TIMEOUT);
    }
    makeQuadrantBlink(difference: [number, number][]) {
        this.drawDifferenceOnBlinkCanvas(difference);
        const stopBlinking = setInterval(() => this.blinking(), BLINK_INTERVAL);
        setTimeout(() => {
            clearInterval(stopBlinking);
            this.clearBlink();
        }, QUADRANT_BLINK_TIMEOUT);
    }

    drawErrorOnBlinkCanvas(positionX: number, positionY: number) {
        const ctxForeground = (this.foreground as HTMLCanvasElement).getContext('2d');
        if (ctxForeground !== undefined && ctxForeground !== null) {
            ctxForeground.drawImage(this.errorImage, positionX, positionY);
        }
    }

    showBlink() {
        this.foreground.removeAttribute('hidden');
    }

    hideBlink() {
        this.foreground.setAttribute('hidden', 'hidden');
    }

    getImageTop(): number {
        return this.background.getBoundingClientRect().top;
    }

    getImageLeft(): number {
        return this.background.getBoundingClientRect().left;
    }

    clearBlink() {
        const ctxForeground = (this.foreground as HTMLCanvasElement).getContext('2d');
        if (ctxForeground !== undefined && ctxForeground !== null) {
            ctxForeground.clearRect(0, 0, this.width, this.height);
        }
    }

    private drawDifferenceOnBlinkCanvas(difference: [number, number][]) {
        const ctxForeground = (this.foreground as HTMLCanvasElement).getContext('2d');
        if (ctxForeground !== undefined && ctxForeground !== null) {
            for (const pixel of difference) {
                ctxForeground.drawImage(this.blinkImage, pixel[1], pixel[0], 1, 1, pixel[1], pixel[0], 1, 1);
            }
        }
    }
    private blinking() {
        this.isBlinking = !this.isBlinking;
        if (this.isBlinking) {
            this.showBlink();
        } else {
            this.hideBlink();
        }
    }

    private uploadGameImage(src: string) {
        this.loader = true;
        const imgEl = new Image();
        imgEl.src = src;
        imgEl.onload = () => {
            this.loader = false;
            const ctx = this.getCanvasCtxDessin();
            if (ctx) {
                ctx.drawImage(imgEl, 0, 0);
            }
        };
    }
}
