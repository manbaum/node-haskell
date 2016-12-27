
"use strict"

const { PropDefT                        } = require("../langutil");
const { $S, $K, $I                      } = require("../ski");
const { $compose                        } = require("../compose");
const { $apply, $rapply                 } = require("../apply");

const isInfinity = x               => x === Infinity || x === -Infinity;
const isFunction = f               => typeof f === "function";
const throws     = msg             => { throw new Error(msg); };
const check      = (x, checks)     => checks.reduce((x, [f, msg]) => f(x) ? throws(msg) : x, x);
const limit      = (min, max) => x => x <= min ? min : (x >= max ? max : x);

const FrangeT = class {
	constructor(at = $I, start = 0, length = Infinity, reversed = false) {
		this._at       = isFunction(at) ? at : $K(at);
		this._start    = check(Math.trunc(start), [
			[ isNaN,		`* FrangeT: start.need.number`						],
			[ isInfinity,	`* FrangeT: start.need.finity.number`				]]);
		this._length   = check(Math.trunc(length), [
			[ isNaN,		`* FrangeT: length.need.number`						],
			[ x => x < 0,	`* FrangeT: length.need.positive.number`			]]);
		this._reversed = !!reversed;
	}

	copy({ at, start, length, reversed }) {
		const newAt    = at       != null ? at       : this._at,
		      newStart = start    != null ? start    : this._start,
		      newLen   = length   != null ? length   : this._length,
		      newRev   = reversed != null ? reversed : this._reversed;
		return new FrangeT(newAt, newStart, newLen, newRev);
	}
	rawAt(i) {
		return this._at(this._start + (this._reversed ? -1 - i : i));
	}
	get freeAt() {
		const at    = this._at,
		      start = this._start,
		      rev   = this._reversed;
		return i => at(start + (rev ? -1 - i : i));
	}
	forEach(f) {
		check(this.length, [
			[ isInfinity,	`* FrangeT~forEach: cannot.iterate.infinity.list`	]]);
		let i = 0,
			n = this.length;
		while (i < n) {
			f(this.rawAt(i), i, this);
			i++;
		}
		return this;
	}
	reduce(f, init) {
		check(this.length, [
			[ isInfinity,	`* FrangeT~reduce: cannot.reduce.infinity.list`		]]);
		let result = init;
		this.forEach((v, i) => result = f(result, v, i, this));
		return result;
	}
	toArray(deep = false) {
		check(this.length, [
			[ isInfinity,	`* FrangeT~toArray: cannot.convert.infinity.list`	]]);
		const result = [],
			  each   = deep
			  		 ? v => result.push(v instanceof FrangeT ? v.toArray(true) : v)
			  	     : v => result.push(v);
		this.forEach(each);
		return result;
	}
	*[Symbol.iterator]() {
		let i = 0,
			n = this.length;
		while(i < n) {
			yield this.rawAt(i);
			i++;
		}
	}

	get start() {
		return this._start;
	}
	get length() {
		return this._length;
	}
	get isReversed() {
		return this._reversed;
	}
	at(index = 0) {
		const i = check(Math.trunc(index), [
			[ isNaN,		`* FrangeT~at: index.need.number`					]]);
		return (i >= 0 && i < this._length) ? this.rawAt(i) : undefined;
	}
	move(start, length) {
		const newStart    = check(Math.trunc(start), [
			[ isNaN,		`* FrangeT~move: start.need.number`					],
			[ isInfinity,	`* FrangeT~move: start.need.finity.number`			]]);
		const nLength     = check(Math.trunc(length), [
			[ isNaN,		`* FrangeT~move: length.need.number`				]]);
		const newLength   = nLength >= 0 ? nLength        : -nLength;
		const newReversed = nLength >= 0 ? this._reversed : !this._reversed;
		return this.copy({ start: newStart, length: newLength, reversed: newReversed });
	}
	slide(delta = 1) {
		const n = check(Math.trunc(delta), [
			[ isNaN,		`* FrangeT~slide: delta.need.number`				],
			[ isInfinity,	`* FrangeT~slide: delta.need.finity.number`			]]);
		if (n == 0) {
			return this;
		} else {
			const start = this._start + (this._reversed ? -n : n);
			return this.copy({ start });
		}
	}
	stretch(delta = 0) {
		const n = check(Math.trunc(delta), [
			[ isNaN,		`* FrangeT~stretch: delta.need.number`				],
			[ isInfinity,	`* FrangeT~stretch: delta.need.finity.number`		]]);
		if (n == 0) {
			return this;
		} else if (this._length == Infinity) {
			return this;
		} else {
			let reversed  = this._reversed,
				length    = this._length + n;
			if (length < 0) {
				reversed  = !reversed;
				length    = -length;
			}
			return this.copy({ length, reversed });
		}
	}
	slice(offset = 0, length = Infinity) {
		const nOffset      = check(Math.trunc(offset), [
			[ isNaN,		`* FrangeT~slice: offset.need.number`				],
			[ isInfinity,	`* FrangeT~slice: offset.need.finity.number`		],
			[ x => x < 0 && this._length === Infinity,
							`* FrangeT~slice: offset.need.non-negative.number` 	]]);
		const nLength      = check(Math.trunc(length), [
			[ isNaN,		`* FrangeT~slice: length.need.number`				]]);

		const newStart     = this._start + nOffset + (nOffset < 0 ? this._length : 0),
			  newLength    = nLength >= 0 ? nLength        : -nLength,
			  newReversed  = nLength >= 0 ? this._reversed : !this._reversed;
		return this.copy({ start: newStart, length: newLength, reversed: newReversed });
	}
	reverse() {
		check(this._length, [
			[ isInfinity,	`* FrangeT~reverse: cannot.reverse.infinity.list`	]]);
		const reversed = !this._reversed,
			  start    =  this._reversed ? (this._start - this._length) : (this._start + this._length);
		return this.copy({ start, reversed });
	}

	map(...args) {
		return args.reduce((fr, f) => {
			if (f === $I) {
				return fr;
			} else {
				const at = $compose(f)(fr.freeAt);
				return new FrangeT(at, 0, this.length);
			}
		}, this);
	}
	apply(...args) {
		return args.reduce((fr, fa) => {
			const rAt     = fr.freeAt,
			      rLen    = fr.length,
				  aAt     = fa.freeAt,
			      aLen    = fa.length;
			const at      = aLen == 0
				  		  ? $S(rAt)(aAt)
	  					  : i => {
								const ai  =  i       % aLen,
								      ri  = (i - ai) / aLen;
								return rAt(ri)(aAt(ai));
							};
			return new FrangeT(at, 0, rLen * aLen);
		}, this);
	}
	concat(...args) {
		return args.reduce((fr, fa) => {
			const rAt  = fr.freeAt,
			      rLen = fr.length,
				  aAt  = fa.freeAt,
			      aLen = fa.length;
			const at   = aLen == 0 ? rAt : (rLen == 0 ? aAt : i => i < rLen ? rAt(i) : aAt(i - rLen));
			return new FrangeT(at, 0, rLen + aLen);
		}, this);
	}
	collapse() {
		return this.reduce((fr, fa) => fr ? fr.concat(fa) : fa, null);
	}
	mbind(...args) {
		return args.reduce((fr, f) => fr.map(f).collapse(), this);
	}
	zip(...args) {
		const mapThis = i => new FrangeT($K(this.freeAt(i)), 0, 1);
		if (args.length > 0) {
			const ats     = args.map(fr => {
								const at = fr.freeAt;
								return i => new FrangeT($K(at(i)), 0, 1);
							}),
				  length  = args.reduce((len, fr) => Math.min(len, fr.length), this.length),
				  at      = i => ats.map(g => g(i)).reduce((fr, fa) => fr.concat(fa), mapThis(i));
				  return new FrangeT(at, 0, length);
		} else {
			return new FrangeT($I, 0, this.length).map(mapThis);
		}
	}
};
// frange :: Int -> (Int -> a) -> FrangeT Int a
const frange    = length => at => new FrangeT(at, 0, length);
// fstart :: FrangeT Int a -> Int
const fstart    = fr => fr.start;
// flength :: FrangeT Int a -> Int
const flength   = fr => fr.length;
// freversed :: FrangeT Int a -> Boolean
const freversed = fr => fr.reversed;
// fat :: FrangeT Int a -> Int -> a
const fat       = fr => fr.at;
// fmove :: FrangeT Int a -> Int -> Int -> FrangeT Int a
const fmove     = fr => i => len => fr.move(i, len);
// fslide :: FrangeT Int a -> Int -> FrangeT Int a
const fslide    = fr => fr.slide;
// fstretch :: FrangeT Int a -> Int -> FrangeT Int a
const fstretch  = fr => fr.stretch;
// fslice :: FrangeT Int a -> Int -> Int -> FrangeT Int a
const fslice    = fr => i => len => fr.slice(i, len);
// freverse :: FrangeT Int a -> FrangeT Int a
const freverse  = fr => fr.reverse();

// instanceof Functor (FrangeT Int a) where
// fmap :: (a -> b) -> FrangeT Int a -> FrangeT Int b
const fmap      = f  => fa => fa.map(f);

// instanceof Applicative (FrangeT Int a) where
// pure :: a -> FrangeT Int a
const pure      = a  => frange(1)($K(a));
// fapply :: FrangeT Int (a -> b) -> FrangeT Int a -> FrangeT Int b
const fapply    = ff => fa => ff.apply(fa);

// instanceof Monoid (FrangeT Int a) where
// mempty :: FrangeT Int a
const mempty    = frange(0)($I);
// mappend :: FrangeT Int a -> FrangeT Int a -> FrangeT Int a
const mappend   = f1 => f2 => f1.concat(f2);
// fmappend :: FrangeT Int (FrangeT Int a) = FrangeT Int a
const mconcat   = fs => fs.collapse();

// instance Monad (FrangeT Int a) where
// mbind :: FrangeT Int a -> (a -> FrangeT Int b) -> FrangeT Int b
const mbind     = fa => ff => fa.mbind(ff);

// ffoldl :: (b -> a -> b) -> b -> FrangeT Int a -> b
const ffoldl    = f  => m  => fa => {
	const rec = i  => m  => i < fa.length ? rec(i + 1)(f(m)(fa.at(i))) : m;
	return rec(0)(m);
};
// ffoldr :: (a -> b -> b) -> b -> FrangeT Int a -> b
const ffoldr    = f  => m  => fa => {
	const rec = i  => m  => i < fa.length ? rec(i + 1)(f(fa.at(i))(m)) : m;
	return rec(0)(m);
};
// fzip :: FrangeT Int a -> FrangeT Int b -> FrangeT Int ([a,b])
const fzip      = fa => fb => fa.zip(fb);

// fcmp :: FrangeT Int a -> FrangeT Int a -> Boolean
const fcmp      = fa => fb => {
	if (fa == null) return fb == null;
	if (fb == null) return false;
	if (fa instanceof FrangeT && fb instanceof FrangeT) {
		if (fa.length != fb.length) return false;
		for (let i = 0; i < fa.length; i++) {
			if (!ucmp(fa.at(i))(fb.at(i))) return false;
		}
		return true;
	}	
	throw new Error("* fcmp: not FrangeT instance.");
};
const ucmp      = ta => tb => {
	if (ta instanceof FrangeT && tb instanceof FrangeT) {
		return fcmp(ta)(tb);
	} else if (Array.isArray(ta) && Array.isArray(tb)) {
		if (ta.length != tb.length) return false;
		for (let i = 0; i < ta.length; i++) {
			if (!ucmp(ta[i])(tb[i])) return false;
		}
		return true;
	} else { 
		return ta == tb;
	}
};

new PropDefT()
	.makeValue("fmap",    fmap)
	.makeValue("pure",    pure)
	.makeValue("fapply",  fapply)
	.makeValue("mempty",  mempty)
	.makeValue("mappend", mappend)
	.makeValue("mconcat", mconcat)
	.makeValue("mbind",   mbind)
	.makeValue("foldl",   ffoldl)
	.makeValue("foldr",   ffoldr)
	.makeValue("zip",     fzip)
	.defines(FrangeT);

module.exports = {
	FrangeT,
	frange,
	fstart,
	flength,
	freversed,
	fat,
	fmove,
	fslide,
	fstretch,
	fslice,
	freverse,
	fcmp,
	ucmp
};
