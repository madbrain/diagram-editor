import type { Command } from "../command";

export interface DiagramModel {
  lifeLines: LifeLineModel[];
  messages: MessageModel[];
}

export interface LifeLineModel {
  id: string;
  name: string;
}

export interface MessageModel {
  id: string;
  from: LifeLineModel;
  to: LifeLineModel;
  text: string;
}

export class SetMessageFromCommand implements Command {
  private oldEnd: LifeLineModel;
  constructor(private message: MessageModel, private end: LifeLineModel) {
    this.oldEnd = this.message.from;
  }

  execute() {
    this.message.from = this.end;
  }

  undo() {
    this.message.from = this.oldEnd;
  }

  redo() {
    this.execute();
  }
}

export class SetMessageToCommand implements Command {
  private oldEnd: LifeLineModel;
  constructor(private message: MessageModel, private end: LifeLineModel) {
    this.oldEnd = this.message.to;
  }

  execute() {
    this.message.to = this.end;
  }

  undo() {
    this.message.to = this.oldEnd;
  }

  redo() {
    this.execute();
  }
}

export class AddLifeLineCommand implements Command {
  constructor(private model: DiagramModel, private lifeLine: LifeLineModel) {}

  execute() {
    this.model.lifeLines.push(this.lifeLine);
  }

  undo() {
    this.model.lifeLines.pop();
  }

  redo() {
    this.execute();
  }
}

export class AddMessageCommand implements Command {
  constructor(
    private model: DiagramModel,
    private message: MessageModel,
    private position: number = -1
  ) {
    if (position < 0) {
      this.position = model.messages.length;
    }
  }

  execute() {
    this.model.messages.splice(this.position, 0, this.message);
  }

  undo() {
    this.model.messages.splice(this.position, 1);
  }

  redo() {
    this.execute();
  }
}

export class MoveMessageCommand implements Command {
  oldPosition: number;
  constructor(
    private model: DiagramModel,
    private message: MessageModel,
    private position: number
  ) {
    this.oldPosition = this.model.messages.indexOf(message);
  }

  execute() {
    this.model.messages.splice(this.oldPosition, 1);
    this.model.messages.splice(this.position, 0, this.message);
  }

  undo() {
    this.model.messages.splice(this.position, 1);
    this.model.messages.splice(this.oldPosition, 0, this.message);
  }

  redo() {
    this.execute();
  }
}

export class ChangeMessageTextCommand implements Command {
  oldText: string;
  constructor(private message: MessageModel, private newText: string) {
    this.oldText = this.message.text;
  }

  execute() {
    this.message.text = this.newText;
  }

  undo() {
    this.message.text = this.oldText;
  }

  redo() {
    this.execute();
  }
}

export class DeleteMessageCommand implements Command {
  oldPosition: number;
  constructor(private model: DiagramModel, private message: MessageModel) {
    this.oldPosition = this.model.messages.indexOf(message);
  }

  execute() {
    this.model.messages.splice(this.model.messages.indexOf(this.message), 1);
  }

  undo() {
    this.model.messages.splice(this.oldPosition, 0, this.message);
  }

  redo() {
    this.execute();
  }
}

export class ChangeLifeLineNameCommand implements Command {
  oldName: string;
  constructor(private lifeLine: LifeLineModel, private newName: string) {
    this.oldName = this.lifeLine.name;
  }

  execute() {
    this.lifeLine.name = this.newName;
  }

  undo() {
    this.lifeLine.name = this.oldName;
  }

  redo() {
    this.execute();
  }
}

export class MoveLifeLineCommand implements Command {
  oldPosition: number;
  constructor(
    private model: DiagramModel,
    private lifeLine: LifeLineModel,
    private position: number
  ) {
    this.oldPosition = this.model.lifeLines.indexOf(lifeLine);
  }

  execute() {
    this.model.lifeLines.splice(this.oldPosition, 1);
    this.model.lifeLines.splice(this.position, 0, this.lifeLine);
  }

  undo() {
    this.model.lifeLines.splice(this.position, 1);
    this.model.lifeLines.splice(this.oldPosition, 0, this.lifeLine);
  }

  redo() {
    this.execute();
  }
}

export class DeleteLifeLineCommand implements Command {
  private oldPosition: number;
  private removedMessages: { message: MessageModel; position: number }[];

  constructor(private model: DiagramModel, private lifeLine: LifeLineModel) {
    this.removedMessages = model.messages
      .map((message, i) => ({ message, position: i }))
      .filter(
        (element) =>
          element.message.from === lifeLine || element.message.to === lifeLine
      );
    this.oldPosition = this.model.lifeLines.indexOf(lifeLine);
  }

  execute() {
    this.removedMessages.reverse().forEach((element) => {
      this.model.messages.splice(element.position, 1);
    });
    this.model.lifeLines.splice(this.model.lifeLines.indexOf(this.lifeLine), 1);
  }

  undo() {
    this.model.lifeLines.splice(this.oldPosition, 0, this.lifeLine);
    this.removedMessages.forEach((element) => {
      this.model.messages.splice(element.position, 0, element.message);
    });
  }

  redo() {
    this.execute();
  }
}

let id = 0;

export function createInitialModel(): DiagramModel {
  const lifeLines = [createLifeLine("Roméo"), createLifeLine("Juliette")];
  return {
    lifeLines,
    messages: [
      createMessage(lifeLines[0], lifeLines[1], "Je t'aime"),
      createMessage(lifeLines[1], lifeLines[0], "Moi non plus"),
    ],
  };
}

export function createLifeLine(name: string = "actor"): LifeLineModel {
  return {
    id: `L${id++}`,
    name,
  };
}

export function createMessage(
  from: LifeLineModel,
  to: LifeLineModel,
  text: string = "message"
): MessageModel {
  return {
    id: `M${id++}`,
    from,
    to,
    text,
  };
}
