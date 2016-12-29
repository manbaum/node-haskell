
"use strict"

const { PropDefT                        } = require("../langutil");
const { $S, $K, $I                      } = require("../ski");
const { $compose                        } = require("../compose");
const { $apply, $rapply                 } = require("../apply");

const isInfinity = x               => x === Infinity || x === -Infinity;
const isFunction = f               => typeof f === "function";
const isInRange  = (min, max) => x => x >= min && x <  max;
const isOutRange = (min, max) => x => x <  min || x >= max;
const limit      = (min, max) => x => x <= min ? min : (x >= max ? max : x);
const throws     = msg             => { throw new Error(msg); };
const check      = (x, checks)     => checks.reduce((x, [f, msg]) => f(x) ? throws(msg) : x, x);

const FArrayT = class {
	constructor(at = $I, start = 0, length = Infinity, reversed = false) {
		this._at       = isFunction(at) ? at : $K(at);
		this._start    = check(Math.trunc(start), [
			[ isNaN,		`* FArrayT: start.need.number`			],
			[ isInfinity,	`* FArrayT: start.need.finity.number`	]]);
		this._length   = check(Math.trunc(length), [
			[ isNaN,		`* FArrayT: length.need.number`			],
			[ x => x < 0,	`* FArrayT: length.need.positive.number`]]);
		this._reversed = !!reversed;
	}
	copy({ at, start, length, reversed }) {
		const newAt    = at       != null ? at       : this._at,
		      newStart = start    != null ? start    : this._start,
		      newLen   = length   != null ? length   : this._length,
		      newRev   = reversed != null ? reversed : this._reversed;
		return new FArrayT(newAt, newStart, newLen, newRev);
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
	forEach(each, allowInfinity = false) {
		allowInfinity || check(this.length, [
			[ isInfinity,	`* FArrayT~forEach: cannot.iterate.infinity.list`	]]);
		let i = 0,
			n = this.length;
		while (i < n) {
			each(this.rawAt(i), i, this);
			i++;
		}
		return this;
	}
	reduce(each, init, allowInfinity = false) {
		let result = init;
		this.forEach((v, i) => result = each(result, v, i, this), allowInfinity);
		return result;
	}
	map(each) {
		const start    = 0,
			  reversed = false,
		      at       = i => each(this.rawAt(i), i, this);
		return this.copy({ at, start, reversed });
	}
	toArray(deep = false, allowInfinity = false) {
		const result = [],
			  each   = deep
			  		 ? v => result.push(v instanceof FArrayT ? v.toArray(true) : v)
			  	     : v => result.push(v);
		this.forEach(each, allowInfinity);
		return result;
	}
	show(n) {
		const m = arguments.length > 0
			    ? (isInfinity(n) ? (n > 0 ? 20 : -20) : n)
			    : (isInfinity(this._length) || this._length > 100 ? 20 : this._length),
			  r = this.changeLength(m).reduce((r, n, i) => r + (i % 5 == 0 ? (i % 10 == 0 && i > 0 ? "\n" : "") + `[${i}]${n}\t` : `${n}\t`), "");
		console.log(`[ start: ${this._start}, length: ${this._length}, direction: ${this._reversed ? "<-" : "->"} ]`);
		console.log(r);
	}

	get start() {
		return this._start;
	}
	moveTo(start = 0) {
		const n = check(Math.trunc(start), [
			[ isNaN,		`* FArrayT~moveTo: start.need.number`		],
			[ isInfinity,	`* FArrayT~moveTo: start.need.finity.number`]]);
		return n == this._start ? this : this.copy({ start: n });
	}
	slide(delta = 1) {
		const n = check(Math.trunc(delta), [
			[ isNaN,		`* FArrayT~slide: delta.need.number`		],
			[ isInfinity,	`* FArrayT~slide: delta.need.finity.number`	]]);
		if (n == 0) {
			return this;
		} else {
			const start = this._start + (this._reversed ? -n : n);
			return this.copy({ start });
		}
	}

	get length() {
		return this._length;
	}
	changeLength(length = Infinity) {
		const n           = check(Math.trunc(length), [
			[ isNaN,		`* FArrayT~changeLength: length.need.number`	]]);
		const newLength   = n < 0 ? -n              : n;
		const newReversed = n < 0 ? !this._reversed : this._reversed;
		if (newLength == this._length && newReversed == this._reversed) {
			return this;
		} else {
			return this.copy({ length: newLength, reversed: newReversed });
		}
	}
	stretch(delta = 0) {
		const n = check(Math.trunc(delta), [
			[ isNaN,		`* FArrayT~stretch: delta.need.number`			],
			[ isInfinity,	`* FArrayT~stretch: delta.need.finity.number`	]]);
		if (n == 0 || this._length == Infinity) {
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

	get isReversed() {
		return this._reversed;
	}
	flip() {
		const reversed = !this._reversed;
		return this.copy({ reversed });
	}
	reverse() {
		check(this._length, [
			[ isInfinity,	`* FArrayT~reverse: cannot.reverse.infinity.list`]]);
		const reversed = !this._reversed,
			  start    =  this._reversed
			  		   ? (this._start - this._length)
			  		   : (this._start + this._length);
		return this.copy({ start, reversed });
	}
	turnOver() {
		const n        = this._start,
			  nAt      = this.freeAt,
		      at       = this._reversed
		      		   ? i => nAt(i - n)
		      		   : i => nAt(n - 1 - i),
			  reversed = !this._reversed;
		return this.copy({ at, reversed });
	}

	get freeAt() {
		const at    = this._at,
		      start = this._start,
		      rev   = this._reversed;
		return i => at(start + (rev ? -1 - i : i));
	}
	rawAt(i) {
		return this._at(this._start + (this._reversed ? -1 - i : i));
	}
	at(index = 0) {
		const isOutRange_ = isOutRange(0, this._length);
		const i           = check(Math.trunc(index), [
			[ isNaN,		`* FArrayT~at: index.need.number`					],
			[ isInfinity,	`* FArrayT~at: index.need.finity.number`			],
			[ isOutRange_,	`* FArrayT~at: index.out.of.range`					]]);
		return this.rawAt(i);
	}
	roundAt(index = 0) {
		const i  = check(Math.trunc(index), [
			[ isNaN,		`* FArrayT~roundAt: index.need.number`				]]);
		isInfinity(this._length) && check(i, [
			[ x => x < 0,	`* FArrayT~roundAt: index.need.non-negative.number`	]]);
		const ix = i < 0 ? i + this._length : i;
		return isInRange(0, this._length)(ix) ? this.rawAt(ix) : undefined;
	}

	head() {
		check(this._length, [
			[ x => x == 0,	`* FArrayT~head: no.head.of.empty.list`			]]);
		return this.at(0);
	}
	tail() {
		check(this._length, [
			[ x => x == 0,	`* FArrayT~tail: no.tail.of.empty.list`			]]);
		const start  = this._start + (this._reversed ? -1 : 1),
			  length = this._length - 1;
		return this.copy({ start, length });
	}
	last() {
		check(this._length, [
			[ x => x == 0,	`* FArrayT~last: no.last.of.empty.list`			],
			[ isInfinity,	`* FArrayT~last: no.last.of.infinity.list`		]]);
		return this.rawAt(this._length - 1);
	}
	init() {
		check(this._length, [
			[ x => x == 0,	`* FArrayT~init: no.initial.of.empty.list`		],
			[ isInfinity,	`* FArrayT~init: no.initial.of.infinity.list`	]]);
		return this.stretch(-1);
	}

	slice(offset = 0, length = Infinity) {
		const nOffset     = check(Math.trunc(offset), [
			[ isNaN,		`* FArrayT~slice: offset.need.number`				],
			[ isInfinity,	`* FArrayT~slice: offset.need.finity.number`		]]);
		const nLength     = check(Math.trunc(length), [
			[ isNaN,		`* FArrayT~slice: length.need.number`				]]);
		const realStart   = this._start - (this._reversed ? this._length : 0           ),
			  realEnd	  = this._start + (this._reversed ? 0            : this._length),
			  rangeLimit  = limit(0, this._length);
		const tmpStart    = nOffset,
			  tmpEnd      = tmpStart + nLength,
			  adjustStart = rangeLimit(tmpStart),
			  adjustEnd   = rangeLimit(tmpEnd);
		const newStart    = this._reversed ? realEnd - adjustStart : realStart + adjustStart,
			  newEnd      = this._reversed ? realEnd - adjustEnd   : realStart + adjustEnd,
			  newLength   = Math.abs(newEnd - newStart),
			  newReversed = (nLength < 0) != this._reversed;
		if (this._start == newStart && this._length == newLength && this._reversed == newReversed) {
			return this;
		} else {
			return this.copy({ start: newStart, length: newLength, reversed: newReversed });
		}
	}
	roundSlice(offset = 0, length = Infinity) {
		const nOffset     = check(Math.trunc(offset), [
			[ isNaN,		`* FArrayT~roundSlice: offset.need.number`				],
			[ isInfinity,	`* FArrayT~roundSlice: offset.need.finity.number`		]]);
		isInfinity(this._length) && check(nOffset, [
			[ x => x < 0,	`* FArrayT~roundSlice: index.need.non-negative.number`	]]);
		const nLength     = check(Math.trunc(length), [
			[ isNaN,		`* FArrayT~roundSlice: length.need.number`				]]);
		const realStart   = this._start - (this._reversed ? this._length : 0           ),
			  realEnd	  = this._start + (this._reversed ? 0            : this._length),
			  rangeLimit  = limit(0, this._length);
		const tmpStart    = nOffset < 0 ? nOffset + this._length : nOffset,
			  tmpEnd      = tmpStart + nLength,
			  adjustStart = rangeLimit(tmpStart),
			  adjustEnd   = rangeLimit(tmpEnd);
		const newStart    = this._reversed ? realEnd - adjustStart : realStart + adjustStart,
			  newEnd      = this._reversed ? realEnd - adjustEnd   : realStart + adjustEnd,
			  newLength   = Math.abs(newEnd - newStart),
			  newReversed = (nLength < 0) != this._reversed;
		if (this._start == newStart && this._length == newLength && this._reversed == newReversed) {
			return this;
		} else {
			return this.copy({ start: newStart, length: newLength, reversed: newReversed });
		}
	}

	fmap(...args) {
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
//    farray     :: Int -> (Int -> a) -> FArrayT Int a
const farray     = length => at => new FArrayT(at, 0, length);
//    fastart    :: FArrayT Int a -> Int
const fastart    = fr => fr.start;
//    famove     :: FArrayT Int a -> Int -> FArrayT Int a
const famove     = fr => fr.moveTo;
//    faslide    :: FArrayT Int a -> Int -> FArrayT Int a
const faslide    = fr => fr.slide;
//    falength   :: FArrayT Int a -> Int
const falength   = fr => fr.length;
//    faclen     :: FArrayT Int a -> Int -> FArrayT Int a
const faclen     = fr => fr.changeLength;
//    fastretch  :: FArrayT Int a -> Int -> FArrayT Int a
const fastretch  = fr => fr.stretch;
//    fareversed :: FArrayT Int a -> Boolean
const fareversed = fr => fr.reversed;
//    faflip     :: FArrayT Int a -> FArrayT Int a
const faflip     = fr => fr.flip();
//    fareverse  :: FArrayT Int a -> FArrayT Int a
const fareverse  = fr => fr.reverse();
//    fareverse  :: FArrayT Int a -> FArrayT Int a
const faturnover = fr => fr.turnOver();
//    faat       :: FArrayT Int a -> Int -> a
const faat       = fr => fr.at;
//    farat      :: FArrayT Int a -> Int -> a
const farat      = fr => fr.roundAt;
//    faslice    :: FArrayT Int a -> Int -> Int -> FArrayT Int a
const faslice    = fr => i => len => fr.slice(i, len);
//    farslice   :: FArrayT Int a -> Int -> Int -> FArrayT Int a
const farslice   = fr => i => len => fr.roundSlice(i, len);
//    fahead     :: FArrayT Int a -> a
const fahead     = fr => fr.head();
//    fatail     :: FArrayT Int a -> FArrayT Int a
const fatail     = fr => fr.tail();
//    falast     :: FArrayT Int a -> a
const falast     = fr => fr.last();
//    fainit     :: FArrayT Int a -> FArrayT Int a
const fainit     = fr => fr.init();

// instanceof Functor (FArrayT Int a) where
//    fmap       :: (a -> b) -> FArrayT Int a -> FArrayT Int b
const fmap       = f  => fa => fa.fmap(f);

// instanceof Applicative (FArrayT Int a) where
//    pure       :: a -> FArrayT Int a
const pure       = a  => farray(1)($K(a));
//    fapply     :: FArrayT Int (a -> b) -> FArrayT Int a -> FArrayT Int b
const fapply     = ff => fa => ff.apply(fa);

// instanceof Monoid (FArrayT Int a) where
//    mempty     :: FArrayT Int a
const mempty     = farray(0)($I);
//    mappend    :: FArrayT Int a -> FArrayT Int a -> FArrayT Int a
const mappend    = f1 => f2 => f1.concat(f2);
//    fmappend   :: FArrayT Int (FArrayT Int a) = FArrayT Int a
const mconcat    = fs => fs.collapse();

// instance Monad (FArrayT Int a) where
//    mbind      :: FArrayT Int a -> (a -> FArrayT Int b) -> FArrayT Int b
const mbind      = fa => ff => fa.mbind(ff);

//    foldl      :: (b -> a -> b) -> b -> FArrayT Int a -> b
const foldl      = f  => m  => fa => {
	const rec = i  => m  => i < fa.length ? rec(i + 1)(f(m)(fa.at(i))) : m;
	return rec(0)(m);
};
//    foldr      :: (a -> b -> b) -> b -> FArrayT Int a -> b
const foldr      = f  => m  => fa => {
	const rec = i  => m  => i < fa.length ? rec(i + 1)(f(fa.at(i))(m)) : m;
	return rec(0)(m);
};
//    fzip       :: FArrayT Int a -> FArrayT Int b -> FArrayT Int ([a,b])
const fzip       = fa => fb => fa.zip(fb);

//    facmp      :: FArrayT Int a -> FArrayT Int a -> Boolean
const facmp      = fa => fb => {
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
		return facmp(ta)(tb);
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
	.makeValue("foldl",   foldl)
	.makeValue("foldr",   foldr)
	.makeValue("zip",     fzip)
	.defines(FArrayT);

module.exports = {
	FArrayT,
	farray,
	fastart,
	famove,
	faslide,
	falength,
	faclen,
	fastretch,
	fareversed,
	faflip,
	fareverse,
	faturnover,
	faat,
	farat,
	faslice,
	farslice,
	fahead,
	fatail,
	falast,
	fainit,
	facmp,
	ucmp
};
