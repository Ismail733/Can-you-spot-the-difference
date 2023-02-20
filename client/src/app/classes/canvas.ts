import { HEIGHT, WIDTH } from '@common/constants';
export class Canvas {
    foreGround: HTMLElement;
    backGround: HTMLElement;
    ctxDrawing: CanvasRenderingContext2D | null;
    ctxBackground: CanvasRenderingContext2D | null;
    tool: string;
    color: string;
    size: number;
    lastMouseX: number;
    lastMouseY: number;
    mouseDown: boolean;
    mouseX: number;
    mouseY: number;
    constructor(id: string) {
        this.foreGround = document.getElementById('canvas-dessin-' + id) as HTMLElement;
        this.backGround = document.getElementById('canvas-image-' + id) as HTMLElement;
        this.ctxDrawing = (this.foreGround as HTMLCanvasElement).getContext('2d');
        this.ctxBackground = (this.backGround as HTMLCanvasElement).getContext('2d');
        this.tool = 'brush';
        this.color = '#000000';
        this.size = 10;

        this.initDrawing();
        this.removeBackground();
    }
    setTool(tool: string) {
        this.tool = tool;
    }
    setColor(color: string) {
        this.color = color;
    }
    setSize(size: number) {
        this.size = size;
    }
    joinCanvas(): HTMLCanvasElement {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = (this.foreGround as HTMLCanvasElement).width;
        canvas.height = (this.foreGround as HTMLCanvasElement).height;
        const ctx = canvas.getContext('2d');
        if (ctx !== undefined && ctx !== null) {
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            ctx.drawImage(this.backGround as HTMLCanvasElement, 0, 0);
            ctx.drawImage(this.foreGround as HTMLCanvasElement, 0, 0);
        }
        return canvas;
    }
    removeBackground() {
        if (this.ctxBackground !== undefined && this.ctxBackground !== null) {
            this.ctxBackground.beginPath();
            this.ctxBackground.rect(0, 0, WIDTH, HEIGHT);
            this.ctxBackground.fillStyle = 'white';
            this.ctxBackground.fill();
        }
    }
    private getMouseCoordinates(e: MouseEvent): [number, number] {
        const canvasX = this.foreGround.getBoundingClientRect().left;
        const canvasY = this.foreGround.getBoundingClientRect().top;
        const mouseX = e.clientX - canvasX;
        const mouseY = e.clientY - canvasY;
        return [mouseX, mouseY];
    }

    private setMouseCoordinates(e: MouseEvent) {
        [this.lastMouseX, this.lastMouseY] = this.getMouseCoordinates(e);
        [this.mouseX, this.mouseY] = this.getMouseCoordinates(e);
    }

    private onMouseMove(e: MouseEvent) {
        [this.mouseX, this.mouseY] = this.getMouseCoordinates(e);
        if (this.mouseDown) {
            this.draw();
        }
        [this.lastMouseX, this.lastMouseY] = [this.mouseX, this.mouseY];
    }

    private onMouseDown(e: MouseEvent) {
        this.setMouseCoordinates(e);
        this.mouseDown = true;
    }

    private onMouseUp() {
        this.mouseDown = false;
    }

    private initDrawing() {
        this.foreGround.onmousemove = (e: MouseEvent) => {
            this.onMouseMove(e);
        };
        this.foreGround.onmousedown = (e: MouseEvent) => {
            this.onMouseDown(e);
        };
        this.foreGround.onmouseup = () => {
            this.onMouseUp();
        };
    }
    private beginDrawing() {
        if (this.ctxDrawing !== undefined && this.ctxDrawing !== null) {
            this.ctxDrawing.beginPath();
            if (this.tool === 'brush') {
                this.ctxDrawing.globalCompositeOperation = 'source-over';
                this.ctxDrawing.strokeStyle = this.color;
                this.ctxDrawing.lineWidth = this.size;
                this.ctxDrawing.lineCap = 'round';
            } else {
                this.ctxDrawing.globalCompositeOperation = 'destination-out';
                this.ctxDrawing.lineWidth = this.size;
                this.ctxDrawing.lineCap = 'square';
            }
        }
    }

    private continueDrawing() {
        if (this.ctxDrawing !== undefined && this.ctxDrawing !== null) {
            this.ctxDrawing.moveTo(this.lastMouseX, this.lastMouseY);
            this.ctxDrawing.lineTo(this.mouseX, this.mouseY);
            this.ctxDrawing.lineJoin = 'round';
            this.ctxDrawing.stroke();
        }
    }

    private draw() {
        this.beginDrawing();
        this.continueDrawing();
    }
}
