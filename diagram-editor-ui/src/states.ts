import type { Point } from "./geometry";

export interface State {
  mouseDown(event: Point): State;
  mouseUp(event: Point): State;
  mouseMove(event: Point): State;
}
