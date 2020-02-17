class Rom {
  constructor(file) {
    this.fileName = file;
    this.prgMemory = [];
    let _this = this;
    loadBytes(this.fileName, function(data) {_this.load(data);});
  }
  /**
   * parses the information from a rom file
   * @param {Bytes} data the bytes from a rom file
   */
  load(data) {
    this.prgMemory = data.bytes.slice(0);
  }
  /**
   * called when the cpu tries to read from the bus
   * @param {Number} address the address to access
   * @returns the 8 bit data from the cartridge if the mapper address is valid, null otherwise.
   */
  CpuRead(address) {
    if(address >= 0x8000 && address <= 0xFFFF) {
      let mappedAddress = (address & 0x7FFF) >>> 0;
      if(mappedAddress != null) {
        // if(address >= 0x6000 && address <= 0x7FFF) {
        //   return this.prgRam[mappedAddress] & 0xFF;
        // }
        return (this.prgMemory[mappedAddress] & 0xFF) >>> 0;
      }
    }
    return null;
  }
  /**
   * called when the cpu tries to write to the bus
   * @param {Number} address the address to access
   * @param {Number} value the value to write
   * @returns true if the write was valid based on the mapper, false otherwise
   */
  CpuWrite(address, value) {
    if(address >= 0x8000 && address <= 0xFFFF) { 
      let mappedAddress = (address & 0x7FFF) >>> 0;
      if(mappedAddress != null) {
        // if(address >= 0x6000 && address <= 0x7FFF) {
        //   this.prgRam[mappedAddress] = value;
        // } else {
          this.prgMemory[mappedAddress] = value;
        // }
        return true;
      }
    }
    return false;
  }
}