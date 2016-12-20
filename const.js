
"use strict"

// data ConstT a = Const {getConst :: a}
const ConstT = class {
	constructor(value) {
		this._value = value;
	}
	toJSON() {
		return { "Const": this._value };
	}
	toString() {
		return `Const(${String(this._value)})`;
	}
};
// Const :: a -> ConstT a
const Const = x => new ConstT(x);
// getConst :: ConstT a -> a
const getConst = c => c._value;


module.exports = { ConstT, Const, getConst };
