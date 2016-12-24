
"use strict"

const { makeGet, makeValue, defineProps } = require("../langutil");
const { $S, $K, $I                      } = require("../ski");
const { $compose                        } = require("../compose");

const isFunction = f => typeof f === "function";
const truncate   = (n, onNaN = $K()) => (t => isNaN(t) ? onNaN(n) : t)(Math.trunc(n));
const error      = message => x => { throw new Error(isFunction(message) ? String(message(x)) : String(message)); };

const FrangeT = class {
	constructor(at = $I, start = 0, length = 1, reversed = false) {
		this._at       = typeof at === "function" ? at : $K(at);
		this._start    = truncate(start,  error(`* FrangeT: start.not.number`));
		const nlength  = truncate(length, error(`* FrangeT: length.not.number`));
		this._length   = nlength >= 0 ? nlength : 0;
		this._reversed = !!reversed;
	}
	at(i = 0) {
		const ni = truncate(i, error(`* FrangeT#at: index.not.number`));
		const xi = this._start + (this._reversed ? -1 - ni : ni);
		return ni >= 0 && ni < this._length ? this._at(xi) : undefined;
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
		const ndelta = truncate(delta, error(`* FrangeT#slide: delta.not.number`));
		if (ndelta == 0) {
			return this;
		} else {
			const start = this._start + (this._reversed ? -ndelta : ndelta);
			return new FrangeT(this._at, start, this._length, this._reversed);
		}
	}
	stretch(delta = 0) {
		const ndelta  = truncate(delta, error(`* FrangeT#stretch: delta.not.number`));
		if (ndelta == 0) {
			return this;
		} else {
			return new FrangeT(this._at, this._start, this._length + ndelta, this._reversed);
		}
	}
	slice(offset = 0, length) {
		const noffset  = truncate(offset, error(`* FrangeT#slice: offset.not.number`));
		const nlength  = arguments.length < 2 ? this._length - (noffset < 0 ? noffset : 0) 
					   : truncate(length, error(`* FrangeT#slice: length.not.number`));
		const begin    = noffset + (noffset >= 0 ? 0 : this._length);
		const end      = begin + nlength;
		const roffset  = begin >= 0 ? (begin <= this._length ? begin : this._length) : 0;
		const rlength  = end   >= 0 ? (end   <= this._length ? end   : this._length) - roffset : 0;
		return this.slide(roffset).stretch(rlength - this._length);
	}
	reverse() {
		const start = this._start + (this._reversed ? -this._length : this._length);
		return new FrangeT(this._at, start, this._length, !this._reversed);
	}
	forEach(f) {
		const length = this.length;
		for (let i = 0; i < length; i++) {
			f(this.at(i), i, this);
		}
		return this;
	}
	reduce(f, m) {
		let r = m;
		this.forEach((v, i) => r = f(r, v, i, this));
		return r;
	}
	*[Symbol.iterator]() {
		const length = this.length;
		for (let i = 0; i < length; i++) {
			yield this.at(i);
		}
	}
	toArray() {
		const r = [];
		this.forEach(v => r.push(v));
		return r;
	}
	map(...args) {
		return args.reduce((fr, f) => {
			if (f === $I) {
				return fr;
			} else {
				const rat = fr._at;
				return new FrangeT(i => f(rat(i)), fr.start, fr.length, fr.isReversed);
			}
		}, this);
	}
	apply(...args) {
		return args.reduce((fr, fa) => {
			const rat = fr._at, rstart = fr.start, rlength = fr.length, rrev = fr.isReversed;
			const aat = fa._at, astart = fa.start, alength = fa.length, arev = fa.isReversed;
			if (alength == 0) {
				const srat = i => x => rat(rstart + (rrev ? -i : i))(x);
				const saat = i      => aat(astart + (arev ? -i : i));
				return new FrangeT($S(srat)(saat), 0, 0);
			} else {
				const at = i => {
					const ai =             i       % alength;
					const ri = Math.round((i - ai) / alength);
					return rat(rstart + (rrev ? -ri : ri))(aat(astart + (arev ? -ai : ai)));
				};
				return new FrangeT(at, 0, rlength * alength);
			}
		}, this);
	}
	concat(...args) {
		return args.reduce((fr, fa) => {
			const rat = fr._at, rstart = fr.start, rlength = fr.length, rrev = fr.isReversed;
			const aat = fa._at, astart = fa.start, alength = fa.length, arev = fa.isReversed;
			if (alength > 0) {
				const at = i => {
					if (ni < rlength) {
						return rat(rstart + (rrev ? -i : i));
					} else {
						return aat(astart + (arev ? rlength - i : i - rlength));
					}
				};
				return new FrangeT(at, 0, rlength + alength);
			} else {
				return fr;
			}
		}, this);
	}
	collapse() {
		return this.reduce((fr, fa) => fr ? fr.concat(fa) : fa);
	}
	mbind(...args) {
		const brec = (fr, fs) => fs.length > 0 ? brec(fr.map(fs[0]).collapse(), fs.slice(1)) : fr;
		return brec(this, args);
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
// ftake :: FrangeT Int a -> Int -> FrangeT Int a
const ftake    = fr => length => fr.slice(0, length);

// fmap :: (a -> b) -> FrangeT Int a -> FrangeT Int b
const fmap     = f => fa => fa.map(f);

// pure :: a -> FrangeT Int a
const pure     = a => frange(1)($K(a));
// fapply :: FrangeT Int (a -> b) -> FrangeT Int a -> FrangeT Int b
const fapply   = ff => fa => ff.apply(fa);

// mempty :: FrangeT Int a
const mempty   = a => frange(0)($K(a));
// mappend :: FrangeT Int a -> FrangeT Int a -> FrangeT Int a
const mappend  = fa => fb => fa.concat(fb);
// fmappend :: FrangeT Int (FrangeT Int a) = FrangeT Int a
const mconcat  = fs => fs.collapse();

// instance Monad (FrangeT Int a) where
// mbind :: FrangeT Int a -> (a -> FrangeT Int b) -> FrangeT Int b
const mbind    = fa => ff => fa.mbind(ff);

// foldr :: (a -> b -> b) -> b -> FrangeT Int a -> b
const foldr = at => m => fa => {
	let r = m;
	for (let i = 0; i < flength(fa); i++) {
		r = at(fat(fa)(i))(r);
	}
	return r;
};

// fcmp :: FrangeT Int a -> FrangeT Int a -> Boolean
const fcmp = fr1 => fr2 => {
	if (fr1 == null) return fr2 == null;
	if (fr2 == null) return false;
	if (fr1 instanceof FrangeT && fr2 instanceof FrangeT) {
		const cmp = t1 => t2 => {
			if (t1 instanceof FrangeT && t2 instanceof FrangeT) {
				return fcmp(t1)(t2);
			} else if (Array.isArray(t1) && Array.isArray(t2)) {
				if (t1.length != t2.length) return false;
				for (let i = 0; i < t1.length; i++) {
					if (!cmp(t1[i])(t2[i])) return false;
				}
				return true;
			} else { 
				return t1 == t2;
			}
		};
		if (fr1.length != fr2.length) return false;
		for (let i = 0; i < fr1.length; i++) {
			if (!cmp(fr1.at(i))(fr2.at(i))) return false;
		}
		return true;
	}	
	throw new Error("* fcmp: not FrangeT instance.");
};

let props = {};
makeValue(props)("fmap"   )(fmap);
makeValue(props)("pure"   )(pure);
makeValue(props)("fapply" )(fapply);
makeGet  (props)("mempty" )(mempty);
makeValue(props)("mappend")(mappend);
makeValue(props)("mconcat")(mconcat);
makeValue(props)("mbind"  )(mbind);
makeValue(props)("foldr"  )(foldr);
defineProps(FrangeT)(props);

module.exports = {
	FrangeT,
	frange,
	flength,
	fat,
	fslide,
	fstretch,
	fcmp
};
