import { G, Text, Svg, SVG } from "@svgdotjs/svg.js";
import { CommandStack } from "./command";
import type { Command, CommandExecuter, StackListener } from "./command";
import { DirectEditController } from "./directEdit";
import "./editor.css";
import { Point } from "./geometry";
import type { State } from "./states";
import type { DiagramType } from "./diagram";
import { randomId } from "./random";

export interface Options {
  container: HTMLElement;
  collaborationUrl?: string;
}

export interface Measurer {
  measure(text: string, textSize: string): any;
}

export interface Tool<T> {
  icon: string;
  action: (commandStack: CommandExecuter, context: T) => void;
}

class TextMeasurer implements Measurer {
  context: CanvasRenderingContext2D;

  constructor() {
    const canvas = document.createElement("canvas");
    this.context = canvas.getContext("2d")!!;
  }

  measure(text: string, textSize: string) {
    this.context.font = textSize + " arial";
    const metrics = this.context.measureText(text);
    return metrics;
  }
}

export type PresenceListener = (e: CollaborationUser[]) => void;

type CollaborationUser = { user: string; position: Point | null };

type CollaborationMessage =
  | { type: "presence-connect"; user: string }
  | { type: "presence-move"; user: string; position: Point }
  | { type: "presence-update"; users: CollaborationUser[] };

class Collaboration {
  private webSocket!: WebSocket;
  private userId: string;
  private moveDebounce: number | null = null;
  private listeners: PresenceListener[] = [];

  constructor(private editor: Editor, private url: string) {
    this.userId = randomId();
    this.start();
  }

  private start() {
    this.webSocket = new WebSocket(this.url);
    this.webSocket.onclose = (e) => {
      // TODO indicate connection status
      setTimeout(() => this.start(), 1000);
    };
    this.webSocket.onerror = (e) => {
      // TODO indicate connection status
      console.log(`WS ERROR`, e);
    };
    this.webSocket.onopen = (e) => {
      console.log("COLLABORATION ID:", this.userId);
      this.send({ type: "presence-connect", user: this.userId });
    };
    this.webSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      this.handleMessage(data);
    };
  }

  private handleMessage(message: CollaborationMessage) {
    if (message.type == "presence-update") {
      const otherUsers = message.users.filter(
        (user) => user.user != this.userId
      );
      this.listeners.forEach((listener) => {
        listener(otherUsers);
      });
      this.editor.updateUserPositions(otherUsers);
    } else {
      console.log(`UNKNOWN WS MESSAGE`, message);
    }
  }

  send(message: CollaborationMessage) {
    this.webSocket.send(JSON.stringify(message));
  }

  movePointer(position: Point) {
    if (this.moveDebounce) {
      clearTimeout(this.moveDebounce);
    }
    this.moveDebounce = setTimeout(() => {
      this.send({ type: "presence-move", user: this.userId, position });
      this.moveDebounce = null;
    }, 100);
  }

  addListener(listener: PresenceListener) {
    this.listeners.push(listener);
  }
}

class UserPointerView {
  svg: G;
  text: Text;

  constructor(public user: CollaborationUser, svg: G) {
    this.svg = svg.group();
    this.svg.circle(10).fill("blue");
    this.text = this.svg.plain("");
    // TODO make pointer and add text
  }

  update(user: CollaborationUser) {
    if (user.position) {
      console.log("UPDATE to", user.position);
      // this.svg.transform({ translate: [user.position.x, user.position.y] });
      this.svg.animate().move(user.position.x, user.position.y);
      this.text.plain(user.user);
    }
  }

  remove(): void {
    this.svg.remove();
  }
}

export class Editor {
  measurer = new TextMeasurer();
  commandStack: CommandStack = new CommandStack();
  directEdit: DirectEditController;
  rootView: View;
  state: State;
  model: any;
  container: HTMLDivElement;
  svg!: Svg;
  content!: G;

  collaboration: Collaboration | null = null;
  usersLayer!: G;
  userPresences: UserPointerView[] = [];

  constructor(diagramType: DiagramType, options: Options) {
    this.directEdit = new DirectEditController(options.container);

    this.container = this.createContainer(options.container);
    this.createSvg(this.container, diagramType);
    window.addEventListener("resize", (e) => this.resizePage());

    const { model, view, state } = diagramType.initialize(this);
    this.model = model;
    this.rootView = view;
    this.state = state;

    this.resizePage();

    if (options.collaborationUrl) {
      this.collaboration = new Collaboration(this, options.collaborationUrl);
    }
  }

  mouseDown(e: MouseEvent) {
    const mousePoint = new Point(e.offsetX, e.offsetY);
    this.state = this.state.mouseDown(mousePoint);
  }

  mouseUp(e: MouseEvent) {
    const mousePoint = new Point(e.offsetX, e.offsetY);
    this.state = this.state.mouseUp(mousePoint);
  }

  mouseMove(e: MouseEvent) {
    const mousePoint = new Point(e.offsetX, e.offsetY);
    this.state = this.state.mouseMove(mousePoint);
    if (this.collaboration) {
      this.collaboration.movePointer(mousePoint);
    }
  }

  undo() {
    this.commandStack.undo();
    this.rootView.render();
  }

  redo() {
    this.commandStack.redo();
    this.rootView.render();
  }

  executeCommand(command: Command) {
    this.commandStack.execute(command);
    this.rootView.render();
  }

  onStackChange(listener: StackListener) {
    this.commandStack.addListener(listener);
  }

  onPresenceChange(listener: PresenceListener) {
    if (this.collaboration) {
      this.collaboration.addListener(listener);
    }
  }

  private createContainer(parent: HTMLElement): HTMLDivElement {
    const container = document.createElement("div");
    container.setAttribute("class", "editor-container");
    parent.appendChild(container);
    container.addEventListener("mousedown", (e) =>
      this.mouseDown(e as MouseEvent)
    );
    container.addEventListener("mouseup", (e) => this.mouseUp(e as MouseEvent));
    container.addEventListener("mousemove", (e) =>
      this.mouseMove(e as MouseEvent)
    );
    return container;
  }

  private createSvg(container: HTMLElement, diagramType: DiagramType) {
    this.svg = SVG().addTo(container).viewbox(0, 0, 100, 100);
    diagramType.initializeSvg(this.svg);
    this.content = this.svg.group();
    this.usersLayer = this.svg.group();
  }

  private resizePage() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.svg.viewbox(0, 0, w, h).size(w, h);
  }

  updateUserPositions(users: CollaborationUser[]) {
    if (this.collaboration) {
      const seenViews: UserPointerView[] = [];
      users.forEach((user) => {
        // TODO make userPresences a Map
        let userView = this.userPresences.find(
          (u) => u.user.user === user.user
        );
        if (!userView) {
          console.log("CREATE USER VIEW", user);
          userView = new UserPointerView(user, this.usersLayer);
        }
        seenViews.push(userView);
        userView.update(user);
      });
      this.userPresences
        .filter((user) => !seenViews.includes(user))
        .forEach((user) => user.remove());
      this.userPresences = seenViews;
    }
  }
}

export interface View {
  render(): void;
}
