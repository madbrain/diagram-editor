
export enum Alignment {
    TOP = 0,
    LEFT = 0,
    CENTER = 1,
    BOTTOM = 2,
    RIGHT = 2,
}

export interface Margin {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface Offset {
    dx: number;
    dy: number;
}

export class Rectangle {

    constructor(public x: number, public y: number, public width: number, public height: number) { }

    contains(point: Point): boolean {
        return this.x <= point.x && this.y <= point.y
            && point.x < (this.x + this.width) && point.y < (this.y + this.height);
    }
    midWest() {
        return { x: this.x, y: this.y + this.height / 2 };
    }

    midEast() {
        return { x: this.x + this.width, y: this.y + this.height / 2 };
    }
}

export function distance(a: Point, b: Point) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}