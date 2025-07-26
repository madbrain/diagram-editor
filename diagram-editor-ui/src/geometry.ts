export class Point {
  constructor(public x: number, public y: number) {}

  centeredRect(width: number, height: number) {
    return new Rectangle(
      this.x - width / 2,
      this.y - height / 2,
      width,
      height
    );
  }

  rect(width: number, height: number) {
    return new Rectangle(this.x, this.y, width, height);
  }

  distance(other: Point) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  move(dx: number, dy: number): Point {
    return new Point(this.x + dx, this.y + dy);
  }
}

export class Rectangle {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  contains(p: Point) {
    return (
      this.x <= p.x &&
      p.x < this.corner().x &&
      this.y <= p.y &&
      p.y < this.corner().y
    );
  }

  corner() {
    return new Point(this.x + this.width, this.y + this.height);
  }

  expand(amount: number): Rectangle {
    return new Rectangle(
      this.x - amount,
      this.y - amount,
      this.width + amount * 2,
      this.height + amount * 2
    );
  }

  center() {
    return new Point(this.x + this.width / 2, this.y + this.height / 2);
  }

  topCenter() {
    return new Point(this.x + this.width / 2, this.y);
  }

  topRight() {
    return new Point(this.x + this.width, this.y);
  }
}
