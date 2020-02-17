class Timer {
  constructor() {
    this.previous = new Date().getTime();
    this.delta = 0;
    this.step();
  }
  step() {
    let current = new Date().getTime();
    this.delta = (current - this.previous) / 1000;
    this.previous = current;
  }
}
