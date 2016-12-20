
"use strict"

// data PairT a b = Pair a b
const PairT = class {
	constructor(first, second) {
		this._first = first;
		this._second = second;
	}
	toJSON() {
		return { "first": this._first, "second": this._second };
	}
	toString() {
		return `Pair(${String(this._first)})(${String(this._second)})`;
	}
};
// Pair :: a -> b -> Pair a b
const Pair = x => y => new Pair(x, y);
// fst :: Pair a b -> a
const fst = p => p._first;
// snd :: Pair a b -> b
const snd = p => p._second;

module.exports = { PairT, Pair, fst, snd };
