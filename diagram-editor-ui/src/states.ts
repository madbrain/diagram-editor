
import { Rectangle, Offset, Point, distance } from "./geometry";
import { Diagram, DirectEdit, DiagramNode } from "./model";
import { Box, CompositeBox } from "./box";
import { DiagramBox } from "./diagram";
import { PaletteBox } from "./palette";
import { createDiagramBox, cloneNode } from "./app";
import * as svgjs from "@svgdotjs/svg.js";

export interface DirectEditComponent {
    start(directEdit: DirectEdit, cb: (newValue: string) => void);
    cancel();
}

export class Context {
    dragOn: Box = null;
    selection: Box = null;
    isDirectEditing = false;

    constructor(public model: Diagram, public root: DiagramBox, public palette: PaletteBox,
        public svgNodes: svgjs.Container, public svgFeedback: svgjs.Container,
        public directEditComponent: DirectEditComponent) {
    }

    startDirectEdit(directEdit: DirectEdit) {
        this.isDirectEditing = true;
        this.directEditComponent.start(directEdit, (newValue) => {
            directEdit.change(newValue);
            this.root.layout();
            this.isDirectEditing = false;
        });
    }

    cancelDirectEdit() {
        this.directEditComponent.cancel();
        this.isDirectEditing = false;
    }

    selectElement(point: Point) {
        const element = this.root.findElement(point);
        this.selection = null;
        this.root.execute(node => {
            node.svgElement.removeClass('node-selected');
        });
        if (element != null && element.isSelectable) {
            this.selection = element;
            element.svgElement.addClass('node-selected');
        }
    }

    mayInsertNode(point: Point, node: DiagramNode) {
        if (this.dragOn != null) {
            const dropZone = this.dragOn.findZone(point);
            if (dropZone != null) {
                this.dragOn.node.children.splice(dropZone.index, 0,
                    dropZone.wrap(node));
                // TODO could modification of diagram can be optimized ?
                this.svgNodes.clear();
                this.root = createDiagramBox(this.model, this.svgNodes);
            }
        }
    }

    removeSelection() {
        if (this.selection.parent.node.type == 'when') {
            const whenElement = <CompositeBox>this.selection.parent;
            const whenParent = <CompositeBox>whenElement.parent;
            if (whenElement.children.length == 1 && whenParent.children.length > 1) {
                this.selection = whenElement;
            }
        }
        this.selection.parent.removeChild(this.selection);
        this.selection = null;
        this.root.layout();
    }

}

export interface State {
    mouseDown: (event) => State;

    mouseMove: (event) => State;

    mouseUp: (event) => State;

    keyUp: (event) => State;

    mouseDoubleClick: (event) => State;
}

export class IdleState implements State {

    constructor(private context: Context) { }

    mouseDown(event): State {
        this.context.selectElement(event.point);
        if (this.context.selection != null) {
            return new DetectDragState(this.context, event.point);
        }
        return this;
    }

    mouseMove(event): State {
        if (event.point.x < 10) {
            this.context.palette.open();
            return new OnPaletteState(this.context);
        }
        return this;
    }

    mouseUp(event): State {
        return this;
    }

    keyUp(event): State {
        // delete selection
        if (event.keyCode == 46) {
            if (this.context.selection != null) {
                this.context.removeSelection();
            }
        }
        return this;
    }

    mouseDoubleClick(event): State {
        const element = this.context.root.findElement(event.point);
        if (element != null) {
            const directEdit = element.directEdit();
            if (directEdit != null) {
                this.context.startDirectEdit(directEdit);
                return new DirectEditState(this.context);
            }
        }
        return this;
    }
}

class DetectDragState implements State {

    constructor(private context: Context, private startPoint: Point) {}
    
    mouseMove(event) {
        if (this.detectMove(event.point)) {
            const selection = this.context.selection;
            this.context.removeSelection();
            return new StartDragItem(selection.node, selection.bounds, event.point, this.context);
        }
        return this;
    }

    mouseDown(event) {
        return new IdleState(this.context);
    }

    mouseUp(event) {
        return new IdleState(this.context);
    }

    keyUp(event) {
        return new IdleState(this.context);
    }

    mouseDoubleClick(event) {
        return new IdleState(this.context);
    }

    private detectMove(current: Point) {
        return distance(this.startPoint, current) > 5;
    }
}

class DirectEditState implements State {

    constructor(private context: Context) { }

    mouseDown(event): State {
        if (this.context.isDirectEditing) {
            this.context.cancelDirectEdit();
        }
        return new IdleState(this.context).mouseDown(event);
    }

    mouseUp(event): State {
        if (this.context.isDirectEditing) {
            this.context.cancelDirectEdit();
        }
        return new IdleState(this.context).mouseUp(event.point);
    }

    keyUp(event): State {
        return this;
    }

    mouseMove(event): State {
        if (this.context.isDirectEditing) {
            return this;
        }
        return new IdleState(this.context).mouseMove(event);
    }

    mouseDoubleClick(event): State {
        if (this.context.isDirectEditing) {
            return this;
        }
        return new IdleState(this.context).mouseDoubleClick(event);
    }
}

class StartDragItem implements State {

    offset: Offset;
    svgElement: svgjs.Container;
    svgCursor: svgjs.Element;

    constructor(private node: DiagramNode, bounds: Rectangle, point: Point, private context: Context) {
        this.svgElement = this.context.svgFeedback.group()
            .attr('class', 'drag-element')
            .attr('transform', 'translate(' + bounds.x + ',' + bounds.y + ')');
        const svgRect = this.svgElement.rect(bounds.width, bounds.height)
            .attr('rx', '5').attr('ry', '5');
        this.offset = { dx: point.x - bounds.x, dy: point.y - bounds.y };
        this.context.palette.close();
        context.dragOn = null;
    }

    mouseDown(event): State {
        return this;
    }

    mouseMove(event): State {
        const point = event.point;
        this.svgElement.attr('transform', 'translate(' + (point.x - this.offset.dx)
            + ',' + (point.y - this.offset.dy) + ')');
        const element = this.context.root.findElement(point);
        if (element != this.context.dragOn) {
            this.context.dragOn = element;
            if (this.svgCursor != null) {
                this.svgCursor.remove();
            }
            if (this.context.dragOn != null) {
                const dropZone = this.context.dragOn.findZone(point);   
                if (dropZone != null) {   
                    this.svgCursor = this.context.svgNodes.rect(
                        dropZone.bounds.width, dropZone.bounds.height)
                        .attr('class', 'cursor')
                        .attr('x', dropZone.bounds.x)
                        .attr('y', dropZone.bounds.y);
                }
            }

        }
        return this;
    }

    mouseUp(event): State {
        const point = event.point;
        this.context.svgFeedback.clear();
        if (this.svgCursor != null) {
            this.svgCursor.remove();
        }
        this.context.mayInsertNode(point, this.node);
        return new IdleState(this.context);
    }

    keyUp(event) {
        return this;
    }

    mouseDoubleClick(event): State {
        return this;
    }
}

class OnPaletteState implements State {

    constructor(private context: Context) {

    }

    mouseDown(event): State {
        const point = event.point;
        const item = this.context.palette.findElement(point);
        if (item != null) {
            return new StartDragItem(cloneNode(item.node), item.bounds, point, this.context);
        }
        return this;
    }

    mouseMove(event): State {
        const point = event.point;
        if (this.context.palette.bounds.contains(point)) {
            return this;
        }
        this.context.palette.close();
        return new IdleState(this.context);
    }

    mouseUp(event): State {
        return this;
    }

    keyUp(event): State {
        return this;
    }

    mouseDoubleClick(event): State {
        return this;
    }
}
