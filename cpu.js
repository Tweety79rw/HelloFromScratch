/**
 * the different status register flags
 */
const Flag = {
  C: 0x01, // Carry bit
  Z: 0x02, // Zero bit
  I: 0x04, // Interupt bit
  D: 0x08, // Decimal bit
  B: 0x10, // Break bit
  U: 0x20, // unused bit
  V: 0x40, // Overflow bit
  N: 0x80  // Negative bit
};
const STACK_POINTER_BASE = 0x0100;

/**
 * Class representing a 6502 cpu
 */
class REW_6502 {
  constructor(bus) {
    this.bus = bus;

    // the different registers
    this.status             = 0;
    this.accumulator        = 0;
    this.indexX             = 0;
    this.indexY             = 0;
    this.programCounter     = 0;
    this.stackPointer       = 0;

    // some local variables
    this.cycles = 0;
    this.opCode = 0;

    // the currently read in arrdess, the lower 4 bits of a instruction byte
    this.addressAbsolute = 0;
    this.addressRelative = 0;

    // lookup table for the instruction, in this way the opcode in memory
    // (0 to 255) is the index of the instruction to perform.
    // see Instruction class
    this.lookup =[
      new Instruction('BRK', this.BRK, this.IMM, 7),new Instruction('ORA', this.ORA, this.IZX, 6),new Instruction('???', this.XXX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 8),
        new Instruction('???', this.NOP, this.IMP, 3),new Instruction('ORA', this.ORA, this.ZP0, 3),new Instruction('ASL', this.ASL, this.ZP0, 5),new Instruction('???', this.XXX, this.IMP, 5),
        new Instruction('PHP', this.PHP, this.IMP, 3),new Instruction('ORA', this.ORA, this.IMM, 2),new Instruction('ASL', this.ASL, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 2),
        new Instruction('???', this.NOP, this.ABS, 4),new Instruction('ORA', this.ORA, this.ABS, 4),new Instruction('ASL', this.ASL, this.ABS, 6),new Instruction('???', this.XXX, this.IMP, 6),
      new Instruction('BPL', this.BPL, this.REL, 2),new Instruction('ORA', this.ORA, this.IZY, 5),new Instruction('???', this.XXX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 8),
        new Instruction('???', this.NOP, this.IMP, 4),new Instruction('ORA', this.ORA, this.ZPX, 4),new Instruction('ASL', this.ASL, this.ZPX, 6),new Instruction('???', this.XXX, this.IMP, 6),
        new Instruction('CLC', this.CLC, this.IMP, 2),new Instruction('ORA', this.ORA, this.ABY, 4),new Instruction('???', this.NOP, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 7),
        new Instruction('???', this.NOP, this.IMP, 4),new Instruction('ORA', this.ORA, this.ABX, 4),new Instruction('ASL', this.ASL, this.ABX, 7),new Instruction('???', this.XXX, this.IMP, 7),
      new Instruction('JSR', this.JSR, this.ABS, 6),new Instruction('AND', this.AND, this.IZX, 6),new Instruction('???', this.XXX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 8),
        new Instruction('BIT', this.BIT, this.ZP0, 3),new Instruction('AND', this.AND, this.ZP0, 3),new Instruction('ROL', this.ROL, this.ZP0, 5),new Instruction('???', this.XXX, this.IMP, 6),
        new Instruction('PLP', this.PLP, this.IMP, 4),new Instruction('AND', this.AND, this.IMM, 2),new Instruction('ROL', this.ROL, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 2),
        new Instruction('BIT', this.BIT, this.ABS, 4),new Instruction('AND', this.AND, this.ABS, 4),new Instruction('ROL', this.ROL, this.ABS, 6),new Instruction('???', this.XXX, this.IMP, 6),
      new Instruction('BMI', this.BMI, this.REL, 2),new Instruction('AND', this.AND, this.IZY, 5),new Instruction('???', this.XXX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 8),
        new Instruction('???', this.NOP, this.IMP, 4),new Instruction('AND', this.AND, this.ZPX, 4),new Instruction('ROL', this.ROL, this.ZPX, 6),new Instruction('???', this.XXX, this.IMP, 6),
        new Instruction('SEC', this.SEC, this.IMP, 2),new Instruction('AND', this.AND, this.ABY, 4),new Instruction('???', this.NOP, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 7),
        new Instruction('???', this.NOP, this.IMP, 4),new Instruction('AND', this.AND, this.ABX, 4),new Instruction('ROL', this.ROL, this.ABX, 7),new Instruction('???', this.XXX, this.IMP, 7),
      new Instruction('RTI', this.RTI, this.IMP, 6),new Instruction('EOR', this.EOR, this.IZX, 6),new Instruction('???', this.XXX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 8),
        new Instruction('???', this.NOP, this.IMP, 3),new Instruction('EOR', this.EOR, this.ZP0, 3),new Instruction('LSR', this.LSR, this.ZP0, 5),new Instruction('???', this.XXX, this.IMP, 5),
        new Instruction('PHA', this.PHA, this.IMP, 3),new Instruction('EOR', this.EOR, this.IMM, 2),new Instruction('LSR', this.LSR, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 2),
        new Instruction('JMP', this.JMP, this.ABS, 3),new Instruction('EOR', this.EOR, this.ABS, 4),new Instruction('LSR', this.LSR, this.ABS, 6),new Instruction('???', this.XXX, this.IMP, 6),
      new Instruction('BVC', this.BVC, this.REL, 2),new Instruction('EOR', this.EOR, this.IZY, 5),new Instruction('???', this.XXX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 8),
        new Instruction('???', this.NOP, this.IMP, 4),new Instruction('EOR', this.EOR, this.ZPX, 4),new Instruction('LSR', this.LSR, this.ZPX, 6),new Instruction('???', this.XXX, this.IMP, 6),
        new Instruction('CLI', this.CLI, this.IMP, 2),new Instruction('EOR', this.EOR, this.ABY, 4),new Instruction('???', this.NOP, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 7),
        new Instruction('???', this.NOP, this.IMP, 4),new Instruction('EOR', this.EOR, this.ABX, 4),new Instruction('LSR', this.LSR, this.ABX, 7),new Instruction('???', this.XXX, this.IMP, 7),
      new Instruction('RTS', this.RTS, this.IMP, 6),new Instruction('ADC', this.ADC, this.IZX, 6),new Instruction('???', this.XXX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 8),
        new Instruction('???', this.NOP, this.IMP, 3),new Instruction('ADC', this.ADC, this.ZP0, 3),new Instruction('ROR', this.ROR, this.ZP0, 5),new Instruction('???', this.XXX, this.IMP, 5),
        new Instruction('PLA', this.PLA, this.IMP, 4),new Instruction('ADC', this.ADC, this.IMM, 2),new Instruction('ROR', this.ROR, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 2),
        new Instruction('JMP', this.JMP, this.IND, 5),new Instruction('ADC', this.ADC, this.ABS, 4),new Instruction('ROR', this.ROR, this.ABS, 6),new Instruction('???', this.XXX, this.IMP, 6),
      new Instruction('BVS', this.BVS, this.REL, 2),new Instruction('ADC', this.ADC, this.IZY, 5),new Instruction('???', this.XXX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 8),
        new Instruction('???', this.NOP, this.IMP, 4),new Instruction('ADC', this.ADC, this.ZPX, 4),new Instruction('ROR', this.ROR, this.ZPX, 6),new Instruction('???', this.XXX, this.IMP, 6),
        new Instruction('SEI', this.SEI, this.IMP, 2),new Instruction('ADC', this.ADC, this.ABY, 4),new Instruction('???', this.NOP, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 7),
        new Instruction('???', this.NOP, this.IMP, 4),new Instruction('ADC', this.ADC, this.ABX, 4),new Instruction('ROR', this.ROR, this.ABX, 7),new Instruction('???', this.XXX, this.IMP, 7),
      new Instruction('???', this.NOP, this.IMP, 2),new Instruction('STA', this.STA, this.IZX, 6),new Instruction('???', this.NOP, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 6),
        new Instruction('STY', this.STY, this.ZP0, 3),new Instruction('STA', this.STA, this.ZP0, 3),new Instruction('STX', this.STX, this.ZP0, 3),new Instruction('???', this.XXX, this.IMP, 3),
        new Instruction('DEY', this.DEY, this.IMP, 2),new Instruction('???', this.NOP, this.IMP, 2),new Instruction('TXA', this.TXA, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 2),
        new Instruction('STY', this.STY, this.ABS, 4),new Instruction('STA', this.STA, this.ABS, 4),new Instruction('STX', this.STX, this.ABS, 4),new Instruction('???', this.XXX, this.IMP, 4),
      new Instruction('BCC', this.BCC, this.REL, 2),new Instruction('STA', this.STA, this.IZY, 6),new Instruction('???', this.XXX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 6),
        new Instruction('STY', this.STY, this.ZPX, 4),new Instruction('STA', this.STA, this.ZPX, 4),new Instruction('STX', this.STX, this.ZPY, 4),new Instruction('???', this.XXX, this.IMP, 4),
        new Instruction('TYA', this.TYA, this.IMP, 2),new Instruction('STA', this.STA, this.ABY, 5),new Instruction('TXS', this.TXS, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 5),
        new Instruction('???', this.NOP, this.IMP, 5),new Instruction('STA', this.STA, this.ABX, 5),new Instruction('???', this.XXX, this.IMP, 5),new Instruction('???', this.XXX, this.IMP, 5),
      new Instruction('LDY', this.LDY, this.IMM, 2),new Instruction('LDA', this.LDA, this.IZX, 6),new Instruction('LDX', this.LDX, this.IMM, 2),new Instruction('???', this.XXX, this.IMP, 6),
        new Instruction('LDY', this.LDY, this.ZP0, 3),new Instruction('LDA', this.LDA, this.ZP0, 3),new Instruction('LDX', this.LDX, this.ZP0, 3),new Instruction('???', this.XXX, this.IMP, 3),
        new Instruction('TAY', this.TAY, this.IMP, 2),new Instruction('LDA', this.LDA, this.IMM, 2),new Instruction('TAX', this.TAX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 2),
        new Instruction('LDY', this.LDY, this.ABS, 4),new Instruction('LDA', this.LDA, this.ABS, 4),new Instruction('LDX', this.LDX, this.ABS, 4),new Instruction('???', this.XXX, this.IMP, 4),
      new Instruction('BCS', this.BCS, this.REL, 2),new Instruction('LDA', this.LDA, this.IZY, 5),new Instruction('???', this.XXX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 5),
        new Instruction('LDY', this.LDY, this.ZPX, 4),new Instruction('LDA', this.LDA, this.ZPX, 4),new Instruction('LDX', this.LDX, this.ZPY, 4),new Instruction('???', this.XXX, this.IMP, 4),
        new Instruction('CLV', this.CLV, this.IMP, 2),new Instruction('LDA', this.LDA, this.ABY, 4),new Instruction('TSX', this.TSX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 4),
        new Instruction('LDY', this.LDY, this.ABX, 4),new Instruction('LDA', this.LDA, this.ABX, 4),new Instruction('LDX', this.LDX, this.ABY, 4),new Instruction('???', this.XXX, this.IMP, 4),
      new Instruction('CPY', this.CPY, this.IMM, 2),new Instruction('CMP', this.CMP, this.IZX, 6),new Instruction('???', this.NOP, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 8),
        new Instruction('CPY', this.CPY, this.ZP0, 3),new Instruction('CMP', this.CMP, this.ZP0, 3),new Instruction('DEC', this.DEC, this.ZP0, 5),new Instruction('???', this.XXX, this.IMP, 5),
        new Instruction('INY', this.INY, this.IMP, 2),new Instruction('CMP', this.CMP, this.IMM, 2),new Instruction('DEX', this.DEX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 2),
        new Instruction('CPY', this.CPY, this.ABS, 4),new Instruction('CMP', this.CMP, this.ABS, 4),new Instruction('DEC', this.DEC, this.ABS, 6),new Instruction('???', this.XXX, this.IMP, 6),
      new Instruction('BNE', this.BNE, this.REL, 2),new Instruction('CMP', this.CMP, this.IZY, 5),new Instruction('???', this.XXX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 8),
        new Instruction('???', this.NOP, this.IMP, 4),new Instruction('CMP', this.CMP, this.ZPX, 4),new Instruction('DEC', this.DEC, this.ZPX, 6),new Instruction('???', this.XXX, this.IMP, 6),
        new Instruction('CLD', this.CLD, this.IMP, 2),new Instruction('CMP', this.CMP, this.ABY, 4),new Instruction('???', this.NOP, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 7),
        new Instruction('???', this.NOP, this.IMP, 4),new Instruction('CMP', this.CMP, this.ABX, 4),new Instruction('DEC', this.DEC, this.ABX, 7),new Instruction('???', this.XXX, this.IMP, 7),
      new Instruction('CPX', this.CPX, this.IMM, 2),new Instruction('SBC', this.SBC, this.IZX, 6),new Instruction('???', this.NOP, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 8),
        new Instruction('CPX', this.CPX, this.ZP0, 3),new Instruction('SBC', this.SBC, this.ZP0, 3),new Instruction('INC', this.INC, this.ZP0, 5),new Instruction('???', this.XXX, this.IMP, 5),
        new Instruction('INX', this.INX, this.IMP, 2),new Instruction('SBC', this.SBC, this.IMM, 2),new Instruction('???', this.NOP, this.IMP, 2),new Instruction('SBC', this.SBC, this.IMP, 2),
        new Instruction('CPX', this.CPX, this.ABS, 4),new Instruction('SBC', this.SBC, this.ABS, 4),new Instruction('INC', this.INC, this.ABS, 6),new Instruction('???', this.XXX, this.IMP, 6),
      new Instruction('BEQ', this.BEQ, this.REL, 2),new Instruction('SBC', this.SBC, this.IZY, 5),new Instruction('???', this.XXX, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 8),
        new Instruction('???', this.NOP, this.IMP, 4),new Instruction('SBC', this.SBC, this.ZPX, 4),new Instruction('INC', this.INC, this.ZPX, 6),new Instruction('???', this.XXX, this.IMP, 6),
        new Instruction('SED', this.SED, this.IMP, 2),new Instruction('SBC', this.SBC, this.ABY, 4),new Instruction('???', this.NOP, this.IMP, 2),new Instruction('???', this.XXX, this.IMP, 7),
        new Instruction('???', this.NOP, this.IMP, 4),new Instruction('SBC', this.SBC, this.ABX, 4),new Instruction('INC', this.INC, this.ABX, 7),new Instruction('???', this.XXX, this.IMP, 7)
      ];
  }
  // returns an object with all the registers for the cpu plus some other things like current opCode
  dump() {
    return {
      status:this.status,
      accumulator:this.accumulator,
      indexX:this.indexX,
      indexY:this.indexY,
      programCounter:this.programCounter,
      stackPointer:this.stackPointer,
      cycles:this.cycles,
      opCode:this.opCode,
      addressAbsolute:this.addressAbsolute,
      addressRelative:this.addressRelative
    };
  }
  // helper to know when the instruction is complete
  complete() {
    return this.cycles == 0;
  }
  // get and set helper for the status register
  setFlag(flag, value) {
    if(value) {
      this.status |= flag;
    } else {
      this.status &= ~flag;
    }
  }
  getFlag(flag) {
    return ((this.status & flag) > 0)? 1 : 0;
  }
  // addressing mode
  // The addressing mode based on the 6502 chip. They all return a number that is added to the number of cycles the mode would add.
  IMP() {
    this.fetched = this.accumulator;
    return 0;
  }
  ZP0() {
    this.addressAbsolute = this.read(this.programCounter++);
    this.addressAbsolute &= 0x00FF;
    return 0;
  }
  ZPX() {
    this.addressAbsolute = (this.read(this.programCounter++) + this.indexX);
    this.addressAbsolute &= 0x00FF;
    return 0;
  }
  ZPY() {
    this.addressAbsolute = (this.read(this.programCounter++) + this.indexY);
    this.programCounter &= 0xFFFF;
    this.addressAbsolute &= 0x00FF;
    return 0;
  }
  ABS() {
    let obj = this.readHiLo(this.programCounter, 0xFFFF);
    this.programCounter += 2;
    this.addressAbsolute = (obj.hi << 8) | obj.lo;
    return 0;
  }
  ABX() {
    let obj = this.readHiLo(this.programCounter, 0xFFFF);
    this.programCounter += 2;
    this.addressAbsolute = (obj.hi << 8) | obj.lo;
    this.addressAbsolute += this.indexX;
    if((this.addressAbsolute & 0xFF00) != (obj.hi << 8))
      return 1;
    return 0;
  }
  ABY() {
    let obj = this.readHiLo(this.programCounter, 0xFFFF);
    this.programCounter += 2;
    this.addressAbsolute = (obj.hi << 8) | obj.lo;
    this.addressAbsolute += this.indexY;
    if((this.addressAbsolute & 0xFF00) != (obj.hi << 8))
      return 1;
    return 0;
  }
  IZX() {
    let t = this.read(this.programCounter++);
    let obj = this.readHiLo(t + this.indexX, 0x00FF);
    this.addressAbsolute = (obj.hi << 8) | obj.lo;
    return 0;
  }
  IMM() {
    this.addressAbsolute = this.programCounter++;
    return 0;
  }
  REL() {
    this.addressRelative = this.read(this.programCounter++);
    if(this.addressRelative & 0x80) {
      this.addressRelative |= 0xFF00;
    }
    return 0;
  }
  IND() {
    let obj = this.readHiLo(this.programCounter, 0xFFFF);
    this.programCounter += 2;
    let pointer = (obj.hi << 8) | obj.lo;
    if(obj.lo == 0x0FF) {
      this.addressAbsolute = (this.read(pointer & 0xFF00) << 8) | this.read(pointer);
    } else {
      this.addressAbsolute = (this.read(pointer + 1) << 8) | this.read(pointer);
    }
    return 0;
  }
  IZY() {
    let t = this.read(this.programCounter++);
    let obj = this.readHiLo(t, 0x00FF);
    this.addressAbsolute = (obj.hi << 8) | obj.lo;
    this.addressAbsolute += this.indexY;
    if((this.addressAbsolute & 0xFF00) != (obj.hi << 8))
      return 1;
    return 0;
  }
  // instruction set
  // Based on the 6502 chip they all return a number that is added to the number of cycles the instruction would add.
  ADC() {
    this.fetch();
    let temp = this.accumulator + this.fetched + this.getFlag(Flag.C);
    this.setFlag(Flag.C, temp > 255);
    this.setFlagNZ(temp);
    this.setFlag(Flag.V, (~(this.accumulator ^ this.fetched) & (this.accumulator ^ temp)) & 0x0080);
    this.accumulator = temp & 0xFF;
    return 1;
  }
  AND() {
    this.fetch();
    this.accumulator &= this.fetched;
    this.setFlagNZ(this.accumulator);
    return 1;
  }
  ASL() {
    this.fetch();
    let temp = this.fetched << 1;
    this.setFlag(Flag.C, (temp & 0xFF00));
    this.setFlagNZ(temp);
    if(this.lookup[this.opCode].addressMode == this.IMP) {
      this.accumulator = temp & 0x00FF;
    } else {
      this.write(this.addressAbsolute, temp & 0x00FF);
    }
    return 0;
  }
  BCC() {
    if(this.getFlag(Flag.C) == 0) {
      this.cycles++;
      this.addressAbsolute = this.programCounter + this.addressRelative;
      if((this.addressAbsolute & 0xFF00) != (this.programCounter & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter = this.addressAbsolute & 0xFFFF;
    }
    return 0;
  }
  BCS() {
    if(this.getFlag(Flag.C) == 1) {
      this.cycles++;
      this.addressAbsolute = this.programCounter + this.addressRelative;
      if((this.addressAbsolute & 0xFF00) != (this.programCounter & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter = this.addressAbsolute & 0xFFFF;
    }
    return 0;
  }
  BEQ() {
    if(this.getFlag(Flag.Z) == 1) {
      this.cycles++;
      this.addressAbsolute = this.programCounter + this.addressRelative;
      if((this.addressAbsolute & 0xFF00) != (this.programCounter & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter = this.addressAbsolute & 0xFFFF;
    }
    return 0;
  }
  BIT() {
    this.fetch();
    let temp = this.accumulator & this.fetched;
    this.setFlag(Flag.Z, (temp & 0x00FF) == 0x00);
    this.setFlag(Flag.N, (this.fetched & 0x80) > 0);
    this.setFlag(Flag.V, (this.fetched & 0x40) > 0);
    return 0;
  }
  BMI() {
    if(this.getFlag(Flag.N) == 1) {
      this.cycles++;
      this.addressAbsolute = (this.programCounter + this.addressRelative) & 0xFFFF;
      if((this.addressAbsolute & 0xFF00) != (this.programCounter & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter = this.addressAbsolute & 0xFFFF;
    }
    return 0;
  }
  BNE() {
    if(this.getFlag(Flag.Z) == 0) {
      this.cycles++;
      this.addressAbsolute = (this.programCounter + this.addressRelative) & 0xFFFF;
      if((this.addressAbsolute & 0xFF00) != (this.programCounter & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter = this.addressAbsolute & 0xFFFF;
    }
    return 0;
  }
  BPL() {
    if(this.getFlag(Flag.N) == 0) {
      this.cycles++;
      this.addressAbsolute = (this.programCounter + this.addressRelative) & 0xFFFF;
      if((this.addressAbsolute & 0xFF00) != (this.programCounter & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter = this.addressAbsolute & 0xFFFF;
    }
    return 0;
  }
  BRK() {
    this.programCounter++;
  	this.setFlag(Flag.I, true);
  	this.write(STACK_POINTER_BASE + this.stackPointer, (this.programCounter >> 8) & 0x00FF);
    this.stackPointer--;
  	this.write(STACK_POINTER_BASE + this.stackPointer, this.programCounter & 0x00FF);
  	this.stackPointer--;
  	this.setFlag(Flag.B, true);
  	this.write(STACK_POINTER_BASE + this.stackPointer, this.status);
    this.stackPointer--;
  	this.setFlag(Flag.B, false);

  	this.programCounter = this.read(0xFFFE) | (this.read(0xFFFF) << 8);
  	return 0;
  }
  BVC() {
    if(this.getFlag(Flag.V) == 0) {
      this.cycles++;
      this.addressAbsolute = this.programCounter + this.addressRelative;
      if((this.addressAbsolute & 0xFF00) != (this.programCounter & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter = this.addressAbsolute & 0xFFFF;
    }
    return 0;
  }
  BVS() {
    if(this.getFlag(Flag.V) == 1) {
      this.cycles++;
      this.addressAbsolute = (this.programCounter + this.addressRelative) & 0xFFFF;
      if((this.addressAbsolute & 0xFF00) != (this.programCounter & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter = this.addressAbsolute & 0xFFFF;
    }
    return 0;
  }
  CLC() {
    this.setFlag(Flag.C, false);
    return 0;
  }
  CLD() {
    this.setFlag(Flag.D, false);
    return 0;
  }
  CLI() {
    this.setFlag(Flag.I, false);
    return 0;
  }
  CLV() {
    this.setFlag(Flag.V, false);
    return 0;
  }
  CMP() {
    this.fetch();
    let temp = (this.accumulator - this.fetched) & 0xFF;
    this.setFlag(Flag.C, this.accumulator >= this.fetched);
    this.setFlagNZ(temp);
    return 1;
  }
  CPX() {
    this.fetch();
    let temp = (this.indexX - this.fetched) & 0xFF;
    this.setFlag(Flag.C, this.indexX >= this.fetched);
    this.setFlagNZ(temp);
    return 1;
  }
  CPY() {
    this.fetch();
    let temp = (this.indexY - this.fetched) & 0xFF;
    this.setFlag(Flag.C, this.indexY >= this.fetched);
    this.setFlagNZ(temp);
    return 1;
  }
  DEC() {
    this.fetch();
    let temp = (this.fetched - 1) & 0xFF;
    this.write(this.addressAbsolute, temp & 0x00FF);
    this.setFlagNZ(temp);
    return 0;
  }
  DEX() {
    this.indexX--;
    this.indexX &= 0xFF;
    this.setFlagNZ(this.indexX);
    return 0;
  }
  DEY() {
    this.indexY--;
    this.indexY &= 0xFF;
    this.setFlagNZ(this.indexY);
    return 0;
  }
  EOR() {
    this.fetch();
    this.accumulator = (this.accumulator ^ this.fetched) & 0xFF;
    this.setFlagNZ(this.accumulator);
    return 1;
  }
  INC() {
    this.fetch();
    let temp = (this.fetched + 1) & 0xFF;
    this.write(this.addressAbsolute, temp & 0x00FF);
    this.setFlagNZ(temp);
    return 0;
  }
  INX() {
    this.indexX++;
    this.indexX &= 0xFF;
    this.setFlagNZ(this.indexX);
    return 0;
  }
  INY() {
    this.indexY++;
    this.indexY &= 0xFF;
    this.setFlagNZ(this.indexY);
    return 0;
  }
  JMP() {
    this.programCounter = this.addressAbsolute & 0xFFFF;
    return 0;
  }
  JSR() {
    this.programCounter--;
    this.write(STACK_POINTER_BASE + this.stackPointer, (this.programCounter >> 8) & 0x00FF);
    this.stackPointer--;
    this.write(STACK_POINTER_BASE + this.stackPointer, this.programCounter & 0x00FF);
    this.stackPointer--;
    this.programCounter = this.addressAbsolute & 0xFFFF;
    return 0;
  }
  LDA() {
    this.fetch();
    this.accumulator = this.fetched;
    this.setFlag(Flag.Z, this.accumulator == 0);
    this.setFlag(Flag.N, this.accumulator & 0x80);
    return 1;
  }
  LDX() {
    this.fetch();
    this.indexX = this.fetched;
    this.setFlagNZ(this.indexX);
    return 1;
  }
  LDY() {
    this.fetch();
    this.indexY = this.fetched;
    this.setFlagNZ(this.indexY);
    return 1;
  }
  LSR() {
    this.fetch();
    this.setFlag(Flag.C, this.fetched & 0x0001);
    let temp = (this.fetched >> 1) & 0xFF;
    this.setFlagNZ(temp);
    if(this.lookup[this.opCode].addressMode == this.IMP) {
      this.accumulator = temp & 0x00FF;
    } else {
      this.write(this.addressAbsolute, temp & 0x00FF);
    }
    return 0;
  }
  NOP() {
    let retVal = 0;
    switch(this.opCode) {
      case 0x1C:
      case 0x3C:
      case 0x5C:
      case 0x7C:
      case 0xDC:
      case 0xFC:
        retVal = 1;
        break;
    }
    return retVal;
  }
  ORA() {
    this.fetch();
    this.accumulator = (this.accumulator | this.fetched) & 0xFF;
    this.setFlagNZ(this.accumulator);
    return 1;
  }
  SBC() {
    this.fetch();
    let value = (this.fetched ^ 0xFF);
    let temp = (this.accumulator + value + this.getFlag(Flag.C));
    this.setFlag(Flag.C, temp > 255);
    this.setFlagNZ(temp);
    this.setFlag(Flag.V, (~(this.fetched ^ temp) & (this.accumulator ^ temp)) & 0x0080);
    this.accumulator = temp & 0xFF;
    return 1;
  }
  PHA() {
    this.write(STACK_POINTER_BASE + this.stackPointer, this.accumulator);
    this.stackPointer--;
    return 0;
  }
  PHP() {
    this.write(STACK_POINTER_BASE + this.stackPointer, this.status | Flag.B | Flag.U);
    this.setFlag(Flag.B, false);
    this.setFlag(Flag.U, false);
    this.stackPointer--;
    return 0;
  }
  PLA() {
    this.stackPointer++;
    this.accumulator = this.read(STACK_POINTER_BASE + this.stackPointer);
    this.setFlagNZ(this.accumulator);
    return 0;
  }
  PLP() {
    this.stackPointer++;
    this.status = this.read(STACK_POINTER_BASE + this.stackPointer);
    this.setFlag(Flag.U, true);
    return 0;
  }
  ROL() {
    this.fetch();
    let temp = (this.fetched << 1) | this.getFlag(Flag.C);
    this.setFlag(Flag.C, temp & 0xFF00);
    this.setFlagNZ(temp);
    if(this.lookup[this.opCode].addressMode == this.IMP) {
      this.accumulator = temp & 0xFF;
    } else {
      this.write(this.addressAbsolute, temp & 0xFF);
    }
    return 0;
  }
  ROR() {
    this.fetch();
    let temp = (this.getFlag(Flag.C) << 7) | (this.fetched >> 1);
    this.setFlag(Flag.C, this.fetched & 0x0001);
    this.setFlagNZ(temp);
    if(this.lookup[this.opCode].addressMode == this.IMP) {
      this.accumulator = temp & 0xFF;
    } else {
      this.write(this.addressAbsolute, temp & 0xFF);
    }
    return 0;
  }
  RTI() {
    this.stackPointer++;
    this.status = this.read(STACK_POINTER_BASE + this.stackPointer);
    this.status &= ~Flag.B;
    this.status &= ~Flag.U;
    this.stackPointer++;
    this.programCounter = this.read(STACK_POINTER_BASE + this.stackPointer);
    this.stackPointer++;
    this.programCounter |= this.read(STACK_POINTER_BASE + this.stackPointer) << 8;
    return 0;
  }
  RTS() {
    this.stackPointer++;
    this.programCounter = this.read(STACK_POINTER_BASE + this.stackPointer);
    this.stackPointer++;
    this.programCounter |= this.read(STACK_POINTER_BASE + this.stackPointer) << 8;
    this.programCounter++;
    return 0;
  }
  SEC() {
    this.setFlag(Flag.C, true);
    return 0;
  }
  SED() {
    this.setFlag(Flag.D, true);
    return 0;
  }
  SEI() {
    this.setFlag(Flag.I, true);
    return 0;
  }
  STA() {
    this.write(this.addressAbsolute, this.accumulator);
    return 0;
  }
  STX() {
    this.write(this.addressAbsolute, this.indexX);
    return 0;
  }
  STY() {
    this.write(this.addressAbsolute, this.indexY);
    return 0;
  }
  TAX() {
    this.indexX = this.accumulator;
    this.setFlagNZ(this.indexX);
    return 0;
  }
  TAY() {
    this.indexY = this.accumulator;
    this.setFlagNZ(this.indexY);
    return 0;
  }
  TSX() {
    this.indexX = this.stackPointer;
    this.setFlagNZ(this.indexX);
    return 0;
  }
  TXA() {
    this.accumulator = this.indexX;
    this.setFlagNZ(this.accumulator);
    return 0;
  }
  TXS() {
    this.stackPointer = this.indexX;
    return 0;
  }
  TYA() {
    this.accumulator = this.indexY;
    this.setFlagNZ(this.accumulator);
    return 0;
  }
  XXX() {
    return 0;
  }
  // sets the negative and zero flag based on val. I made this because
  //  the zero and negative flag are set the same in many places.
  setFlagNZ(val) {
    this.setFlag(Flag.Z, (val & 0x00FF) == 0);
    this.setFlag(Flag.N, val & 0x80);
  }
  // reads from the bus at address val and val + 1 returning the lo and hi byte
  readHiLo(val, mask) {
    return  {
      lo: (this.read(val & mask) >>> 0),
      hi: (this.read((val + 1) & mask) >>> 0)
    };
  }
  // access the bus depending on the mapping of the bus different parts of the nes can be accessed.
  read(address) {
    return (this.bus.CpuRead(address, false) & 0xFF) >>> 0;
  }
  write(address, val) {
    this.bus.CpuWrite(address, val & 0xFF);
  }
  // perform the instruction then wait the apropriate number of cycles per instruction
  clock(delta) {
    if(this.cycles == 0) {
      // get the opcode
      this.opCode = this.read(this.programCounter++);
      // get the number of cycles for this instruction
      this.cycles = this.lookup[this.opCode].cycles;
      // call the addressing mode function
      this.cycles += this.lookup[this.opCode].addressMode.call(this);
      // call the operate on instruction function
      this.cycles += this.lookup[this.opCode].operate.call(this);
    }
    this.accumulator &= 0xFF;
    this.programCounter &= 0xFFFF;
    this.addressAbsolute &= 0xFFFF;
    this.stackPointer &= 0xFF;
    // decrement cycles
    this.cycles--;
  }
  irq() {
    if(this.getFlag(Flag.I) == 0) {
      this.write(STACK_POINTER_BASE + this.stackPointer, (this.programCounter >> 8) & 0x00FF);
      this.stackPointer--;
      this.write(STACK_POINTER_BASE + this.stackPointer, this.programCounter & 0x00FF);
      this.stackPointer--;
      this.setFlag(Flag.B, false);
      this.setFlag(Flag.U, true);
      this.setFlag(Flag.I, true);
      this.write(STACK_POINTER_BASE + this.stackPointer, this.status);
      this.stackPointer--;
      this.addressAbsolute = 0xFFFE;
      let lo = this.read(this.addressAbsolute + 0);
      let hi = this.read(this.addressAbsolute + 1);
      this.programCounter = (hi << 8) | lo;
      this.cycles = 7;
    }
  }
  nmi() {
    this.write(STACK_POINTER_BASE + this.stackPointer, (this.programCounter >> 8) & 0x00FF);
    this.stackPointer--;
    this.write(STACK_POINTER_BASE + this.stackPointer, this.programCounter & 0x00FF);
    this.stackPointer--;
    this.setFlag(Flag.B, false);
    this.setFlag(Flag.U, true);
    this.setFlag(Flag.I, true);
    this.write(STACK_POINTER_BASE + this.stackPointer, this.status);
    this.stackPointer--;
    this.addressAbsolute = 0xFFFA;
    let lo = this.read(this.addressAbsolute + 0);
    let hi = this.read(this.addressAbsolute + 1);
    this.programCounter = (hi << 8) | lo;
    this.cycles = 8;
  }
  // reset the cpu
  reset() {
    this.addressAbsolute = 0xFFFC;
    let lo = this.read(this.addressAbsolute + 0);
    let hi = this.read(this.addressAbsolute + 1);
    this.programCounter = (hi << 8) | lo;
    this.accumulator = 0;
    this.indexX = 0;
    this.indexY = 0;
    this.stackPointer = 0xFD;
    this.status = 0x00 | Flag.U;
    this.addressRelative = 0;
    this.addressAbsolute = 0;
    this.fetched = 0;
    this.cycles = 8;
  }
  // fetch from the memory address
  fetch() {
    if(this.lookup[this.opCode].addressMode !== this.IMP)
      this.fetched = this.read(this.addressAbsolute & 0xFFFF);
    return this.fetched;
  }
  // From start to stop each memory address is tested for a cpu instruction for the 6502. 
  // The instruction is then put into a human readable string, that is placed in a map with the address as the key.
  // Out side of this class the program counter can be used to address the map then display the current instruction
  // as well as some instructions before and after.
  disassemble(start, stop) {
    function toHex(v, pad) {
      v &= 0xFFFF;
      return v.toString(16).padStart(pad, '0').toUpperCase();
    }
    let addr = start;
    let mapLines = {};
    let lineAdder = 0;
    while(addr <= stop) {
      lineAdder = addr;
      let instruction = '$' + toHex(addr, 4) + ': ';
      let opcode = this.bus.CpuRead(addr++, true);
      // if(opcode < 0 || opcode > 255)
      //   continue;
      instruction += this.lookup[opcode].name + ' ';
      if(this.lookup[opcode].addressMode == this.IMP) {
        instruction += ' {IMP}';
      } else if(this.lookup[opcode].addressMode == this.IMM) {
        let value = this.bus.CpuRead(addr++, true);
        instruction += '#$' + toHex(value, 4) + ' {IMM}';
      } else if(this.lookup[opcode].addressMode == this.ZP0) {
        let value = this.bus.CpuRead(addr++, true);
        instruction += '$' + toHex(value, 2) + ' {ZP0}';
      } else if(this.lookup[opcode].addressMode == this.ZPX) {
        let value = this.bus.CpuRead(addr++, true);
        instruction += '$' + toHex(value, 2) + ' X {ZPX}';
      } else if(this.lookup[opcode].addressMode == this.ZPY) {
        let value = this.bus.CpuRead(addr++, true);
        instruction += '$' + toHex(value, 2) + ' Y {ZPX}';
      } else if(this.lookup[opcode].addressMode == this.ABS) {
        let lo = this.bus.CpuRead(addr++, true);
        let hi = this.bus.CpuRead(addr++, true);
        instruction += '$' + toHex((hi << 8) | lo, 4) + ' {ABS}';
      } else if(this.lookup[opcode].addressMode == this.ABX) {
        let lo = this.bus.CpuRead(addr++, true);
        let hi = this.bus.CpuRead(addr++, true);
        instruction += '$' + toHex((hi << 8) | lo, 4) + ' X {ABX}';
      } else if(this.lookup[opcode].addressMode == this.ABY) {
        let lo = this.bus.CpuRead(addr++, true);
        let hi = this.bus.CpuRead(addr++, true);
        instruction += '$' + toHex((hi << 8) | lo, 4) + ' Y {ABY}';
      } else if(this.lookup[opcode].addressMode == this.IND) {
        let lo = this.bus.CpuRead(addr++, true);
        let hi = this.bus.CpuRead(addr++, true);
        instruction += '($' + toHex((hi << 8) | lo, 4) + ') {IND}';
      } else if(this.lookup[opcode].addressMode == this.REL) {
        let lo = this.bus.CpuRead(addr++, true);
        instruction += '$' + toHex(lo, 2) + ' [$' + toHex(addr + ((lo & 0x80)?(lo | 0xFF00):lo), 4) + '] {REL}';
      }
      mapLines[lineAdder] = instruction;
    }
    return mapLines;
  }
}
