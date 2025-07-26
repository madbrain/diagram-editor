import { Point } from "../geometry";
import {
  DiagramView,
  LifelineView,
  MessageHandle,
  MessageView,
  PlacedTool,
} from "./renderer";
import type { State } from "../states";

export class DiagramContext {
  constructor(public view: DiagramView) {}
}

export class IdleState implements State {
  constructor(private context: DiagramContext) {}

  mouseDown(event: Point): State {
    const tool = this.context.view.findTool(event);
    if (tool) {
      return new ToolPressedAction(this.context, tool);
    }
    const handle = this.context.view.findMessageHandle(event);
    if (handle) {
      return new StartDragHandle(this.context, event, handle);
    }
    const message = this.context.view.findMessage(event);
    if (message) {
      return new StartDragMessage(this.context, event, message);
    }
    const lifeLine = this.context.view.findLifeLine(event);
    if (lifeLine) {
      return new StartDragLifeLine(this.context, event, lifeLine);
    }
    if (this.context.view.startMessageHandle) {
      this.context.view.startDragNewMessageHandle(event.x);
      return new DragHandle(this.context);
    }
    return this;
  }

  mouseUp(event: Point): State {
    this.context.view.unselectAll();
    this.context.view.update();
    return this;
  }

  mouseMove(event: Point): State {
    this.context.view.testHover(event);
    return this;
  }
}

export class ToolPressedAction implements State {
  constructor(private context: DiagramContext, private tool: PlacedTool) {}

  mouseDown(event: Point): State {
    return this;
  }

  mouseUp(event: Point): State {
    // TODO actions could also produce new state and not only commands
    this.tool.action();
    return new IdleState(this.context);
  }

  mouseMove(event: Point): State {
    if (!this.tool.bounds.contains(event)) {
      return new IdleState(this.context);
    }
    return this;
  }
}

export class StartDragHandle implements State {
  constructor(
    private context: DiagramContext,
    private startDrag: Point,
    private handle: MessageHandle
  ) {}

  mouseDown(event: Point): State {
    return this;
  }

  mouseUp(event: Point): State {
    return new IdleState(this.context);
  }

  mouseMove(event: Point): State {
    if (event.distance(this.startDrag) > 10) {
      this.context.view.startDragMessageHandle(this.handle, event.x);
      return new DragHandle(this.context);
    }
    return this;
  }
}

export class DragHandle implements State {
  constructor(private context: DiagramContext) {}

  mouseDown(event: Point): State {
    return this;
  }

  mouseUp(event: Point): State {
    this.context.view.finishDragMessageHandle();
    return new IdleState(this.context);
  }

  mouseMove(event: Point): State {
    this.context.view.updateDragMessageHandle(event.x);
    return this;
  }
}

export class StartDragMessage implements State {
  constructor(
    private context: DiagramContext,
    private startDrag: Point,
    private message: MessageView
  ) {}

  mouseDown(event: Point): State {
    return this;
  }

  mouseUp(event: Point): State {
    this.context.view.selectMessage(this.message);
    return new IdleState(this.context);
  }

  mouseMove(event: Point): State {
    if (event.distance(this.startDrag) > 10) {
      return new DragMessage(this.context, event, this.message);
    }
    return this;
  }
}

export class DragMessage implements State {
  constructor(
    private context: DiagramContext,
    private dragPoint: Point,
    private message: MessageView
  ) {
    this.context.view.startDragMessage(message, dragPoint.y);
  }

  mouseDown(event: Point): State {
    return this;
  }

  mouseUp(event: Point): State {
    this.context.view.finishDragMessage();
    this.context.view.selectMessage(this.message);
    return new IdleState(this.context);
  }

  mouseMove(event: Point): State {
    this.context.view.updateDragMessage(event.y);
    removeTextSelection();
    return this;
  }
}

export class StartDragLifeLine implements State {
  constructor(
    private context: DiagramContext,
    private startDrag: Point,
    private lifeLine: LifelineView
  ) {}

  mouseDown(event: Point): State {
    return this;
  }

  mouseUp(event: Point): State {
    this.context.view.selectLifeLine(this.lifeLine);
    return new IdleState(this.context);
  }

  mouseMove(event: Point): State {
    if (event.distance(this.startDrag) > 10) {
      return new DragLifeLine(this.context, event, this.lifeLine);
    }
    return this;
  }
}

export class DragLifeLine implements State {
  constructor(
    private context: DiagramContext,
    private dragPoint: Point,
    private lifeLine: LifelineView
  ) {
    this.context.view.startDragLifeLine(this.lifeLine, dragPoint.x);
  }

  mouseDown(event: Point): State {
    return this;
  }

  mouseUp(event: Point): State {
    this.context.view.finishDragLifeLine();
    this.context.view.selectLifeLine(this.lifeLine);
    return new IdleState(this.context);
  }

  mouseMove(event: Point): State {
    this.context.view.updateDragLifeLine(event.x);
    removeTextSelection();
    return this;
  }
}

// dirty hack to prevent text selection on mouse drag
// https://stackoverflow.com/questions/29908261/prevent-text-selection-on-mouse-drag
function removeTextSelection() {
  if ((<any>document).selection) {
    (<any>document).selection.empty();
  } else {
    window.getSelection().removeAllRanges();
  }
}
