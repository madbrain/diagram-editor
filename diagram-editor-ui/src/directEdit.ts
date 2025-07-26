import { Rectangle } from "./geometry";
import { defer } from "./utils";
import type { Defer } from "./utils";

export interface DirectEditCommand {
  value: string;
  bounds: Rectangle;
}

export class DirectEditController {
  mainEl: HTMLDivElement;
  inputEl: HTMLInputElement;
  editDefer: Defer<string> | null = null;

  constructor(parent: HTMLElement) {
    this.mainEl = document.createElement("div");
    this.mainEl.classList.add("directEdit");
    parent.appendChild(this.mainEl);

    this.inputEl = document.createElement("input");
    this.mainEl.appendChild(this.inputEl);

    this.mainEl.addEventListener("mouseup", (ev) => {
      if (this.editDefer && ev.target !== this.inputEl) {
        this.editDefer.reject();
        this.close();
      }
    });

    this.inputEl.addEventListener("keyup", (ev) => {
      if (this.editDefer) {
        if (ev.keyCode == 27) {
          this.editDefer.reject();
          this.close();
        } else if (ev.keyCode == 13) {
          this.editDefer.resolve(this.inputEl.value);
          this.close();
        }
      }
    });
  }

  private close() {
    this.mainEl.classList.remove("opened");
  }

  start(command: DirectEditCommand): Promise<string> {
    this.editDefer = defer<string>();
    if (command) {
      this.mainEl.classList.add("opened");
      this.inputEl.value = command.value;
      this.inputEl.style.left = `${command.bounds.x}px`;
      this.inputEl.style.top = `${command.bounds.y}px`;
      this.inputEl.style.width = `${command.bounds.width}px`;
      this.inputEl.style.height = `${command.bounds.height}px`;
      this.inputEl.select();
      this.inputEl.focus();
    } else {
      console.log("START DIRECT EDIT WITH NULL");
      this.close();
      this.editDefer.reject();
    }
    return this.editDefer.promise;
  }
}
