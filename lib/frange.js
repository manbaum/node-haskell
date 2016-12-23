
"use strict"

const { makeGet, makeValue, defineProps } = require("../langutil");
const { $S, $K, $I                      } = require("../ski");
const { $compose                        } = require("../compose");

const FrangeT = class {
	constructor(n, f) {
		this._n = n >= 0 ? Math.trunc(n) : 0;
		this._f = typeof f === "function" ? f : $K(f);
	}
	get length() {
		return this._n;
	}
	at(i) {
		const ni = Math.trunc(i);
		return ni >= 0 && ni < this._n ? this._f(ni) : undefined;
	}
	slide(m) {
		const nm = Math.trunc(m);
		if (nm == 0) return this;
		else {
			const g = i => {
				const ni = Math.trunc(i);
				return ni >= 0 && ni < this._n ? this._f(ni + m) : undefined;
			}
			return new FrangeT(this._n, g);
		}
	}
	stretch(m) {
		const nm = Math.trunc(m);
		return nm == 0 || nm < 0 && this._n == 0 ? this : new FrangeT(this._n + nm, this._f);
	}
	take(m) {
		const nm = Math.trunc(m);
		return nm >= this._n ? this : new FrangeT(nm, this._f);
	}
	forEach(f) {
		for (let i = 0; i < this._n; i++) {
			f(this._f(i), i, this);
		}
		return this;
	}
	reduce(f, m) {
		let r = m;
		this.forEach((v, i) => r = f(r, v, i, this));
		return r;
	}
	*[Symbol.iterator]() {
		for (let i = 0; i < this._n; i++) {
			yield this._f(i);
		}
	}
	array() {
		const r = [];
		this.forEach(v => r.push(v));
		return r;
	}
	map(...args) {
		return args.reduce((fr, f) => {
			if (f != $I) {
				const g  = i => {
					const ni = Math.trunc(i);
					return ni >= 0 && ni < fr._n ? f(fr._f(ni)) : undefined;
				};
				return new FrangeT(fr._n, g);
			} else {
				return fr;
			}
		}, this);
	}
	apply(...args) {
		return args.reduce((fr, fa) => {
			if (fa._n == 0) return new FrangeT(0, $S(fr._f)(fa._f));
			const n = fr._n * fa._n;
			const g = i => {
				const ni = Math.trunc(i);
				const ai =             ni       % fa.length;
				const fi = Math.trunc((ni - ai) / fa.length);
				return fr._f(fi)(fa._f(ai));
			};
			return new FrangeT(n, g);
		}, this);
	}
	concat(...args) {
		return args.reduce((fr, fa) => {
			if (fa._n > 0) {
				const n = fr.length + fa.length;
				const g = i => {
					const ni = Math.trunc(i);
					if (ni < 0) {
					} else if (ni < fr._n) {
						return fr._f(ni);
					} else if (ni < fr._n + fa._n) {
						return fa._f(ni - fr._n);
					}
				};
				return new FrangeT(n, g);
			} else {
				return fr;
			}
		}, this);
	}
	collapse() {
		let fr = null;
		this.forEach(fa => fr = fr ? fr.concat(fa) : fa);
		return fr;
	}
	mbind(...args) {
		const brec = (fr, fs) => fs.length > 0 ? brec(fr.map(fs[0]).collapse(), fs.slice(1)) : fr;
		return brec(this, args);
	}
};
// frange :: Int -> (Int -> a) -> FrangeT Int a
const frange = n => f => new FrangeT(n, f);
// flength :: FrangeT Int a -> Int
const flength = fr => fr._n;
// fat :: FrangeT Int a -> Int -> a
const fat = fr => i => {
	const ni = Math.trunc(i);
	return ni >= 0 && ni < fr._n ? fr._f(ni) : undefined;
};
// fslide :: FrangeT Int a -> Int -> FrangeT Int a
const fslide = fr => m => {
	const nm = Math.trunc(m);
	if (nm == 0) return fr;
	else {
		const g = i => {
			const ni = Math.trunc(i);
			return ni >= 0 && ni < fr._n ? fr._f(ni + m) : undefined;
		}
		return frange(fr._n)(g);
	}
};
// fstretch :: FrangeT Int a -> Int -> FrangeT Int a
const fstretch = fr => m => {
	const nm = Math.trunc(m);
	return nm == 0 || nm < 0 && fr._n == 0 ? fr : frange(fr._n + nm)(fr._f);
};
// ftake :: FrangeT Int a -> Int -> FrangeT Int a
const ftake = fr => m => {
	const nm = Math.trunc(m);
	return nm >= fr._n ? fr : frange(nm)(fr._f);
};

// fmap :: (a -> b) -> FrangeT Int a -> FrangeT Int b
const fmap   = f => fa => {
	const g  = i => {
		const ni = Math.trunc(i);
		return ni >= 0 && ni < fa._n ? f(fa._f(ni)) : undefined;
	};
	return frange(fa.length)(g);
};
// pure :: a -> FrangeT Int a
const pure   = a => frange(1)($K(a));
// fapply :: FrangeT Int (a -> b) -> FrangeT Int a -> FrangeT Int b
const fapply = ff => fa => {
	if (fa._n == 0) return frange(0)($S(ff._f)(fa._f));

	const n = ff._n * fa._n;
	const g = i => {
		const ni = Math.trunc(i);
		const ai =             ni       % fa.length;
		const fi = Math.trunc((ni - ai) / fa.length);
		return ff._f(fi)(fa._f(ai));
	};
	return frange(n)(g);
};

// mempty :: FrangeT Int a
const mempty = a => frange(0)($K(a));
// mappend :: FrangeT Int a -> FrangeT Int a -> FrangeT Int a
const mappend = M => fa => fb => {
	const n = fa.length + fb.length;
	const g = i => {
		const ni = Math.trunc(i);
		if (ni < 0) {
		} else if (ni < fa._n) {
			return fa._f(ni);
		} else if (ni < fa._n + fb._n) {
			return fb._f(ni - fa._n);
		}
	};
	return frange(n)(g);
};
// fmappend :: FrangeT Int (FrangeT Int a) = FrangeT Int a
const mconcat = fs => {
	const n = foldr(fr => m => m + fr._n)(0)(fs);
	const len = fs.length;
	const g = i => {
		const ni = Math.trunc(i);
		if (ni >= 0) {
			let si = 0, ri = ni;
			while (si < len) {
				const sn = fs.at(si).length;
				if (ri < sn) break;
				else {
					si += 1;
					ri -= sn;
				}
			}
			if (si < len) {
				return fs.at(si).at(ri);
			}
		}
	};
	return frange(n)(g);
};

// instance Monad (FrangeT Int a) where
// mbind :: FrangeT Int a -> (a -> FrangeT Int b) -> FrangeT Int b
const mbind = fa => ff => mconcat(fmap(ff)(fa));

// foldr :: (a -> b -> b) -> b -> FrangeT Int a -> b
const foldr = f => m => fa => {
	let r = m;
	for (let i = 0; i < flength(fa); i++) {
		r = f(fat(fa)(i))(r);
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
