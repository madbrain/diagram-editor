import type { Svg } from "@svgdotjs/svg.js";
import type { DiagramType } from "../diagram";
import { Editor } from "../editor";
import {
  AddLifeLineCommand,
  createLifeLine,
  createInitialModel,
  type DiagramModel,
} from "./model";
import { createRandomModel } from "./random";
import { DiagramView, type Style } from "./renderer";
import { DiagramContext, IdleState } from "./states";

const DEFAULT_STYLE: Style = {
  lifeLineHeadTextSize: "24px",
  lifeLineHeadMargin: 10,
  minHeadHeight: 60,
  topMargin: 20,
  leftMargin: 20,
  minHeadGap: 20,
  messageTextSize: "18px",
  messageStartGap: 80,
  messageGap: 60,
  messageMargin: 15,
};

const diagram: DiagramType = {
  initialize: (editor: Editor) => {
    const model = createInitialModel();
    const view = new DiagramView(
      model,
      DEFAULT_STYLE,
      editor.measurer,
      editor.svg,
      (directEdit) => editor.directEdit.start(directEdit),
      editor.commandStack
    );
    const diagramContext = new DiagramContext(view);
    return {
      model,
      view,
      state: new IdleState(diagramContext),
    };
  },
  initializeSvg: (svg: Svg) => {
    svg
      .defs()
      .marker(10, 10)
      .id("triangle")
      .viewbox("0 0 10 10")
      .ref(10, 5)
      .attr("markerUnits", "strokeWidth")
      .orient("auto-start-reverse")
      .path("M 0 0 L 10 5 L 0 10 z")
      .fill("black");
    svg.style().addText(`
        g.hide {
            visibility: hidden;
        }
        .select-marker {
            stroke: none;
        }
        .select-marker.hover {
            stroke: #55CCFF;
        }
        .select-marker.selected {
            stroke: #55CC99;
        }
        .point-marker {
            fill: none;
        }
        .point-marker.hover {
            fill: #55CCFF;
        }
        .tool rect {
            stroke: #CCCCCC;
        }
        .tool.hover rect {
            stroke: #55CCFF;
        }`);
  },
  actions: [
    {
      label: "Add LifeLine",
      run: (editor) => {
        editor.executeCommand(
          new AddLifeLineCommand(editor.model as DiagramModel, createLifeLine())
        );
      },
    },
  ],
};

export default diagram;
