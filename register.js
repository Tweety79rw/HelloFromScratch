/**
 * @file register.js
 * @author Ryan Wilson
 * @copyright
 * MIT License
 * 
 * Copyright (c) 2019 Ryan Earl Wilson
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Class represeting a Register
 */
class Register {
  /**
   * creates a Register
   * Base class of a register. Initalizes a variable to the size initReg and provides some helper functions used in the inherted classes
   * the bit map object passed in will create parameters using the name in the MapItem
   * @example
   * ///
   * //class representing an Object Attribute Entry
   * //&#64;extends Register
   * //  
   * class ObjectAttributeEntry extends Register {
   *   ///
   *    // Creates a new ObjectAttributeEntry
   *    // This is a representation of the object attribute memory from a nes ppu it allows for the 4 bytes of information about the object 
   *    // to be stored in one 32 bit variable and accessed as individual values
   *    // &#64;param {Object, Integer} val used as a copy constructor, passing in an existing ObjectAttributeEntry or the reg of that object copies to the register value
   *    //
   *   constructor(val) {
   *     super(32, {
   *       YIN: new MapItem('y', 0xFF, 0, 0xFF),
   *       ID: new MapItem('id', 0xFF00, 8, 0xFF),
   *       ATT: new MapItem('attribute', 0xFF0000, 16, 0xFF),
   *       XIN: new MapItem('x', 0xFF000000, 24, 0xFF),
   *     });
   *     if(val instanceof ObjectAttributeEntry) {
   *       this.reg = (val.reg & this.regSizeMask) >>> 0;
   *     } else if(Number.isInteger(val)) {
   *       this.reg = (val & this.regSizeMask) >>> 0;
   *     }
   *   }
   *   ///
   *    // The ppu creates an array of 8 object attribute memory objects each frame and in my implementation I edit the values 
   *    // while processing the frame so i don't want to be editing the original object, also i don't need to create a 
   *    // new objectAttributeEntry because it is rather slow. So this creates just the basic object that I need to use in the ppu.
   *    //
   *   basicObject() {
   *     return {
   *       y:this.y,
   *       id:this.id,
   *       attribute:this.attribute,
   *       x:this.x
   *     };
   *   }
   * }
   * ///
   *  // Class representing the control register for a nes ppu
   *  // &#64;extends Register
   *  //
   * class ControlReg extends Register {
   *   ///
   *    // creates a Control Register
   *    //
   *   constructor() {
   *     super(8, {
   *       NTX: new MapItem('nametable_x',         0x01, 0, 0x1),
   *       NTY: new MapItem('nametable_y',         0x02, 1, 0x1),
   *       INC: new MapItem('increment_mode',      0x04, 2, 0x1),
   *       PSP: new MapItem('pattern_sprite',      0x08, 3, 0x1),
   *       PBG: new MapItem('pattern_background',  0x10, 4, 0x1),
   *       SPS: new MapItem('sprite_size',         0x20, 5, 0x1),
   *       SLM: new MapItem('slave_mode',          0x40, 6, 0x1),
   *       NMI: new MapItem('enable_nmi',          0x80, 7, 0x1)
   *     });
   *   }
   * }
   * 
   * let control = new ControlReg();
   * control.reg = 0x12; // can set with any integer
   * // because what is stored in the reg variable is 18 or (0001 0010 in binary)
   * // the following will set nameY to 1
   * let nameY = control.nametable_y;
   * // likewise nameX will be set to 0
   * let nameX = control.nametable_x;
   * // this sets the enable_nmi bit to 1 making the reg 82 (0101 0010 in binary) setting that bit in the reg variable
   * control.enable_nmi = 1;
   * // this sets the reg to 0000 0000
   * control.reg = 0;
   * 
   * let oamEntry = new ObjectAttributeEntry();
   * oamEntry = 256; // could also use 0xFF;
   * // this will make y == 256 all others will still be 0 because this is 32 bits 
   * @example
   * // this is another way to make the registers that is a little more involved
   * 
   * 
   * ///
   *  // Class represeting the status register
   *  // &#64extends Register
   *  //
   * class StatusReg extends Register {  
   *  this.BitMap = {
   *       UNU: new MapItem('unused',          0x1F, 0, 0x1F),
   *       SOF: new MapItem('sprite_overflow', 0x20, 5, 0x1),
   *       SZH: new MapItem('sprite_zero_hit', 0x40, 6, 0x1),
   *       VBL: new MapItem('vertical_blank',  0x80, 7, 0x1)
   *     }
   * ///
   *  // creates a Status Register
   *  //
   *   constructor() {
   *     super(8);
   *   }
   *   get unused() {
   *     return this.getRegisterElement(this.BitMap.UNU) & this.valueMask;
   *   }
   *   set unused(val) {
   *     this.reg = this.setRegisterElement(this.BitMap.UNU, val); 
   *   }
   *    get sprite_overflow() {
   *     return this.getRegisterElement(this.BitMap.SOF) & this.valueMask;
   *   }
   *   set sprite_overflow(val) {
   *     this.reg = this.setRegisterElement(this.BitMap.SOF, val); 
   *   }
   *   get sprite_zero_hit() {
   *     return this.getRegisterElement(this.BitMap.SZH) & this.valueMask;
   *   }
   *   set sprite_zero_hit(val) {
   *     this.reg = this.setRegisterElement(this.BitMap.SZH, val); 
   *   }
   *   get vertical_blank() {
   *     return this.getRegisterElement(this.BitMap.VBL) & this.valueMask;
   *   }
   *   set vertical_blank(val) {
   *     this.reg = this.setRegisterElement(this.BitMap.VBL, val); 
   *   }
   * 
   * }
   * @param {Number} size, the number of bits this register will represent. all bit wise opperation in JavaScript are performed 
   * on a 32 bit variable, so values larger than 32 will wrap around and negative number will have the opposite effect i.e. choosing -8 will give a 24 bit register.
   * @param {Object} BitMap the mapping for the bit fields, should be a key value pair of MapItems
   * @see MapItems
   */
  constructor(size, BitMap) {
    this.regSizeMask = (~0x00) >>> -size;
    this.reg = 0x00;
    if(BitMap) {
      this.BitMap = BitMap;
      for(let bitM of Object.values(this.BitMap)) {
        Object.defineProperty(this, bitM.name, { 
          get: function() {
            return this.getRegisterElement(bitM) & bitM.valueMask;
          },
          set: function(val) { 
            this.setRegisterElement(bitM, val);
          }
        });
      }
    }
  }
  /**
   * gets the register element in the following way
   * the register anded with the mask then shifted
   * @param {Object} bitMap the bit map for the element 
   * @see MapItem
   * @returns the element from the reg like using bit fields
   */
  getRegisterElement(bitMap) {
    return ((this.reg & bitMap.mask) >>> bitMap.shift);
  }
  /**
   * sets the register element in the following way
   * take all the bits in the register that are not the current element then or them with 
   * the new value masked with the size expected shifted the amount expected
   * @param {Object} bitMap the bit map for the element 
   * @param {Number} val the value to set the element
   * @see MapItem
   */
  setRegisterElement(bitMap, val) {
    this.reg = ((this.reg & ~bitMap.mask) | ((val & bitMap.valueMask) << bitMap.shift));
  }
   /**
   * adds a value to the register then makes sure proper wrapping occurs
   * @param {Number} val the value to add to the register
   */
  add(val) {
    this.reg += val;
    this.reg &= this.regSizeMask;
  }
  /**
   * sets the register to the val in the following way
   * mask the value with the size of the register so it will properly wrap the bits and
   * store it as a positive with ">>> 0"
   * @param {Number} val the value to set the register
   */
  setAll(val) {
    this.reg = (val & this.regSizeMask) >>> 0;
  }
}

/**
 * Class represeting a MapItem 
 */
class MapItem {
  /**
   * More used as a structure to contain the masks and shifts used to get elements from a register
   * Modeled this to work like a c++ bit field
   * @param {String} name the name of the bit field, used when getting or setting the property
   * @param {Number} mask the mask to apply to the reg variable when getting the value and the bit wise not (~) mask when setting
   * @param {Number} shift the number of bits to shift right shift when getting left shift when setting
   * @param {Number} valueMask the mask to apply to the value when setting the reg variable making sure it stays the appropriate size
   */
  constructor(name, mask, shift, valueMask) {
    this.name = name;
    this.mask = mask;
    this.shift = shift;
    this.valueMask = valueMask;
  }
}