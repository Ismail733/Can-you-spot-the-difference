export class Pixel {
    x: number;
    y: number;
    alreadyVisited: boolean;
    difference: boolean;
    constructor( y: number,x:number, difference: boolean) {
        this.x = x;
        this.y = y;
        this.alreadyVisited = false;
        this.difference = difference;
    }
}
