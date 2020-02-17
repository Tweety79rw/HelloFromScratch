/**
 * Class represeting the InstructionReg register
 * @extends Register
 */
class InstructionReg extends Register {  
  /**
   * creates a Status Register
   */
  constructor() {
    super(10, {
      DATA: new MapItem('data',     0xFF , 0, 0xFF),  
      RS: new MapItem('reg_select', 0x100, 8, 0x1),
      RW: new MapItem('read_write', 0x200, 9, 0x1),
    });
  }
}
/**
 * Class represeting the status register
 * @extends Register
 */
class Status extends Register {  
  /**
   * creates a Status Register
   */
  constructor() {
    super(8, {
      ID: new MapItem('inc_dec',      0x01, 0, 0x1),  
      S:  new MapItem('shift',        0x02, 1, 0x1),
      SC: new MapItem('shift_cursor', 0x04, 2, 0x1),
      RL: new MapItem('shift_dir',    0x08, 3, 0x1),  
      DL: new MapItem('data_length',  0x10, 4, 0x1),
      N:  new MapItem('num_lines',    0x20, 5, 0x1),
      F:  new MapItem('font',         0x40, 6, 0x1),  
      BF: new MapItem('busy_flag',    0x80, 7, 0x1),
    });
  }
}


class DisplayModule {
  constructor() {
    this.charRam = [];
    this.instructionReg = new InstructionReg();
    this.address = 0;
    this.shift = 0;
    this.status = new Status();
    
    this.displayOn = 0;
    this.showCursor = 0;
    this.blinkCursor = 0;
  }
  getChars() {
    return this.charRam.map(function(d) { return String.fromCharCode(d);}).join("");
  }
  read() {
    return (this.buffData & 0xFF) >>> 0;
  }
  writeControl(value) {
    this.control = (value & 0xE0) >>> 5;
    this.instructionReg.setAll(((this.control & 0x3) << 8) | this.buffData);
    if(((this.control & 0x4) >>> 2) == 1) {
      if(this.instructionReg.reg_select == 1) {
        if(this.instructionReg.read_write == 1) {
           return this.charRam[this.address]; 
        } else {
          this.charRam[this.address] = this.instructionReg.data;
          this.address += (this.status.inc_dec == 1? 1: -1);         
        }
        // if(this.status.shift_cursor() == 1) {          
        //   this.shift += (this.status.shift_dir() == 1? 1: -1);          
        // } else {
          
        // }
        
      } else {
        if(this.instructionReg.read_write == 1) {
          // read busy flag and address
          return 0;
        } else {
          if(((this.instructionReg.data & 0x80) >>> 7) == 1) {
            // set ddram address
            this.address = this.instructionReg.data & 0x7F;
          } else if(((this.instructionReg.data & 0x40) >>> 6) == 1) {
            // set cgram address
            this.shift = this.instructionReg.data & 0x3F;
          } else if(((this.instructionReg.data & 0x20) >>> 5) == 1) {
            // function set
            this.status.data_length = (this.instructionReg.data & 0x10) >>> 4;
            this.status.num_lines = (this.instructionReg.data & 0x08) >>> 3;
            this.status.font = (this.instructionReg.data & 0x04) >>> 2;
          } else if(((this.instructionReg.data & 0x10) >>> 4) == 1) {
            // cursor display shift
            this.status.shift_cursor = (this.instructionReg.data & 0x08) >>> 3;
            this.status.shift_dir = (this.instructionReg.data & 0x04) >>> 2;
          } else if(((this.instructionReg.data & 0x8) >>> 3) == 1) {
            // display on off control
            this.displayOn = (this.instructionReg.data & 0x04) >>> 2;
            this.showCursor = (this.instructionReg.data & 0x02) >>> 1;
            this.blinkCursor = this.instructionReg.data & 0x01;
          } else if(((this.instructionReg.data & 0x4) >>> 2) == 1) {
            // entry mode set
            this.status.inc_dec = (this.instructionReg.data & 0x02) >>> 1;
            this.status.shift = (this.instructionReg.data & 0x01);
          } else if(((this.instructionReg.data & 0x2) >>> 1) == 1) {
            // return home
            this.address = 0;
          } else if((this.instructionReg.data & 0x1) == 1) {
            // clear display
            for(let i = 0; i < this.charRam.length; i++) {
              this.charRam[i] = 0;
            }
          }
        }
      }
    }
  }
  writeData(value) {
    this.buffData = (value & 0xFF) >>> 0;
  }
}