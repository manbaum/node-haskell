
"use strict"

const { makeGet, makeValue, defineProps } = require("../langutil");
const { $S, $K, $I                      } = require("../ski");
const { $compose                        } = require("../compose");
const { $apply, $rapply                 } = require("../apply");

const isInfinity = x               => x === Infinity || x === -Infinity;
const isFunction = f               => typeof f === "function";
const throws     = msg             => { throw new Error(msg); };
const check      = (x, checks)     => checks.reduce((x, [f, msg]) => f(x) ? throws(msg) : x, x);
const limit      = (min, max) => x => x <= min ? min : (x >= max ? max : x);

const FrangeT = class {
	constructor(at = $I, start = 0, length = 1, reversed = false) {
		this._at       = isFunction(at) ? at : $K(at);
		this._start    = check(Math.trunc(start), [
			[ isNaN,		`* FrangeT: start.need.number`						],
			[ isInfinity,	`* FrangeT: start.need.finity.number`				]]);
		this._length   = $rapply(check(Math.trunc(length), [
			[ isNaN,		`* FrangeT: length.need.number`						]]))
			(x => x >= 0 ? x : 0);
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
		let i = 0,
			n = this.length;
		while (i < n) {
			f(this.rawAt(i), i, this);
			i++;
		}
		return this;
	}
	reduce(f, init) {
		let result = init;
		this.forEach((v, i) => result = f(result, v, i, this));
		return result;
	}
	toArray() {
		const result = [];
		this.forEach(v => result.push(v));
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

	at(index = 0) {
		const i = check(Math.trunc(index), [
			[ isNaN,		`* FrangeT#at: index.need.number`					]]);
		return (i >= 0 && i < this._length) ? this.rawAt(i) : undefined;
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
	slide(delta = 1) {
		const n = check(Math.trunc(delta), [
			[ isNaN,		`* FrangeT#slide: delta.need.number`				],
			[ isInfinity,	`* FrangeT#slide: delta.need.finity.number`			]]);
		if (n == 0) {
			return this;
		} else {
			const start = this._start + (this._reversed ? -n : n);
			return this.copy({ start });
		}
	}
	stretch(delta = 0) {
		const n = check(Math.trunc(delta), [
			[ isNaN,		`* FrangeT#stretch: delta.need.number`				],
			[ isInfinity,	`* FrangeT#stretch: delta.need.finity.number`		]]);
		if (n == 0) {
			return this;
		} else {
			let start  = this._start,
				length = this._length + n;
			if (length < 0) {
				start  += length - 1;
				length = -length;
			}
			return this.copy({ start, length });
		}
	}
	slice(offset = 0, length = Infinity) {
		let newStart = check(Math.trunc(offset), [
			[ isNaN,		`* FrangeT#slice: offset.need.number`				],
			[ isInfinity,	`* FrangeT#slice: offset.need.finity.number`		],
			[ x => x < 0 && this._length === Infinity,
							`* FrangeT#slice: offset.need.non-negative.number` 	]]);
		if (newStart < 0) {
			newStart += this._length;
		}

		let newLen   = check(Math.trunc(length), [
			[ isNaN,		`* FrangeT#slice: length.need.number`				]]);
		if (newLen < 0) {
			newStart += newLen - 1;
			newLen   =  -newLen;
		}

		const indexlimit = limit(0, this._length),
			  realStart  = indexLimit(newStart),
			  realEnd    = indexLimit(newLen === Infinity ? newLen : newStart + newLen);
		return this.slide(realStart).stretch(realEnd - realStart - this._length);
	}
	reverse() {
		const reversed = !this.reversed,
			  start    = this._reversed ? (this._start - this._length) : (this._start + this._length);
		return this.copy({ start, reversed });
	}

	map(...args) {
		return args.reduce((fr, f) => {
			if (f === $I) {
				return fr;
			} else {
				const at = $compose(f)(fr.freeAt);
				return fr.copy({ at })
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
			const rAt     = fr.freeAt,
			      rLen    = fr.length,
				  aAt     = fa.freeAt,
			      aLen    = fa.length;
			if (aLen > 0) {
				const at  = i => i < rLen ? rAt(i) : aAt(i - rLen);
				return new FrangeT(at, 0, rLen + aLen);
			} else {
				return fr;
			}
		}, this);
	}
	collapse() {
		return this.reduce((fr, fa) => fr ? fr.concat(fa) : fa);
	}
	mbind(...args) {
		const bindRec = (fr, fs) => fs.length > 0 ? bindRec(fr.map(fs[0]).collapse(), fs.slice(1)) : fr;
		return bindRec(this, args);
	}
	zip(...args) {
		const mapThis = i => new FrangeT($K(this.freeAt(i)), 0, 1);
		if (args.length > 0) {
			const maps    = args.map(fr => i => new FrangeT($K(fr.freeAt(i)), 0, 1)),
				  length  = args.reduce((len, fr) => Math.min(len, fr.length), this.length),
				  at      = i => maps.map(g => g(i)).reduce((fr, fa) => fr.concat(fa), mapThis(i));
				  return new FrangeT(at, 0, length);
		} else {
			return new FrangeT($I, 0, this.length).map(mapThis);
		}
	}
};
// frange :: Int -> (Int -> a) -> FrangeT Int a
const frange   = length => at => new FrangeT(at, 0, length);
// flength :: FrangeT Int a -> Int
const flength  = fr => fr.length;
// fat :: FrangeT Int a -> Int -> a
const fat      = fr => fr.at;
// fslide :: FrangeT Int a -> Int -> FrangeT Int a
const fslide   = fr => fr.slide;
// fstretch :: FrangeT Int a -> Int -> FrangeT Int a
const fstretch = fr => fr.stretch;
// fslice :: FrangeT Int a -> Int -> Int -> FrangeT Int a
const fslice   = fr => i  => length => fr.slice(i, length);

// fmap :: (a -> b) -> FrangeT Int a -> FrangeT Int b
const fmap     = f  => fa => fa.map(f);

// pure :: a -> FrangeT Int a
const pure     = a  => frange(1)($K(a));
// fapply :: FrangeT Int (a -> b) -> FrangeT Int a -> FrangeT Int b
const fapply   = ff => fa => ff.apply(fa);

// mempty :: FrangeT Int a
const mempty   = a  => frange(0)($K(a));
// mappend :: FrangeT Int a -> FrangeT Int a -> FrangeT Int a
const mappend  = fa => fb => fa.concat(fb);
// fmappend :: FrangeT Int (FrangeT Int a) = FrangeT Int a
const mconcat  = fs => fs.collapse();

// instance Monad (FrangeT Int a) where
// mbind :: FrangeT Int a -> (a -> FrangeT Int b) -> FrangeT Int b
const mbind    = fa => ff => fa.mbind(ff);

// ffoldl :: (b -> a -> b) -> b -> FrangeT Int a -> b
const ffoldl   = f  => m  => fa => {
	const rec  = i  => m  => i < fa.length ? rec(i + 1)(f(m)(fa.at(i))) : m;
	return rec(0)(m);
};
// ffoldr :: (a -> b -> b) -> b -> FrangeT Int a -> b
const ffoldr   = f  => m  => fa => {
	const rec  = i  => m  => i < fa.length ? rec(i + 1)(f(fa.at(i))(m)) : m;
	return rec(0)(m);
};
// fzip :: FrangeT Int a -> FrangeT Int b -> FrangeT Int ([a,b])
const fzip     = fa => fb => fa.zip(fb);

// fcmp :: FrangeT Int a -> FrangeT Int a -> Boolean
const fcmp = fa => fb => {
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
const ucmp = ta => tb => {
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

let props = {};
makeValue(props)("fmap"   )(fmap);
makeValue(props)("pure"   )(pure);
makeValue(props)("fapply" )(fapply);
makeGet  (props)("mempty" )(mempty);
makeValue(props)("mappend")(mappend);
makeValue(props)("mconcat")(mconcat);
makeValue(props)("mbind"  )(mbind);
makeValue(props)("foldl"  )(ffoldl);
makeValue(props)("foldr"  )(ffoldr);
makeValue(props)("zip"    )(fzip);
defineProps(FrangeT)(props);

module.exports = {
	FrangeT,
	frange,
	flength,
	fat,
	fslide,
	fstretch,
	fslice,
	fcmp,
	ucmp
};
