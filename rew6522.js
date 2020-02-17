class REW6522 {
  constructor() {
    this.reset();
    this.display = new DisplayModule();
  }
  clock() {
    // this.display.writeData(this.bData);
    // this.display.wrtieControl(this.aData);
  }
  reset() {
    this.aData = 0x00;
    this.bData = 0x00;
    this.ddrA = 0x00;
    this.ddrB = 0x00;
  }
  read(address) {
    address = address & 0x000F; // constrain to bottom 16 bits
    let value = null;
    switch(address) {
      case 0:
        value = this.bData;
        break;
      case 1:
        value = this.aData;
        break;
      case 2:
        value = this.ddrB;
        break;
      case 3:
        value = this.ddrA;
        break;
      case 4:
        break;
      case 5:
        break;
      case 6:
        break;
      case 7:
        break;
      case 8:
        break;
      case 9:
        break;
      case 10:
        break;
      case 11:
        break;
      case 12:
        break;
      case 13:
        break;
      case 14:
        break;
      case 15:
        break;
    }
    return (value & 0xFF) >>> 0;
  }
  write(address, value) {
    address = address & 0x000F; // constrain to bottom 16 bits
    switch(address) {
      case 0:
        this.bData = (value & 0xFF) >>> 0;
        this.display.writeData(this.bData);
        break;
      case 1:
        this.aData = (value & 0xFF) >>> 0;
        this.display.writeControl(this.aData);
        break;
      case 2:
        this.ddrB = (value & 0xFF) >>> 0;
        break;
      case 3:
        this.ddrA = (value & 0xFF) >>> 0;
        break;
      case 4:
        break;
      case 5:
        break;
      case 6:
        break;
      case 7:
        break;
      case 8:
        break;
      case 9:
        break;
      case 10:
        break;
      case 11:
        break;
      case 12:
        break;
      case 13:
        break;
      case 14:
        break;
      case 15:
        break;
    }
  }
}