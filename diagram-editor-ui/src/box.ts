
import { Point, Rectangle } from "./geometry";
import { DiagramNode, Zone, DirectEdit } from "./model";
import * as svgjs from "@svgdotjs/svg.js"

export class Box {

    bounds: Rectangle;
    isSelectable: boolean;
    relPosition: Point;
    svgElement: svgjs.Container;
    node: DiagramNode;

    constructor(public parent: CompositeBox) {
        this.bounds = new Rectangle(0, 0, 0, 0);
        this.isSelectable = true;
    }

    setPosition(x: number, y: number) {
        this.bounds.x = x;
        this.bounds.y = y;
    }

    setRelativePosition(x: number, y: number) {
        this.relPosition = { x: x, y: y };
        this.svgElement.attr('transform', 'translate(' + x + ',' + y + ')');
    }

    relBounds() {
        return new Rectangle(this.relPosition.x, this.relPosition.y,
            this.bounds.width, this.bounds.height);
    }

    execute(callback) {
        callback(this);
    }

    findZone(point: Point): Zone {
        return null;
    }

    findElement(point: Point): Box {
        return null;
    }

    directEdit(): DirectEdit {
        return null;
    }

    removeSvg() {
        this.svgElement.remove();
    }

    layout() {
    }
}

export class CompositeBox extends Box {

    children: Array<Box>;

    constructor(parent: CompositeBox) {
        super(parent);
        this.children = [];
    }

    setPosition(x, y) {
        Box.prototype.setPosition.call(this, x, y);
        this.children.forEach(child => {
            child.setPosition(child.relPosition.x + x, child.relPosition.y + y);
        });
    }

    findElement(point: Point): Box {
        let result = null;
        for(let child of this.children) {
            result = child.findElement(point);
            if (result != null) {
                break;
            }
        }
        if (result == null && this.bounds.contains(point)) {
            return this;
        }
        return result;
    }

    execute(callback: (box: Box) => void) {
        callback(this);
        this.children.forEach(child => {
            child.execute(callback);
        });
    }

    removeChild(child: Box) {
        this.children.splice(this.children.indexOf(child), 1);
        this.node.children.splice(this.node.children.indexOf(child.node), 1);
        child.removeSvg();
    }
}
