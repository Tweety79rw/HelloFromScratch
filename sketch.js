
let bus;
let timer;
let cartridge;
let emulation = false;
let outDisplays = [];
let topRam = 0;
let bottomRam = 0x8000;
let residualTime = 0;
let osc;
let osc2;
let selectedPalette = 0;
// helper function to draw the ram
function drawRam(x, y, naddr, rows, cols) {
  push();
  translate(x, y);
  noStroke();
  fill(255);
  let cellHeight = 20;
  let cellWidth = 30;
  for(let row = 0; row < rows; row++) {
    text('$' + naddr.toString(16).padStart(4, '0'), 0, cellHeight * row);
    for(let col = 0; col < cols; col++) {
      text('0x' + bus.CpuRead(naddr++).toString(16).padStart(2, '0').toUpperCase(), 40 + cellWidth * col , cellHeight * row);
    }
  }
  pop();
}
// helper function to draw the cpu state
function drawCpu(x, y) {
  let row = 0;
  let rowOffset = 20;
  push();
  translate(x, y);
  noStroke();
  fill(255);
  let d = bus.cpu.dump();
  let keys = Object.keys(d);
  let maxKey = keys.reduce(function(a, e) {
    a = max(a, e.length);
    return a;
  }, 0);
  text(keys[0], 0, 0);
  let statusChars = 'NVUBDIZC';
  //text(, maxKey*7, -20);
  let statusString = d[keys[0]].toString(2).padStart(8, '0');
  for(let i = 0; i < statusString.length; i++) {
    if(statusString[i] === '1') {
      fill(0, 255, 0);
    } else {
      fill(255);
    }
    text(statusChars[i], maxKey*7 + i*9, 0);
  }
  fill(255);
  for(let i = 1; i < keys.length; i++) {
    text(keys[i], 0, i * rowOffset);
    text(d[keys[i]].toString(2).padStart(8, '0'), maxKey*7, i * rowOffset);
  }
  pop();
}
// debug function to draw the current execution of code
function drawCode(x, y, lines, dump) {
  push();
  translate(x, y);
  noStroke();
  let keys = Object.keys(dump);
  let pcIndex = keys.indexOf(bus.cpu.programCounter.toString());
  fill(0, 255, 0);
  if(pcIndex >= 0)
    text(dump[keys[pcIndex]], 0, floor(lines/2) * 20);
  fill(255);
  for(let i = floor(lines/2); i > 0 && pcIndex - i >= 0; i--) {
    let op = dump[keys[pcIndex - i]];
    if(op)
      text(op, 0, -i * 20 + floor(lines/2) * 20);
  }
  for(let i = 1; i < floor(lines/2) && pcIndex + i <= 0xFFFF; i++) {
    let op = dump[keys[pcIndex + i]];
    if(op)
      text(op, 0, i * 20 + floor(lines/2)*20);
  }
  pop();
}
// create the nes and load a cartridge nes file
function preload() {
  bus = new Bus();
  rom = new Rom('a.out');
}
function setup() {
  // create a canvas
  createCanvas(1624, 910);
  // init the timer
  timer = new Timer();
  bus.loadRom(rom);
 // reset the system
  bus.reset();
}
// function to run the cycles until an instruction is complete
function runCycles() {
  do {
    bus.cpu.clock();
  } while(!bus.cpu.complete())
}
/**
 * p5 mouse events
 * runs one cpu instruction
 */
function mouseClicked() {
  runCycles();
}
function keyPressed() {
  // some debug keys that can be pressed to interact with the nes emulator
  if(key === ' ') {
    runCycles();
  }
  if(key.toLowerCase() === 'r') {
    bus.cpu.reset();
  }
  if(key.toLowerCase() === 'i') {
    bus.cpu.irq();
  }
  if(key.toLowerCase() === 'n') {
    bus.cpu.nmi();
  }
  if(key.toLowerCase() === 'w') {
    if(topRam - 0x1 >= 0)
      topRam -= 0x1;
    else
      topRam = 0;
  }
  if(key.toLowerCase() === 's') {
    if(topRam + 0x1 <= 0xFFF0);
      topRam += 0x1;
  }
  if(key.toLowerCase() === 'a') {
    if(bottomRam - 0xF >= 0)
      bottomRam -= 0xF;
  }
  if(key.toLowerCase() === 'd') {
    if(bottomRam + 0xF <= 0xFFF0);
      bottomRam += 0xF;
  }
  if(key.toLowerCase() === 'c') {
    do{bus.clock();} while(!bus.cpu.complete());
    do{bus.clock();} while(bus.cpu.complete());
  }
  if(key.toLowerCase() === 'f') {
    // do{bus.clock();} while(!bus.ppu.frameComplete);
    do{bus.clock();} while(bus.cpu.complete());
    // bus.ppu.frameComplete = false;
  }
  if(key.toLowerCase() === ' ') {
    emulation = !emulation;
    //bus.apu.startAudio();
    // osc.start();
    // osc2.start();
    return false;
  }
  if(key.toLowerCase() === 'p') {
    // selectedPalette++;
    // selectedPalette &= 0x07;
  }

 
 
}
/**
 * p5 draw loop gets called by p5.js
 */
function draw() {
  background(0, 0, 200);
  // controller 1
  // bus.controller[0] = 0x00;
  // bus.controller[0] |= keyIsDown(76)?  0x80: 0x00;
  // bus.controller[0] |= keyIsDown(75)?  0x40: 0x00;
  // bus.controller[0] |= keyIsDown(74)?  0x20: 0x00;
  // bus.controller[0] |= keyIsDown(RETURN)? 0x10: 0x00;
  // bus.controller[0] |= keyIsDown(UP_ARROW)? 0x08: 0x00;
  // bus.controller[0] |= keyIsDown(DOWN_ARROW)? 0x04: 0x00;
  // bus.controller[0] |= keyIsDown(LEFT_ARROW)? 0x02: 0x00;
  // bus.controller[0] |= keyIsDown(RIGHT_ARROW)? 0x01: 0x00;

  // update the p5 image pixels if they have been set
  // bus.ppu.palScreen.updatePixels();
  // // draw the image in the canvas
  // image(bus.ppu.palScreen, 0, 0, 256 * 3.75, 240 * 3.75);

  // display the pattern tables for the nes
  // let patternT1 = bus.ppu.getPatternTable(0, selectedPalette);
  // patternT1.updatePixels();
  // let patternT2 = bus.ppu.getPatternTable(1, selectedPalette);
  // patternT2.updatePixels();
  
  
  // display the state of the cpu
  //drawCpu(width - 300, 50);
  // draw the current code
  //drawCode(width - 300, 300, 16, bus.cpu.disassemble(0x8000, 0xFFFF));
  // draw the first 19 sprite oam memory objects
  // for(let i = 0; i < 19; i++) {
  //   let oam = bus.ppu.pOAM[i];
  //   fill(255);
  //   if(oam)
  //     text('(x, y): (' + oam.x + ',' + oam.y + '), Attribute: ' + oam.attribute.toString(16) + ', ID: ' + oam.id.toString(16),width - 590, i * 20 + 250);    
  // }
// draw the palettes 
  // const swatchSize = 14;
  // for(let p = 0; p < 8; p++) 
  //   for(let s = 0; s < 4; s++) {
  //     stroke(0);
  //     fill(bus.ppu.getColorFromPaletteRam(p, s));
  //     rect(width - 590 + p * (swatchSize * 5) + s * swatchSize, 625, swatchSize, swatchSize);
  //   }
  // draw the debug information on the right of the screen  
  // noFill();
  // stroke(255);
  // rect(width - 590 + selectedPalette * (swatchSize * 5) - 1, 625, swatchSize*4, swatchSize);
  // image(patternT1, width - 590, 650, 128 * 2, 128 * 2);
  // image(patternT2, width - 300, 650, 128 * 2, 128 * 2);
  noStroke();
  fill(255);
  text(bus.rew6522.display.getChars(), 50, 50);
}
setInterval(function() {
  if(timer) {
    timer.step();
    if(emulation) {
      if(residualTime > 0.0) {
        residualTime -= timer.delta;
      } else {
        residualTime += (1/60) - timer.delta;
        if(bus.clock(residualTime)) {

        }
        // do{
        //   if(bus.clock()) {
        //     // osc.freq(bus.apu.pulse1.sample);
        //     // osc.width(bus.apu.pulse1.width);
        //     // if(bus.apu.pulse1.enabled && bus.apu.pulse1.length == 0) {
        //     //   osc.amp(0);
        //     // } else if(bus.apu.pulse1.enabled) {
        //     //   osc.amp(bus.apu.pulse1.volume);
        //     // }
        //     // osc2.freq(bus.apu.pulse2.sample);
        //     // osc2.width(bus.apu.pulse2.width);
        //     // if(bus.apu.pulse2.enabled && bus.apu.pulse2.length == 0) {
        //     //   osc2.amp(0);
        //     // } else if(bus.apu.pulse2.enabled) {
        //     //   osc2.amp(bus.apu.pulse2.volume);
        //     // }
        //   }
        // } while(!bus.ppu.frameComplete);
        // bus.ppu.frameComplete = false;      
      }
    }
  }
}, 10);