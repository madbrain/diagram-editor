
import { Alignment, Point, Rectangle } from "./geometry";
import { Box, CompositeBox } from "./box";
import { DiagramNode, Zone, DirectEdit } from "./model";
import { layout } from "./layout";
import * as svgjs from "@svgdotjs/svg.js";

export class DiagramBox extends CompositeBox {
    constructor(svgParent: svgjs.Container) {
        super(null);
        this.svgElement = svgParent.group().attr('class', 'diagram');
    }

    layout() {
        // layout: vertical aligner en haut à gauche
        layout(this, true, Alignment.CENTER, 20, { top: 30, right: 30, left: 30, bottom: 30 });
        this.setPosition(0, 0);
    }
}

export class SequenceBox extends CompositeBox {

    //svgRect: svgjs.Rect;
    svgEdges: Array<svgjs.Line> = [];

    constructor(node, parent: CompositeBox) {
        super(parent);
        this.svgElement = parent.svgElement.group().attr('class', 'sequence');
        /*this.svgRect = this.svgElement.rect(0, 0)
            .move(0, 0)
            .fill('none')
            .radius(5)
        //.attr('stroke', 'blue')
        ;*/
        this.node = node;
        this.isSelectable = false;
    }

    layout() {
        if (this.children.length == 0) {
            this.bounds.width = 20;
            this.bounds.height = 20;
        } else {
            layout(this, true, Alignment.CENTER, 20, { top: 0, right: 10, left: 10, bottom: 0 });

            // TODO Line should be created when child added
            this.svgEdges.forEach(e => e.remove());
            for (let i = 0; i < (this.children.length - 1); ++i) {
                const startPoint = this.children[i].relBounds().midEast();
                const endPoint = this.children[i+1].relBounds().midWest();
                const svgLine = this.svgElement
                    .line().plot(<svgjs.PointArray>([startPoint, endPoint].map(p => [p.x, p.y])))
                    .stroke({ color: "#555", width: 2 })
                    .attr("marker-end", "url(#arrowhead)");
                this.svgEdges.push(svgLine);
            }
        }
        //this.svgRect.size(this.bounds.width, this.bounds.height);
    }

    findZone(point: Point): Zone {
        let index = 0;
        let x = this.bounds.x;
        this.children.every(child => {
            if (point.x < (child.bounds.x + child.bounds.width / 2)) {
                return false;
            }
            ++index;
            x = child.bounds.x + child.bounds.width + 10;
            return true;
        });
        if (index >= this.children.length) {
            x = this.bounds.x + this.bounds.width;
        }
        return {
            index: index,
            bounds: new Rectangle(x - 3, this.bounds.y, 6, this.bounds.height),
            wrap: simpleWrap
        };
    }
}

function simpleWrap(node: DiagramNode): DiagramNode {
    return node;
}

export class RepeatBox extends CompositeBox {

    svgRect: svgjs.Rect;

    constructor(node, parent: CompositeBox) {
        super(parent);
        this.svgElement = parent.svgElement.group().attr('class', 'repeat');
        this.svgRect = this.svgElement.rect(0, 0).move(0, 0).radius(5);
        this.node = node;
    }

    layout() {
        layout(this, true, Alignment.CENTER, 20, { top: 10, right: 0, left: 0, bottom: 10 });

        this.svgRect.size(this.bounds.width, this.bounds.height);
    }
}

export class ChooseBox extends CompositeBox {

    svgRect: svgjs.Rect;

    constructor(node, parent) {
        super(parent);
        this.svgElement = parent.svgElement.group().attr('class', 'choose');
        this.svgRect = this.svgElement.rect(0, 0).move(0, 0).radius(5);
        this.node = node;
    }

    layout() {
        if (this.children.length == 0) {
            this.bounds.width = 40;
            this.bounds.height = 40;
        } else {
            layout(this, false, Alignment.TOP, 20, { top: 10, right: 0, left: 30, bottom: 10 });
        }
        this.svgRect.size(this.bounds.width, this.bounds.height);
    }

    findZone(point: Point): Zone {
        let index = 0;
        let y = this.bounds.y;
        this.children.every(child => {
            if (point.y < (child.bounds.y + child.bounds.height / 2)) {
                return false;
            }
            ++index;
            y = child.bounds.y + child.bounds.height + 10;
            return true;
        });
        if (index >= this.children.length) {
            y = this.bounds.y + this.bounds.height;
        }
        return {
            index: index,
            bounds: new Rectangle(this.bounds.x, y - 3, this.bounds.width, 6),
            wrap: whenWrap
        };
    }
}

function whenWrap(node: DiagramNode): DiagramNode {
    return { type: 'when', children: [node] };
}

export class SimpleBox extends Box {

    label: string;
    svgLabelBBox: svgjs.Box;

    constructor(node: DiagramNode, parent: CompositeBox) {
        super(parent);
        this.node = node;
        this.svgElement = this.parent.svgElement.group().attr('class', 'simple');
        this.setLabel(node.label);
    }

    layout() {
    }

    findElement(point: Point) {
        if (this.bounds.contains(point)) {
            return this;
        }
        return null;
    }

    setLabel(newValue: string) {
        this.label = newValue;
        this.svgElement.clear();
        const svgRect = this.svgElement.rect(0, 0).radius(5)
            .attr('filter', 'url(#drop-shadow)');

        const svgLabel = this.svgElement.text(l => {
            l.tspan(this.label).dy(25);
        })
            .attr('text-anchor', 'middle')
            .x(0);

        const nodePadding = 10;
        this.svgLabelBBox = svgLabel.bbox();
        this.bounds.width = this.svgLabelBBox.width + 2 * nodePadding;
        this.bounds.height = this.svgLabelBBox.height + 2 * nodePadding;

        svgRect.size(this.bounds.width, this.bounds.height);
        svgLabel.attr('x', this.bounds.width / 2);
    }

    directEdit(): DirectEdit {
        const bbox = this.svgLabelBBox;
        return {
            bounds: new Rectangle(bbox.x + this.bounds.x + (this.bounds.width - bbox.width) / 2,
                bbox.y + this.bounds.y, bbox.width, bbox.height),
            value: this.label,
            change: (newValue) => {
                this.node.label = newValue;
                this.setLabel(newValue);
            }
        };
    }

}
