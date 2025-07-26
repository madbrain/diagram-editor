export function randomText(size: number = 10) {
  const pieces = ["mo", "bi", "sha", "doo", "fli", "re", "po", "gra"];
  let result = "";
  const length = 2 + Math.floor(Math.random() * size);
  for (let i = 0; i < length; ++i) {
    result += choice(pieces);
  }
  return result;
}

export function choiceNot<T>(e: T, list: T[]) {
  while (true) {
    const x = choice(list);
    if (x != e) {
      return x;
    }
  }
}

export function choice<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function randomId() {
  let result = "";
  for (let i = 0; i < 10; ++i) {
    var x = Math.floor(Math.random() * 26 * 2);
    if (x < 26) {
      result += String.fromCharCode("A".charCodeAt(0) + x);
    } else {
      result += String.fromCharCode("a".charCodeAt(0) + x - 26);
    }
  }
  return result;
}
