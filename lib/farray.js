
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

const FArrayT = class {
	constructor(at = $I, start = 0, length = Infinity, reversed = false) {
		this._at       = isFunction(at) ? at : $K(at);
		this._start    = check(Math.trunc(start), [
			[ isNaN,		`* FArrayT: start.need.number`						],
			[ isInfinity,	`* FArrayT: start.need.finity.number`				]]);
		this._length   = check(Math.trunc(length), [
			[ isNaN,		`* FArrayT: length.need.number`						],
			[ x => x < 0,	`* FArrayT: length.need.positive.number`			]]);
		this._reversed = !!reversed;
	}

	copy({ at, start, length, reversed }) {
		const newAt    = at       != null ? at       : this._at,
		      newStart = start    != null ? start    : this._start,
		      newLen   = length   != null ? length   : this._length,
		      newRev   = reversed != null ? reversed : this._reversed;
		return new FArrayT(newAt, newStart, newLen, newRev);
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
	forEach(f, allowInfinity = false) {
		allowInfinity || check(this.length, [
			[ isInfinity,	`* FArrayT~forEach: cannot.iterate.infinity.list`	]]);
		let i = 0,
			n = this.length;
		while (i < n) {
			f(this.rawAt(i), i, this);
			i++;
		}
		return this;
	}
	reduce(f, init, allowInfinity = false) {
		let result = init;
		this.forEach((v, i) => result = f(result, v, i, this), allowInfinity);
		return result;
	}
	toArray(deep = false, allowInfinity = false) {
		const result = [],
			  each   = deep
			  		 ? v => result.push(v instanceof FArrayT ? v.toArray(true) : v)
			  	     : v => result.push(v);
		this.forEach(each, allowInfinity);
		return result;
	}
	*[Symbol.iterator](allowInfinity = false) {
		let i = 0,
			n = isInfinity(this.length) && !allowInfinity ? 100 : this.length;
		while(i < n) {
			yield this.rawAt(i);
			i++;
		}
		allowInfinity || check(this._length, [
			[ isInfinity,	`* FArrayT~iterator: 100.times.on.infinity.list`	]]);
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
			[ isNaN,		`* FArrayT~at: index.need.number`					]]);
		return (i >= 0 && i < this._length) ? this.rawAt(i) : undefined;
	}
	move(start, length) {
		const newStart    = check(Math.trunc(start), [
			[ isNaN,		`* FArrayT~move: start.need.number`					],
			[ isInfinity,	`* FArrayT~move: start.need.finity.number`			]]);
		const nLength     = check(Math.trunc(length), [
			[ isNaN,		`* FArrayT~move: length.need.number`				]]);
		const newLength   = nLength >= 0 ? nLength        : -nLength;
		const newReversed = nLength >= 0 ? this._reversed : !this._reversed;
		return this.copy({ start: newStart, length: newLength, reversed: newReversed });
	}
	slide(delta = 1) {
		const n = check(Math.trunc(delta), [
			[ isNaN,		`* FArrayT~slide: delta.need.number`				],
			[ isInfinity,	`* FArrayT~slide: delta.need.finity.number`			],
			[ x => x < 0 && this._length === Infinity,
							`* FArrayT~slide: delta.need.non-negative.number` 	]]);
		if (n == 0) {
			return this;
		} else {
			const start = this._start + (this._reversed ? -n : n);
			return this.copy({ start });
		}
	}
	stretch(delta = 0) {
		const n = check(Math.trunc(delta), [
			[ isNaN,		`* FArrayT~stretch: delta.need.number`				],
			[ isInfinity,	`* FArrayT~stretch: delta.need.finity.number`		]]);
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
			[ isNaN,		`* FArrayT~slice: offset.need.number`				],
			[ isInfinity,	`* FArrayT~slice: offset.need.finity.number`		],
			[ x => x < 0 && this._length === Infinity,
							`* FArrayT~slice: offset.need.non-negative.number` 	]]);
		const nLength      = check(Math.trunc(length), [
			[ isNaN,		`* FArrayT~slice: length.need.number`				]]);

		const newStart     = this._start + nOffset + (nOffset < 0 ? this._length : 0),
			  newLength    = nLength >= 0 ? nLength        : -nLength,
			  newReversed  = nLength >= 0 ? this._reversed : !this._reversed,
			  limitLength  = limit(0, this.length)(newLength);
		return this.copy({ start: newStart, length: limitLength, reversed: newReversed });
	}
	reverse() {
		check(this._length, [
			[ isInfinity,	`* FArrayT~reverse: cannot.reverse.infinity.list`	]]);
		const reversed = !this._reversed,
			  start    =  this._reversed ? (this._start - this._length) : (this._start + this._length);
		return this.copy({ start, reversed });
	}
	head() {
		check(this._length, [
			[ x => x == 0,	`* FArrayT~head: no.head.of.empty.list`				]]);
		return this.At(0);
	}
	tail() {
		check(this._length, [
			[ x => x == 0,	`* FArrayT~head: no.head.of.empty.list`				]]);
		return this.slice(1);
	}

	map(...args) {
		return args.reduce((fr, f) => {
			if (f === $I) {
				return fr;
			} else {
				const at = $compose(f)(fr.freeAt);
				return new FArrayT(at, 0, this.length);
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
			return new FArrayT(at, 0, rLen * aLen);
		}, this);
	}
	concat(...args) {
		return args.reduce((fr, fa) => {
			const rAt  = fr.freeAt,
			      rLen = fr.length,
				  aAt  = fa.freeAt,
			      aLen = fa.length;
			const at   = aLen == 0 ? rAt : (rLen == 0 ? aAt : i => i < rLen ? rAt(i) : aAt(i - rLen));
			return new FArrayT(at, 0, rLen + aLen);
		}, this);
	}
	collapse() {
		return this.reduce((fr, fa) => fr ? fr.concat(fa) : fa, null);
	}
	mbind(...args) {
		return args.reduce((fr, f) => fr.map(f).collapse(), this);
	}
	zip(...args) {
		const mapThis = i => new FArrayT($K(this.freeAt(i)), 0, 1);
		if (args.length > 0) {
			const ats     = args.map(fr => {
								const at = fr.freeAt;
								return i => new FArrayT($K(at(i)), 0, 1);
							}),
				  length  = args.reduce((len, fr) => Math.min(len, fr.length), this.length),
				  at      = i => ats.map(g => g(i)).reduce((fr, fa) => fr.concat(fa), mapThis(i));
				  return new FArrayT(at, 0, length);
		} else {
			return new FArrayT($I, 0, this.length).map(mapThis);
		}
	}
};
// farray :: Int -> (Int -> a) -> FArrayT Int a
const farray    = length => at => new FArrayT(at, 0, length);
// fstart :: FArrayT Int a -> Int
const fstart    = fr => fr.start;
// flength :: FArrayT Int a -> Int
const flength   = fr => fr.length;
// freversed :: FArrayT Int a -> Boolean
const freversed = fr => fr.reversed;
// fat :: FArrayT Int a -> Int -> a
const fat       = fr => fr.at;
// fmove :: FArrayT Int a -> Int -> Int -> FArrayT Int a
const fmove     = fr => i => len => fr.move(i, len);
// fslide :: FArrayT Int a -> Int -> FArrayT Int a
const fslide    = fr => fr.slide;
// fstretch :: FArrayT Int a -> Int -> FArrayT Int a
const fstretch  = fr => fr.stretch;
// fslice :: FArrayT Int a -> Int -> Int -> FArrayT Int a
const fslice    = fr => i => len => fr.slice(i, len);
// freverse :: FArrayT Int a -> FArrayT Int a
const freverse  = fr => fr.reverse();

// instanceof Functor (FArrayT Int a) where
// fmap :: (a -> b) -> FArrayT Int a -> FArrayT Int b
const fmap      = f  => fa => fa.map(f);

// instanceof Applicative (FArrayT Int a) where
// pure :: a -> FArrayT Int a
const pure      = a  => farray(1)($K(a));
// fapply :: FArrayT Int (a -> b) -> FArrayT Int a -> FArrayT Int b
const fapply    = ff => fa => ff.apply(fa);

// instanceof Monoid (FArrayT Int a) where
// mempty :: FArrayT Int a
const mempty    = farray(0)($I);
// mappend :: FArrayT Int a -> FArrayT Int a -> FArrayT Int a
const mappend   = f1 => f2 => f1.concat(f2);
// fmappend :: FArrayT Int (FArrayT Int a) = FArrayT Int a
const mconcat   = fs => fs.collapse();

// instance Monad (FArrayT Int a) where
// mbind :: FArrayT Int a -> (a -> FArrayT Int b) -> FArrayT Int b
const mbind     = fa => ff => fa.mbind(ff);

// ffoldl :: (b -> a -> b) -> b -> FArrayT Int a -> b
const ffoldl    = f  => m  => fa => {
	const rec = i  => m  => i < fa.length ? rec(i + 1)(f(m)(fa.at(i))) : m;
	return rec(0)(m);
};
// ffoldr :: (a -> b -> b) -> b -> FArrayT Int a -> b
const ffoldr    = f  => m  => fa => {
	const rec = i  => m  => i < fa.length ? rec(i + 1)(f(fa.at(i))(m)) : m;
	return rec(0)(m);
};
// fzip :: FArrayT Int a -> FArrayT Int b -> FArrayT Int ([a,b])
const fzip      = fa => fb => fa.zip(fb);

// fcmp :: FArrayT Int a -> FArrayT Int a -> Boolean
const fcmp      = fa => fb => {
	if (fa == null) return fb == null;
	if (fb == null) return false;
	if (fa instanceof FArrayT && fb instanceof FArrayT) {
		if (fa.length != fb.length) return false;
		for (let i = 0; i < fa.length; i++) {
			if (!ucmp(fa.at(i))(fb.at(i))) return false;
		}
		return true;
	}	
	throw new Error("* fcmp: not FArrayT instance.");
};
const ucmp      = ta => tb => {
	if (ta instanceof FArrayT && tb instanceof FArrayT) {
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
	.defines(FArrayT);

module.exports = {
	FArrayT,
	farray,
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
