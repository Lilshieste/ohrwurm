// Cycle counts for 6502 opcodes
// Reference: https://www.nesdev.org/wiki/6502_cycle_times
//
// Note: This table contains base cycle counts only.
// Some instructions have variable timing:
// - Branches: +1 if taken, +1 more if page crossed
// - Indexed addressing: +1 if page crossed (for reads)
// These adjustments are not yet implemented.

const cycleCounts = new Array(256).fill(2); // Default to 2 (covers NOPs and implied)

// BRK
cycleCounts[0x00] = 7;

// ORA
cycleCounts[0x01] = 6;  // (ind,X)
cycleCounts[0x05] = 3;  // zp
cycleCounts[0x09] = 2;  // imm
cycleCounts[0x0D] = 4;  // abs
cycleCounts[0x11] = 5;  // (ind),Y (+1 if page crossed)
cycleCounts[0x15] = 4;  // zp,X
cycleCounts[0x19] = 4;  // abs,Y (+1 if page crossed)
cycleCounts[0x1D] = 4;  // abs,X (+1 if page crossed)

// ASL
cycleCounts[0x06] = 5;  // zp
cycleCounts[0x0A] = 2;  // acc
cycleCounts[0x0E] = 6;  // abs
cycleCounts[0x16] = 6;  // zp,X
cycleCounts[0x1E] = 7;  // abs,X

// Branch instructions (base 2, +1 if taken, +1 if page crossed)
cycleCounts[0x10] = 2;  // BPL
cycleCounts[0x30] = 2;  // BMI
cycleCounts[0x50] = 2;  // BVC
cycleCounts[0x70] = 2;  // BVS
cycleCounts[0x90] = 2;  // BCC
cycleCounts[0xB0] = 2;  // BCS
cycleCounts[0xD0] = 2;  // BNE
cycleCounts[0xF0] = 2;  // BEQ

// PHP, PLP, PHA, PLA
cycleCounts[0x08] = 3;  // PHP
cycleCounts[0x28] = 4;  // PLP
cycleCounts[0x48] = 3;  // PHA
cycleCounts[0x68] = 4;  // PLA

// CLC, SEC, CLI, SEI, CLV, CLD, SED
cycleCounts[0x18] = 2;  // CLC
cycleCounts[0x38] = 2;  // SEC
cycleCounts[0x58] = 2;  // CLI
cycleCounts[0x78] = 2;  // SEI
cycleCounts[0xB8] = 2;  // CLV
cycleCounts[0xD8] = 2;  // CLD
cycleCounts[0xF8] = 2;  // SED

// JSR, RTS, RTI
cycleCounts[0x20] = 6;  // JSR
cycleCounts[0x60] = 6;  // RTS
cycleCounts[0x40] = 6;  // RTI

// JMP
cycleCounts[0x4C] = 3;  // abs
cycleCounts[0x6C] = 5;  // ind

// AND
cycleCounts[0x21] = 6;  // (ind,X)
cycleCounts[0x25] = 3;  // zp
cycleCounts[0x29] = 2;  // imm
cycleCounts[0x2D] = 4;  // abs
cycleCounts[0x31] = 5;  // (ind),Y (+1 if page crossed)
cycleCounts[0x35] = 4;  // zp,X
cycleCounts[0x39] = 4;  // abs,Y (+1 if page crossed)
cycleCounts[0x3D] = 4;  // abs,X (+1 if page crossed)

// ROL
cycleCounts[0x26] = 5;  // zp
cycleCounts[0x2A] = 2;  // acc
cycleCounts[0x2E] = 6;  // abs
cycleCounts[0x36] = 6;  // zp,X
cycleCounts[0x3E] = 7;  // abs,X

// BIT
cycleCounts[0x24] = 3;  // zp
cycleCounts[0x2C] = 4;  // abs

// EOR
cycleCounts[0x41] = 6;  // (ind,X)
cycleCounts[0x45] = 3;  // zp
cycleCounts[0x49] = 2;  // imm
cycleCounts[0x4D] = 4;  // abs
cycleCounts[0x51] = 5;  // (ind),Y (+1 if page crossed)
cycleCounts[0x55] = 4;  // zp,X
cycleCounts[0x59] = 4;  // abs,Y (+1 if page crossed)
cycleCounts[0x5D] = 4;  // abs,X (+1 if page crossed)

// LSR
cycleCounts[0x46] = 5;  // zp
cycleCounts[0x4A] = 2;  // acc
cycleCounts[0x4E] = 6;  // abs
cycleCounts[0x56] = 6;  // zp,X
cycleCounts[0x5E] = 7;  // abs,X

// ADC
cycleCounts[0x61] = 6;  // (ind,X)
cycleCounts[0x65] = 3;  // zp
cycleCounts[0x69] = 2;  // imm
cycleCounts[0x6D] = 4;  // abs
cycleCounts[0x71] = 5;  // (ind),Y (+1 if page crossed)
cycleCounts[0x75] = 4;  // zp,X
cycleCounts[0x79] = 4;  // abs,Y (+1 if page crossed)
cycleCounts[0x7D] = 4;  // abs,X (+1 if page crossed)

// ROR
cycleCounts[0x66] = 5;  // zp
cycleCounts[0x6A] = 2;  // acc
cycleCounts[0x6E] = 6;  // abs
cycleCounts[0x76] = 6;  // zp,X
cycleCounts[0x7E] = 7;  // abs,X

// STA
cycleCounts[0x81] = 6;  // (ind,X)
cycleCounts[0x85] = 3;  // zp
cycleCounts[0x8D] = 4;  // abs
cycleCounts[0x91] = 6;  // (ind),Y
cycleCounts[0x95] = 4;  // zp,X
cycleCounts[0x99] = 5;  // abs,Y
cycleCounts[0x9D] = 5;  // abs,X

// STX
cycleCounts[0x86] = 3;  // zp
cycleCounts[0x8E] = 4;  // abs
cycleCounts[0x96] = 4;  // zp,Y

// STY
cycleCounts[0x84] = 3;  // zp
cycleCounts[0x8C] = 4;  // abs
cycleCounts[0x94] = 4;  // zp,X

// LDA
cycleCounts[0xA1] = 6;  // (ind,X)
cycleCounts[0xA5] = 3;  // zp
cycleCounts[0xA9] = 2;  // imm
cycleCounts[0xAD] = 4;  // abs
cycleCounts[0xB1] = 5;  // (ind),Y (+1 if page crossed)
cycleCounts[0xB5] = 4;  // zp,X
cycleCounts[0xB9] = 4;  // abs,Y (+1 if page crossed)
cycleCounts[0xBD] = 4;  // abs,X (+1 if page crossed)

// LDX
cycleCounts[0xA2] = 2;  // imm
cycleCounts[0xA6] = 3;  // zp
cycleCounts[0xAE] = 4;  // abs
cycleCounts[0xB6] = 4;  // zp,Y
cycleCounts[0xBE] = 4;  // abs,Y (+1 if page crossed)

// LDY
cycleCounts[0xA0] = 2;  // imm
cycleCounts[0xA4] = 3;  // zp
cycleCounts[0xAC] = 4;  // abs
cycleCounts[0xB4] = 4;  // zp,X
cycleCounts[0xBC] = 4;  // abs,X (+1 if page crossed)

// CMP
cycleCounts[0xC1] = 6;  // (ind,X)
cycleCounts[0xC5] = 3;  // zp
cycleCounts[0xC9] = 2;  // imm
cycleCounts[0xCD] = 4;  // abs
cycleCounts[0xD1] = 5;  // (ind),Y (+1 if page crossed)
cycleCounts[0xD5] = 4;  // zp,X
cycleCounts[0xD9] = 4;  // abs,Y (+1 if page crossed)
cycleCounts[0xDD] = 4;  // abs,X (+1 if page crossed)

// CPX
cycleCounts[0xE0] = 2;  // imm
cycleCounts[0xE4] = 3;  // zp
cycleCounts[0xEC] = 4;  // abs

// CPY
cycleCounts[0xC0] = 2;  // imm
cycleCounts[0xC4] = 3;  // zp
cycleCounts[0xCC] = 4;  // abs

// DEC
cycleCounts[0xC6] = 5;  // zp
cycleCounts[0xCE] = 6;  // abs
cycleCounts[0xD6] = 6;  // zp,X
cycleCounts[0xDE] = 7;  // abs,X

// INC
cycleCounts[0xE6] = 5;  // zp
cycleCounts[0xEE] = 6;  // abs
cycleCounts[0xF6] = 6;  // zp,X
cycleCounts[0xFE] = 7;  // abs,X

// DEX, DEY, INX, INY
cycleCounts[0xCA] = 2;  // DEX
cycleCounts[0x88] = 2;  // DEY
cycleCounts[0xE8] = 2;  // INX
cycleCounts[0xC8] = 2;  // INY

// TAX, TAY, TXA, TYA, TSX, TXS
cycleCounts[0xAA] = 2;  // TAX
cycleCounts[0xA8] = 2;  // TAY
cycleCounts[0x8A] = 2;  // TXA
cycleCounts[0x98] = 2;  // TYA
cycleCounts[0xBA] = 2;  // TSX
cycleCounts[0x9A] = 2;  // TXS

// SBC
cycleCounts[0xE1] = 6;  // (ind,X)
cycleCounts[0xE5] = 3;  // zp
cycleCounts[0xE9] = 2;  // imm
cycleCounts[0xED] = 4;  // abs
cycleCounts[0xF1] = 5;  // (ind),Y (+1 if page crossed)
cycleCounts[0xF5] = 4;  // zp,X
cycleCounts[0xF9] = 4;  // abs,Y (+1 if page crossed)
cycleCounts[0xFD] = 4;  // abs,X (+1 if page crossed)

// NOP
cycleCounts[0xEA] = 2;

module.exports = { cycleCounts };
