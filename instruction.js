// This is more of a struct than a class
// It holds the name of the instruction i.e. 'STA'.
// The function the will perform the operation.
// The Cycles it takes to process this instruction
class Instruction {
  constructor(name, fn, mode, cycles) {
    this.name = name;
    this.operate = fn;
    this.addressMode = mode;
    this.cycles = cycles;
  }
}
