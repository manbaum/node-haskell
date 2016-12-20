
"use strict"

// data EitherT a b = Left a | Right b
const EitherT = class {
	constructor(flag, value) {
		this._flag = flag;
		this._value = value;
	}
	toJSON() {
		return { [this._flag ? "Left" : "Right"]: this._value };
	}
	toString() {
		return `${this._flag ? "Left" : "Right"}(${String(this._value)})`;
	}
	dispatch(fl, fr) {
		return (this._flag ? fl : fr)(this._value);
	}
};
// Left :: a -> EitherT a b
const Left = x => new EitherT(true, x);
// Right :: b -> EitherT a b
const Right = x => new EitherT(false, x);
// disjoint :: [a] -> [b] -> EitherT a b
const disjoint = as => bs => as.map(Left).concat(bs.map(Right));
// either :: (a -> t) -> (b -> t) -> EitherT a b -> t
const either = fl => fr => e => e.dispatch(fl, fr);
// partitionEithers = [Either a b] -> Pair [a] [b]
const partitionEithers = es => {
	const partition = (m, e) => (e._flag ? fst : snd)(m).push(e._value), m;
	return es.reduce(partition, Pair([])([]));
};

module.exports = { EitherT, Left, Right, disjoint, either, partitionEithers };
