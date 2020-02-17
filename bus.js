class Bus {
  constructor() {
    this.systemClockCounter = 0;
    // ram from 0x0000 to 0x3FFF
    this.cpuRam = Array(16384).fill(0);
    this.rom = null;
    this.cpu = new REW_6502(this);
    // rom from 0x8000 to 0xFFFF

    // io from 0x6000 to 0x600F
    this.rew6522 = new REW6522();
  }
  clock(delta) {
    this.cpu.clock(delta);
    this.rew6522.clock(delta);
  }
  reset() {
    this.cpu.reset();
  }
  loadRom(rom) {
    this.rom = rom;
  }
  /**
   * called by the cpu, reads an address on the bus mapped to different areas
   * @param {Number} address the address to access
   * @param {Boolean} readOnly if read only no other processes will take place, useful in debugging
   */
  CpuRead(address, readOnly) {
    let data = 0;
    let cartridgeRead = null;
    if(this.rom) {
      cartridgeRead = this.rom.CpuRead(address);
    }
    if(cartridgeRead != null) {
      data = cartridgeRead;
    } else if(address >= 0 && address <= 0x3FFF) {
      data = this.cpuRam[address];
    } else if(address >= 0x6000 && address <= 0x6000F) {
      // read from io
      // data = this.ppu.CpuRead(address & 0x0007, readOnly);
      return this.rew6522.read(address);
    } 
    return (data & 0xFF) >>> 0;
  }
  /**
   * called by the cpu, writes the value to an address on the bus mapped to different areas
   * @param {Number} address the address to access
   * @param {Number} val the value to write
   */
  CpuWrite(address, val) {
    val &= 0xFF;
    if(this.rom && this.rom.CpuWrite(address, val)) {
      // read from rom 0x8000 to 0xFFFF
    } else if(address >= 0 && address <= 0x3FFF) {
      this.cpuRam[address] = val;
    } else if(address >= 0x6000 && address <= 0x600F) {
      // write to io
      this.rew6522.write(address, val);
    } 
  }
}