import type { Svg } from "@svgdotjs/svg.js";
import type { Editor, View } from "./editor";
import type { State } from "./states";

export interface DiagramType {
  initializeSvg(svg: Svg): void;
  initialize(editor: Editor): { model: any; view: View; state: State };
  actions: DiagramAction[];
}

export interface DiagramAction {
  label: string;
  run: (editor: Editor) => void;
}
