
import { Diagram, DiagramNode } from "./model";
import { CompositeBox } from "./box";
import { DiagramBox, SimpleBox, ChooseBox, SequenceBox, RepeatBox } from "./diagram";
import { PaletteBox } from "./palette";
import { Context, State, IdleState, DirectEditComponent } from "./states";
import * as svgjs from "@svgdotjs/svg.js";

let idCount = 20;

export function cloneNode(node: DiagramNode): DiagramNode {
    const newNode: DiagramNode = { id: idCount++, type: node.type, children: [] };
    if (node.label) {
        newNode.label = node.label;
    }
    if (node.children) {
        node.children.forEach(child => {
            newNode.children.push(cloneNode(child));
        });
    }
    return newNode;
}

// Graphical element factory from model
function createBox(node: DiagramNode, parent: CompositeBox) {
    let box: CompositeBox;
    if (node.type == 'receive') {
        parent.children.push(new SimpleBox(node, parent));
    } else if (node.type == 'reply') {
        parent.children.push(new SimpleBox(node, parent));
    } else if (node.type == 'invoke') {
        parent.children.push(new SimpleBox(node, parent));
    } else if (node.type == 'transform') {
        parent.children.push(new SimpleBox(node, parent));
    } else if (node.type == 'choose') {
        box = new ChooseBox(node, parent);
        parent.children.push(box);
        node.children.forEach(node => createBox(node, box));
    } else if (node.type == 'when') {
        box = new SequenceBox(node, parent);
        parent.children.push(box);
        node.children.forEach(node => createBox(node, box));
    } else if (node.type == 'otherwise') {
        box = new SequenceBox(node, parent);
        parent.children.push(box);
        node.children.forEach(node => createBox(node, box));
    } else if (node.type == 'foreach') {
        box = new RepeatBox(node, parent);
        parent.children.push(box);
        node.children.forEach(node => createBox(node, box));
    } else if (node.type == 'sequence') {
        box = new SequenceBox(node, parent);
        parent.children.push(box);
        node.children.forEach(node => createBox(node, box));
    }
}


export function createDiagramBox(model: Diagram, svgNodes: svgjs.Container): DiagramBox {
    const root = new DiagramBox(svgNodes);
    model.nodes.forEach(node => {
        createBox(node, root);
    });
    root.layout();
    return root;
}

export function prepare(el: SVGSVGElement, model: Diagram, directEditComponent: DirectEditComponent): State {

    const drawing = svgjs.SVG(el).height("700");

    const svgNodes = <svgjs.Container>drawing.findOne('#nodes');
    const svgFeedback = <svgjs.Container>drawing.findOne('#feedback');
    const svgPalette = <svgjs.Container>drawing.findOne('#palette');

    const palette = new PaletteBox(svgPalette, [
        { label: 'Receive', type: 'receive', children: [] },
        { label: 'Invoke', type: 'invoke', children: [] },
        { label: 'Choose', type: 'choose', children: [] },
        { label: 'Foreach', type: 'foreach', children: [{ type: 'sequence', children: [] }] },
        { label: 'Reply', type: 'reply', children: [] },
        { label: 'Transform', type: 'transform', children: [] },
    ]);

    palette.layout();

    const root = createDiagramBox(model, svgNodes);

    const context = new Context(
        model,
        root,
        palette,
        svgNodes,
        svgFeedback,
        directEditComponent);

    return new IdleState(context);
}

export function makeEvent(e: MouseEvent, parent: HTMLElement) {
    const rect = parent.getBoundingClientRect();
    (<any>e).point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    return e;
}