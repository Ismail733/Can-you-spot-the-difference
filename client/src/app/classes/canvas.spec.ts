import { Canvas } from '@app/classes/canvas';

describe('Canvas', () => {
    let canvas: Canvas;

    beforeEach(() => {
        document.body.innerHTML =
            '<canvas width="640" height="480" id="canvas-image-1" class="canvas-image">' +
            '</canvas><canvas width="640" height="480" id="canvas-dessin-1" class="canvas-image"></canvas>';
        canvas = new Canvas('1');
    });

    it('should be created', () => {
        expect(canvas).toBeTruthy();
    });

    it('should find the two canvas in the DOM', () => {
        expect(canvas.backGround).toBeInstanceOf(HTMLCanvasElement);
        expect(canvas.foreGround).toBeInstanceOf(HTMLCanvasElement);
        expect(canvas.foreGround.onmousemove).toBeInstanceOf(Function);
    });
    it('should change the tool', () => {
        canvas.setTool('eraser');
        expect(canvas.tool).toEqual('eraser');
    });
    it('should change the color', () => {
        canvas.setColor('red');
        expect(canvas.color).toEqual('red');
    });
    it('should change the size', () => {
        canvas.setSize(3);
        expect(canvas.size).toEqual(3);
    });

    it('should creation function to move brush', () => {
        const mouseEvent = {
            offsetX: 100,
            offsetY: 100,
            button: 0,
        } as MouseEvent;
        if (canvas.foreGround.onmousemove && canvas.foreGround.onmousedown && canvas.foreGround.onmouseup) {
            canvas.foreGround.onmousedown(mouseEvent);
            canvas.foreGround.onmousemove(mouseEvent);
            canvas.foreGround.onmouseup(mouseEvent);
        }
        expect(canvas.foreGround.onmousemove).toBeInstanceOf(Function);
    });
    it('should creation mouse function when tool is set to erase', () => {
        const mouseEvent = {
            offsetX: 100,
            offsetY: 100,
            button: 0,
        } as MouseEvent;
        canvas.setTool('eraser');
        if (canvas.foreGround.onmousemove && canvas.foreGround.onmousedown && canvas.foreGround.onmouseup) {
            canvas.foreGround.onmousedown(mouseEvent);
            canvas.foreGround.onmousemove(mouseEvent);
            canvas.foreGround.onmouseup(mouseEvent);
        }
        expect(canvas.foreGround.onmousemove).toBeInstanceOf(Function);
    });
});
