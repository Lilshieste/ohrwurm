const {
  absolute,
  absoluteX,
  absoluteY,
  immediate,
  indexedIndirect,
  indirectIndexed,
  zeroPage,
  zeroPageX,
} = require('./addressing');
const OpCode = require('./opcodes');

const INSTRUCTION_SET = [
  OpCode.BR, // $00 	BRK 	Implied 	- - - - - - - 
  OpCode.NotImplemented, // $01 	ORA ($NN,X)	Indexed Indirect 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $05 	ORA $NN	Zero Page 	- Z- - - - N
  OpCode.NotImplemented, // $06 	ASL $NN	Zero Page 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $08 	PHP 	Implied 	- - - - - - - 
  OpCode.NotImplemented, // $09 	ORA #$NN	Immediate 	- Z- - - - N
  OpCode.NotImplemented, // $0a 	ASL A	Accumulator 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $0d 	ORA $NNNN	Absolute 	- Z- - - - N
  OpCode.NotImplemented, // $0e 	ASL $NNNN	Absolute 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $10 	BPL $NN	Relative 	- - - - - - - 
  OpCode.NotImplemented, // $11 	ORA ($NN),Y	Indirect Indexed 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $15 	ORA $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.NotImplemented, // $16 	ASL $NN,X	Zero Page,X 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $18 	CLC 	Implied 	C- - - - - - 
  OpCode.NotImplemented, // $19 	ORA $NNNN,Y	Absolute,Y 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $1d 	ORA $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.NotImplemented, // $1e 	ASL $NNNN,X	Absolute,X 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $20 	JSR $NNNN	Absolute 	- - - - - - - 
  OpCode.AND(indexedIndirect), // $21 	AND ($NN,X)	Indexed Indirect 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $24 	BIT $NN	Zero Page 	- Z- - - VN
  OpCode.AND(zeroPage), // $25 	AND $NN	Zero Page 	- Z- - - - N
  OpCode.NotImplemented, // $26 	ROL $NN	Zero Page 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $28 	PLP 	Implied 	CZIDBVN
  OpCode.AND(immediate), // $29 	AND #$NN	Immediate 	- Z- - - - N
  OpCode.NotImplemented, // $2a 	ROL A	Accumulator 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $2c 	BIT $NNNN	Absolute 	- Z- - - VN
  OpCode.AND(absolute), // $2d 	AND $NNNN	Absolute 	- Z- - - - N
  OpCode.NotImplemented, // $2e 	ROL $NNNN	Absolute 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $30 	BMI $NN	Relative 	- - - - - - - 
  OpCode.AND(indirectIndexed), // $31 	AND ($NN),Y	Indirect Indexed 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.AND(zeroPageX), // $35 	AND $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.NotImplemented, // $36 	ROL $NN,X	Zero Page,X 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $38 	SEC 	Implied 	C- - - - - - 
  OpCode.AND(absoluteY), // $39 	AND $NNNN,Y	Absolute,Y 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.AND(absoluteX), // $3d 	AND $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.NotImplemented, // $3e 	ROL $NNNN,X	Absolute,X 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $40 	RTI 	Implied 	- - - - - - - 
  OpCode.NotImplemented, // $41 	EOR ($NN,X)	Indexed Indirect 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $45 	EOR $NN	Zero Page 	- Z- - - - N
  OpCode.NotImplemented, // $46 	LSR $NN	Zero Page 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $48 	PHA 	Implied 	- - - - - - - 
  OpCode.NotImplemented, // $49 	EOR #$NN	Immediate 	- Z- - - - N
  OpCode.NotImplemented, // $4a 	LSR A	Accumulator 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $4c 	JMP $NNNN	Absolute 	- - - - - - - 
  OpCode.NotImplemented, // $4d 	EOR $NNNN	Absolute 	- Z- - - - N
  OpCode.NotImplemented, // $4e 	LSR $NNNN	Absolute 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $50 	BVC $NN	Relative 	- - - - - - - 
  OpCode.NotImplemented, // $51 	EOR ($NN),Y	Indirect Indexed 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $55 	EOR $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.NotImplemented, // $56 	LSR $NN,X	Zero Page,X 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $58 	CLI 	Implied 	- - I- - - - 
  OpCode.NotImplemented, // $59 	EOR $NNNN,Y	Absolute,Y 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $5d 	EOR $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.NotImplemented, // $5e 	LSR $NNNN,X	Absolute,X 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $60 	RTS 	Implied 	- - - - - - - 
  OpCode.ADC(indexedIndirect), // $61 	ADC ($NN,X)	Indexed Indirect 	CZ- - - VN
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.ADC(zeroPage), // $65 	ADC $NN	Zero Page 	CZ- - - VN
  OpCode.NotImplemented, // $66 	ROR $NN	Zero Page 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $68 	PLA 	Implied 	- Z- - - - N
  OpCode.ADC(immediate), // $69 	ADC #$NN	Immediate 	CZ- - - VN
  OpCode.NotImplemented, // $6a 	ROR A	Accumulator 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $6c 	JMP $NN	Indirect 	- - - - - - - 
  OpCode.ADC(absolute), // $6d 	ADC $NNNN	Absolute 	CZ- - - VN
  OpCode.NotImplemented, // $6e 	ROR $NNNN,X	Absolute,X 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $70 	BVS $NN	Relative 	- - - - - - - 
  OpCode.ADC(indirectIndexed), // $71 	ADC ($NN),Y	Indirect Indexed 	CZ- - - VN
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.ADC(zeroPageX), // $75 	ADC $NN,X	Zero Page,X 	CZ- - - VN
  OpCode.NotImplemented, // $76 	ROR $NN,X	Zero Page,X 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $78 	SEI 	Implied 	- - I- - - - 
  OpCode.ADC(absoluteY), // $79 	ADC $NNNN,Y	Absolute,Y 	CZ- - - VN
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.ADC(absoluteX), // $7d 	ADC $NNNN,X	Absolute,X 	CZ- - - VN
  OpCode.NotImplemented, // $7e 	ROR $NNNN	Absolute 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $81 	STA ($NN,X)	Indexed Indirect 	- - - - - - - 
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $84 	STY $NN	Zero Page 	- - - - - - - 
  OpCode.NotImplemented, // $85 	STA $NN	Zero Page 	- - - - - - - 
  OpCode.NotImplemented, // $86 	STX $NN	Zero Page 	- - - - - - - 
  OpCode.Unofficial,
  OpCode.NotImplemented, // $88 	DEY 	Implied 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $8a 	TXA 	Implied 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $8c 	STY $NNNN	Absolute 	- - - - - - - 
  OpCode.NotImplemented, // $8d 	STA $NNNN	Absolute 	- - - - - - - 
  OpCode.NotImplemented, // $8e 	STX $NNNN	Absolute 	- - - - - - - 
  OpCode.Unofficial,
  OpCode.NotImplemented, // $90 	BCC $NN	Relative 	- - - - - - - 
  OpCode.NotImplemented, // $91 	STA ($NN),Y	Indirect Indexed 	- - - - - - - 
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $94 	STY $NN,X	Zero Page,X 	- - - - - - - 
  OpCode.NotImplemented, // $95 	STA $NN,X	Zero Page,X 	- - - - - - - 
  OpCode.NotImplemented, // $96 	STX $NN,Y	Zero Page,Y 	- - - - - - - 
  OpCode.Unofficial,
  OpCode.NotImplemented, // $98 	TYA 	Implied 	- Z- - - - N
  OpCode.NotImplemented, // $99 	STA $NNNN,Y	Absolute,Y 	- - - - - - - 
  OpCode.NotImplemented, // $9a 	TXS 	Implied 	- - - - - - - 
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $9d 	STA $NNNN,X	Absolute,X 	- - - - - - - 
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $a0 	LDY #$NN	Immediate 	- Z- - - - N
  OpCode.NotImplemented, // $a1 	LDA ($NN,X)	Indexed Indirect 	- Z- - - - N
  OpCode.NotImplemented, // $a2 	LDX #$NN	Immediate 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $a4 	LDY $NN	Zero Page 	- Z- - - - N
  OpCode.NotImplemented, // $a5 	LDA $NN	Zero Page 	- Z- - - - N
  OpCode.NotImplemented, // $a6 	LDX $NN	Zero Page 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $a8 	TAY 	Implied 	- Z- - - - N
  OpCode.NotImplemented, // $a9 	LDA #$NN	Immediate 	- Z- - - - N
  OpCode.NotImplemented, // $aa 	TAX 	Implied 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $ac 	LDY $NNNN	Absolute 	- Z- - - - N
  OpCode.NotImplemented, // $ad 	LDA $NNNN	Absolute 	- Z- - - - N
  OpCode.NotImplemented, // $ae 	LDX $NNNN	Absolute 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $b0 	BCS $NN	Relative 	- - - - - - - 
  OpCode.NotImplemented, // $b1 	LDA ($NN),Y	Indirect Indexed 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $b4 	LDY $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.NotImplemented, // $b5 	LDA $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.NotImplemented, // $b6 	LDX $NN,Y	Zero Page,Y 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $b8 	CLV 	Implied 	- - - - - V- 
  OpCode.NotImplemented, // $b9 	LDA $NNNN,Y	Absolute,Y 	- Z- - - - N
  OpCode.NotImplemented, // $ba 	TSX 	Implied 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $bc 	LDY $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.NotImplemented, // $bd 	LDA $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.NotImplemented, // $be 	LDX $NNNN,Y	Absolute,Y 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $c0 	CPY #$NN	Immediate 	CZ- - - - N
  OpCode.NotImplemented, // $c1 	CMP ($NN,X)	Indexed Indirect 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $c4 	CPY $NN	Zero Page 	CZ- - - - N
  OpCode.NotImplemented, // $c5 	CMP $NN	Zero Page 	CZ- - - - N
  OpCode.NotImplemented, // $c6 	DEC $NN	Zero Page 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $c8 	INY 	Implied 	- Z- - - - N
  OpCode.NotImplemented, // $c9 	CMP #$NN	Immediate 	CZ- - - - N
  OpCode.NotImplemented, // $ca 	DEX 	Implied 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $cc 	CPY $NNNN	Absolute 	CZ- - - - N
  OpCode.NotImplemented, // $cd 	CMP $NNNN	Absolute 	CZ- - - - N
  OpCode.NotImplemented, // $ce 	DEC $NNNN	Absolute 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $d0 	BNE $NN	Relative 	- - - - - - - 
  OpCode.NotImplemented, // $d1 	CMP ($NN),Y	Indirect Indexed 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $d5 	CMP $NN,X	Zero Page,X 	CZ- - - - N
  OpCode.NotImplemented, // $d6 	DEC $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $d8 	CLD 	Implied 	- - - D- - - 
  OpCode.NotImplemented, // $d9 	CMP $NNNN,Y	Absolute,Y 	CZ- - - - N
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $dd 	CMP $NNNN,X	Absolute,X 	CZ- - - - N
  OpCode.NotImplemented, // $de 	DEC $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $e0 	CPX #$NN	Immediate 	CZ- - - - N
  OpCode.NotImplemented, // $e1 	SBC ($NN,X)	Indexed Indirect 	CZ- - - VN
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $e4 	CPX $NN	Zero Page 	CZ- - - - N
  OpCode.NotImplemented, // $e5 	SBC $NN	Zero Page 	CZ- - - VN
  OpCode.NotImplemented, // $e6 	INC $NN	Zero Page 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $e8 	INX 	Implied 	- Z- - - - N
  OpCode.NotImplemented, // $e9 	SBC #$NN	Immediate 	CZ- - - VN
  OpCode.NotImplemented, // $ea 	NOP 	Implied 	- - - - - - - 
  OpCode.Unofficial,
  OpCode.NotImplemented, // $ec 	CPX $NNNN	Absolute 	CZ- - - - N
  OpCode.NotImplemented, // $ed 	SBC $NNNN	Absolute 	CZ- - - VN
  OpCode.NotImplemented, // $ee 	INC $NNNN	Absolute 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $f0 	BEQ $NN	Relative 	- - - - - - - 
  OpCode.NotImplemented, // $f1 	SBC ($NN),Y	Indirect Indexed 	CZ- - - VN
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $f5 	SBC $NN,X	Zero Page,X 	CZ- - - VN
  OpCode.NotImplemented, // $f6 	INC $NN,X	Zero Page,X 	- Z- - - - N
  OpCode.Unofficial,
  OpCode.NotImplemented, // $f8 	SED 	Implied 	- - - D- - - 
  OpCode.NotImplemented, // $f9 	SBC $NNNN,Y	Absolute,Y 	CZ- - - VN
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.Unofficial,
  OpCode.NotImplemented, // $fd 	SBC $NNNN,X	Absolute,X 	CZ- - - VN
  OpCode.NotImplemented, // $fe 	INC $NNNN,X	Absolute,X 	- Z- - - - N
  OpCode.Unofficial,
];

const run = () => {

};

module.exports = {
  INSTRUCTION_SET,
  run,
};