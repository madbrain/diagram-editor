
import { Rectangle } from "./geometry";

export interface DiagramNode {
    id?: number;
    type: string;
    label?: string;
    children?: Array<DiagramNode>;
}

export interface Diagram {
    nodes: Array<DiagramNode>;
}

export interface Zone {
    index: number;
    bounds: Rectangle;
    wrap: (node: DiagramNode) => DiagramNode;
}

export interface DirectEdit {
    bounds: Rectangle;
    value: string;
    change: (newValue: string) => void;
}