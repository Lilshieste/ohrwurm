const AddressingModes = require('./addressingModes');
const OpCode = require('./opcodes');
const { peek, poke, pull, push } = require('./memory');

const absolute = AddressingModes.absolute(peek, poke);
const absoluteX = AddressingModes.absoluteX(peek, poke);
const absoluteY = AddressingModes.absoluteY(peek, poke);
const accumulator = AddressingModes.accumulator;
const immediate = AddressingModes.immediate(peek);
const implied = AddressingModes.implied;
const indirect = AddressingModes.indirect(peek);
const indexedIndirect = AddressingModes.indexedIndirect(peek, poke);
const indirectIndexed = AddressingModes.indirectIndexed(peek, poke);
const relative = AddressingModes.relative(peek);
const zeroPage = AddressingModes.zeroPage(peek, poke);
const zeroPageX = AddressingModes.zeroPageX(peek, poke);
const zeroPageY = AddressingModes.zeroPageY(peek, poke);

const INSTRUCTION_SET = [
  OpCode.BRK(peek, push, implied),      // $00 	BRK Implied 	- - - - - - - 
  OpCode.ORA(indexedIndirect),          // $01 	ORA ($NN,X)	Indexed Indirect 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.ORA(zeroPage),                 // $05 	ORA $NN	Zero Page 	- Z- - - - N
  OpCode.ASL(zeroPage),                 // $06 	ASL $NN	Zero Page 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.PHP(implied),                  // $08 	PHP Implied 	- - - - - - - 
  OpCode.ORA(immediate),                // $09 	ORA #$NN	Immediate 	- Z- - - - N
  OpCode.ASL(accumulator),              // $0a 	ASL A	Accumulator 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.ORA(absolute),                 // $0d 	ORA $NNNN	Absolute 	- Z- - - - N
  OpCode.ASL(absolute),                 // $0e 	ASL $NNNN	Absolute 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.BPL(relative),                 // $10 	BPL $NN	Relative 	- - - - - - - 
  OpCode.ORA(indirectIndexed),          // $11 	ORA ($NN),Y	Indirect Indexed 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.ORA(zeroPageX),                // $15 	ORA $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.ASL(zeroPageX),                // $16 	ASL $NN,X	Zero Page,X 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.CLC(implied),                  // $18 	CLC Implied 	C- - - - - - 
  OpCode.ORA(absoluteY),                // $19 	ORA $NNNN,Y	Absolute,Y 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.ORA(absoluteX),                // $1d 	ORA $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.ASL(absoluteX),                // $1e 	ASL $NNNN,X	Absolute,X 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.JSR(absolute),                 // $20 	JSR $NNNN	Absolute 	- - - - - - - 
  OpCode.AND(indexedIndirect),          // $21 	AND ($NN,X)	Indexed Indirect 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.BIT(zeroPage),                 // $24 	BIT $NN	Zero Page 	- Z- - - VN
  OpCode.AND(zeroPage),                 // $25 	AND $NN	Zero Page 	- Z- - - - N
  OpCode.ROL(zeroPage),                 // $26 	ROL $NN	Zero Page 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.PLP(implied),                  // $28 	PLP Implied 	CZIDBVN
  OpCode.AND(immediate),                // $29 	AND #$NN	Immediate 	- Z- - - - N
  OpCode.ROL(accumulator),              // $2a 	ROL A	Accumulator 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.BIT(absolute),                 // $2c 	BIT $NNNN	Absolute 	- Z- - - VN
  OpCode.AND(absolute),                 // $2d 	AND $NNNN	Absolute 	- Z- - - - N
  OpCode.ROL(absolute),                 // $2e 	ROL $NNNN	Absolute 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.BMI(relative),                 // $30 	BMI $NN	Relative 	- - - - - - - 
  OpCode.AND(indirectIndexed),          // $31 	AND ($NN),Y	Indirect Indexed 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.AND(zeroPageX),                // $35 	AND $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.ROL(zeroPageX),                // $36 	ROL $NN,X	Zero Page,X 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.SEC(implied),                  // $38 	SEC Implied 	C- - - - - - 
  OpCode.AND(absoluteY),                // $39 	AND $NNNN,Y	Absolute,Y 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.AND(absoluteX),                // $3d 	AND $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.ROL(absoluteX),                // $3e 	ROL $NNNN,X	Absolute,X 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.RTI(pull, implied),            // $40 	RTI Implied 	- - - - - - - 
  OpCode.EOR(indexedIndirect),          // $41 	EOR ($NN,X)	Indexed Indirect 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.EOR(zeroPage),                 // $45 	EOR $NN	Zero Page 	- Z- - - - N
  OpCode.LSR(zeroPage),                 // $46 	LSR $NN	Zero Page 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.PHA(implied),                  // $48 	PHA Implied 	- - - - - - - 
  OpCode.EOR(immediate),                // $49 	EOR #$NN	Immediate 	- Z- - - - N
  OpCode.LSR(accumulator),              // $4a 	LSR A	Accumulator 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.JMP(absolute),                 // $4c 	JMP $NNNN	Absolute 	- - - - - - - 
  OpCode.EOR(absolute),                 // $4d 	EOR $NNNN	Absolute 	- Z- - - - N
  OpCode.LSR(absolute),                 // $4e 	LSR $NNNN	Absolute 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.BVC(relative),                 // $50 	BVC $NN	Relative 	- - - - - - - 
  OpCode.EOR(indirectIndexed),          // $51 	EOR ($NN),Y	Indirect Indexed 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.EOR(zeroPageX),                // $55 	EOR $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.LSR(zeroPageX),                // $56 	LSR $NN,X	Zero Page,X 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.CLI(implied),                  // $58 	CLI Implied 	- - I- - - - 
  OpCode.EOR(absoluteY),                // $59 	EOR $NNNN,Y	Absolute,Y 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.EOR(absoluteX),                // $5d 	EOR $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.LSR(absoluteX),                // $5e 	LSR $NNNN,X	Absolute,X 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.RTS(pull, implied),            // $60 	RTS Implied 	- - - - - - - 
  OpCode.ADC(indexedIndirect),          // $61 	ADC ($NN,X)	Indexed Indirect 	CZ- - - VN
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.ADC(zeroPage),                 // $65 	ADC $NN	Zero Page 	CZ- - - VN
  OpCode.ROR(zeroPage),                 // $66 	ROR $NN	Zero Page 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.PLA(implied),                  // $68 	PLA Implied 	- Z- - - - N
  OpCode.ADC(immediate),                // $69 	ADC #$NN	Immediate 	CZ- - - VN
  OpCode.ROR(accumulator),              // $6a 	ROR A	Accumulator 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.JMP(indirect),                 // $6c 	JMP $NN	Indirect 	- - - - - - - 
  OpCode.ADC(absolute),                 // $6d 	ADC $NNNN	Absolute 	CZ- - - VN
  OpCode.ROR(absoluteX),                // $6e 	ROR $NNNN,X	Absolute,X 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.BVS(relative),                 // $70 	BVS $NN	Relative 	- - - - - - - 
  OpCode.ADC(indirectIndexed),          // $71 	ADC ($NN),Y	Indirect Indexed 	CZ- - - VN
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.ADC(zeroPageX),                // $75 	ADC $NN,X	Zero Page,X 	CZ- - - VN
  OpCode.ROR(zeroPageX),                // $76 	ROR $NN,X	Zero Page,X 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.SEI(implied),                  // $78 	SEI Implied 	- - I- - - - 
  OpCode.ADC(absoluteY),                // $79 	ADC $NNNN,Y	Absolute,Y 	CZ- - - VN
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.ADC(absoluteX),                // $7d 	ADC $NNNN,X	Absolute,X 	CZ- - - VN
  OpCode.ROR(absolute),                 // $7e 	ROR $NNNN	Absolute 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.STA(indexedIndirect),          // $81 	STA ($NN,X)	Indexed Indirect 	- - - - - - - 
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.STY(zeroPage),                 // $84 	STY $NN	Zero Page 	- - - - - - - 
  OpCode.STA(zeroPage),                 // $85 	STA $NN	Zero Page 	- - - - - - - 
  OpCode.STX(zeroPage),                 // $86 	STX $NN	Zero Page 	- - - - - - - 
  OpCode.Unofficial,        
  OpCode.DEY(implied),                  // $88 	DEY Implied 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.TXA(implied),                  // $8a 	TXA Implied 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.STY(absolute),                 // $8c 	STY $NNNN	Absolute 	- - - - - - - 
  OpCode.STA(absolute),                 // $8d 	STA $NNNN	Absolute 	- - - - - - - 
  OpCode.STX(absolute),                 // $8e 	STX $NNNN	Absolute 	- - - - - - - 
  OpCode.Unofficial,        
  OpCode.BCC(relative),                 // $90 	BCC $NN	Relative 	- - - - - - - 
  OpCode.STA(indirectIndexed),          // $91 	STA ($NN),Y	Indirect Indexed 	- - - - - - - 
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.STY(zeroPageX),                // $94 	STY $NN,X	Zero Page,X 	- - - - - - - 
  OpCode.STA(zeroPageX),                // $95 	STA $NN,X	Zero Page,X 	- - - - - - - 
  OpCode.STX(zeroPageY),                // $96 	STX $NN,Y	Zero Page,Y 	- - - - - - - 
  OpCode.Unofficial,        
  OpCode.TYA(implied),                  // $98 	TYA Implied 	- Z- - - - N
  OpCode.STA(absoluteY),                // $99 	STA $NNNN,Y	Absolute,Y 	- - - - - - - 
  OpCode.TXS(implied),                  // $9a 	TXS Implied 	- - - - - - - 
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.STA(absoluteX),                // $9d 	STA $NNNN,X	Absolute,X 	- - - - - - - 
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.LDY(immediate),                // $a0 	LDY #$NN	Immediate 	- Z- - - - N
  OpCode.LDA(indexedIndirect),          // $a1 	LDA ($NN,X)	Indexed Indirect 	- Z- - - - N
  OpCode.LDX(immediate),                // $a2 	LDX #$NN	Immediate 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.LDY(zeroPage),                 // $a4 	LDY $NN	Zero Page 	- Z- - - - N
  OpCode.LDA(zeroPage),                 // $a5 	LDA $NN	Zero Page 	- Z- - - - N
  OpCode.LDX(zeroPage),                 // $a6 	LDX $NN	Zero Page 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.TAY(implied),                  // $a8 	TAY Implied 	- Z- - - - N
  OpCode.LDA(immediate),                // $a9 	LDA #$NN	Immediate 	- Z- - - - N
  OpCode.TAX(implied),                  // $aa 	TAX Implied 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.LDY(absolute),                 // $ac 	LDY $NNNN	Absolute 	- Z- - - - N
  OpCode.LDA(absolute),                 // $ad 	LDA $NNNN	Absolute 	- Z- - - - N
  OpCode.LDX(absolute),                 // $ae 	LDX $NNNN	Absolute 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.BCS(relative),                 // $b0 	BCS $NN	Relative 	- - - - - - - 
  OpCode.LDA(indirectIndexed),          // $b1 	LDA ($NN),Y	Indirect Indexed 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.LDY(zeroPageX),                // $b4 	LDY $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.LDA(zeroPageX),                // $b5 	LDA $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.LDX(zeroPageY),                // $b6 	LDX $NN,Y	Zero Page,Y 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.CLV(implied),                  // $b8 	CLV Implied 	- - - - - V- 
  OpCode.LDA(absoluteY),                // $b9 	LDA $NNNN,Y	Absolute,Y 	- Z- - - - N
  OpCode.TSX(implied),                  // $ba 	TSX Implied 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.LDY(absoluteX),                // $bc 	LDY $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.LDA(absoluteX),                // $bd 	LDA $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.LDX(absoluteY),                // $be 	LDX $NNNN,Y	Absolute,Y 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.CPY(immediate),                // $c0 	CPY #$NN	Immediate 	CZ- - - - N
  OpCode.CMP(indexedIndirect),          // $c1 	CMP ($NN,X)	Indexed Indirect 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.CPY(zeroPage),                 // $c4 	CPY $NN	Zero Page 	CZ- - - - N
  OpCode.CMP(zeroPage),                 // $c5 	CMP $NN	Zero Page 	CZ- - - - N
  OpCode.DEC(zeroPage),                 // $c6 	DEC $NN	Zero Page 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.INY(implied),                  // $c8 	INY Implied 	- Z- - - - N
  OpCode.CMP(immediate),                // $c9 	CMP #$NN	Immediate 	CZ- - - - N
  OpCode.DEX(implied),                  // $ca 	DEX Implied 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.CPY(absolute),                 // $cc 	CPY $NNNN	Absolute 	CZ- - - - N
  OpCode.CMP(absolute),                 // $cd 	CMP $NNNN	Absolute 	CZ- - - - N
  OpCode.DEC(absolute),                 // $ce 	DEC $NNNN	Absolute 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.BNE(relative),                 // $d0 	BNE $NN	Relative 	- - - - - - - 
  OpCode.CMP(indirectIndexed),          // $d1 	CMP ($NN),Y	Indirect Indexed 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.CMP(zeroPageX),                // $d5 	CMP $NN,X	Zero Page,X 	CZ- - - - N
  OpCode.DEC(zeroPageX),                // $d6 	DEC $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.CLD(implied),                  // $d8 	CLD Implied 	- - - D- - - 
  OpCode.CMP(absoluteY),                // $d9 	CMP $NNNN,Y	Absolute,Y 	CZ- - - - N
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.CMP(absoluteX),                // $dd 	CMP $NNNN,X	Absolute,X 	CZ- - - - N
  OpCode.DEC(absoluteX),                // $de 	DEC $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.CPX(immediate),                // $e0 	CPX #$NN	Immediate 	CZ- - - - N
  OpCode.SBC(indexedIndirect),          // $e1 	SBC ($NN,X)	Indexed Indirect 	CZ- - - VN
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.CPX(zeroPage),                 // $e4 	CPX $NN	Zero Page 	CZ- - - - N
  OpCode.SBC(zeroPage),                 // $e5 	SBC $NN	Zero Page 	CZ- - - VN
  OpCode.INC(zeroPage),                 // $e6 	INC $NN	Zero Page 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.INX(implied),                  // $e8 	INX Implied 	- Z- - - - N
  OpCode.SBC(immediate),                // $e9 	SBC #$NN	Immediate 	CZ- - - VN
  OpCode.NOP(implied),                  // $ea 	NOP Implied 	- - - - - - - 
  OpCode.Unofficial,        
  OpCode.CPX(absolute),                 // $ec 	CPX $NNNN	Absolute 	CZ- - - - N
  OpCode.SBC(absolute),                 // $ed 	SBC $NNNN	Absolute 	CZ- - - VN
  OpCode.INC(absolute),                 // $ee 	INC $NNNN	Absolute 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.BEQ(relative),                 // $f0 	BEQ $NN	Relative 	- - - - - - - 
  OpCode.SBC(indirectIndexed),          // $f1 	SBC ($NN),Y	Indirect Indexed 	CZ- - - VN
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.SBC(zeroPageX),                // $f5 	SBC $NN,X	Zero Page,X 	CZ- - - VN
  OpCode.INC(zeroPageX),                // $f6 	INC $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.Unofficial,        
  OpCode.SED(implied),                  // $f8 	SED Implied 	- - - D- - - 
  OpCode.SBC(absoluteY),                // $f9 	SBC $NNNN,Y	Absolute,Y 	CZ- - - VN
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.Unofficial,        
  OpCode.SBC(absoluteX),                // $fd 	SBC $NNNN,X	Absolute,X 	CZ- - - VN
  OpCode.INC(absoluteX),                // $fe 	INC $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.Unofficial,
];

module.exports = {
  INSTRUCTION_SET
};