import { choice, choiceNot, randomText } from "../random";
import {
  createLifeLine,
  createMessage,
  type DiagramModel,
  type LifeLineModel,
  type MessageModel,
} from "./model";

export function createRandomModel(): DiagramModel {
  const lifeLines = new Array(5).fill(0).map((x) => createRandomLifeLine());
  const messages = new Array(7)
    .fill(0)
    .map((x) => createRandomMessage(lifeLines));
  return {
    lifeLines,
    messages,
  };
}

function createRandomLifeLine(): LifeLineModel {
  return createLifeLine(randomText(4));
}

function createRandomMessage(lifeLines: LifeLineModel[]): MessageModel {
  const from = choice(lifeLines);
  const to = choiceNot(from, lifeLines);
  return createMessage(from, to, randomText());
}
