export interface Command {
  execute(): void;
  undo(): void;
  redo(): void;
}

export interface CommandExecuter {
  execute(command: Command): void;
}

export interface StackEvent {
  canUndo: boolean;
  canRedo: boolean;
}

export type StackListener = (e: StackEvent) => void;

export class CommandStack implements CommandExecuter {
  private stack: Command[] = [];
  private current = -1;
  private listeners: StackListener[] = [];

  addListener(listener: StackListener) {
    this.listeners.push(listener);
  }

  execute(command: Command) {
    if (this.current + 1 < this.stack.length) {
      this.stack.splice(this.current + 1, this.stack.length - this.current);
    }
    this.stack.push(command);
    this.current += 1;
    command.execute();
    this.fireChange();
  }

  canUndo() {
    return this.current >= 0;
  }

  canRedo() {
    return this.current + 1 < this.stack.length;
  }

  undo() {
    if (this.canUndo()) {
      this.stack[this.current].undo();
      this.current -= 1;
      this.fireChange();
    }
  }

  redo() {
    if (this.canRedo()) {
      this.current += 1;
      this.stack[this.current].redo();
      this.fireChange();
    }
  }

  fireChange() {
    this.listeners.forEach((listener) => {
      listener({ canUndo: this.canUndo(), canRedo: this.canRedo() });
    });
  }
}
