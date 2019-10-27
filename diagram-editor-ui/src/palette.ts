
import { Alignment } from "./geometry";
import { CompositeBox } from "./box";
import { SimpleBox } from "./diagram";
import { layout } from "./layout";
import * as svgjs from "@svgdotjs/svg.js";
	
export class PaletteBox extends CompositeBox {

    isOpen: boolean;
    svgRect: svgjs.Rect;

    constructor(svgParent: svgjs.Container, items) {
        super(null);
        this.svgElement = svgParent.group().addClass('palette');
        this.svgRect = this.svgElement.rect(0, 0).x(0).y(0);
        items.forEach(item => {
            this.children.push(new SimpleBox(item, this));
        });
    }

    layout() {
        // layout: vertical aligner en haut à gauche
        layout(this, false, Alignment.CENTER, 10, { top: 10, right: 15, left: 15, bottom: 10 });
        this.setPosition(0, 0);
        this.bounds.height = 1000;
        this.svgRect
            .attr('width', this.bounds.width)
            .attr('height', '100%');
        this.close();
    }

    open() {
        this.isOpen = true;
        this.svgElement.attr('transform', 'translate(0, 0)');
    }

    close() {
        this.isOpen = false;
        this.svgElement.attr('transform', 'translate(' + (10 - this.bounds.width) + ',0)');
    }
}
