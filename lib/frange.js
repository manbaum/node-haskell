
"use strict"

const { $S, $K, $I          } = require("../ski");
const { $compose, $compose3 } = require("../compose");

const FRangeT = class {
	constructor(n, f) {
		this._n = n >= 0 ? Math.trunc(n) : 0;
		this._f = typeof f === "function" ? f : _ => f;
	}
	valid(i) {
		return i >= 0 && i < this._n;
	}
	at(i) {
		return this.valid(i) ? this._f(i) : undefined;
	}
	toArray() {
		const r = [];
		for (let i = 0; i < this._n; i++) {
			r.push(this._f(i));
		}
		return r;
	}
};
const frange = n => f => new FRangeT(n, f);

// fmap :: (a -> b) -> f a -> f b
FRangeT.fmap   = f => fa => frange(fa._n)(i => fa.valid(i) ? f(fa.at(i)) : undefined);

// pure :: a -> f a
FRangeT.pure   = a => frange(1)(a);
// fapply :: f (a -> b) -> f a -> f b
FRangeT.fapply = ff => fa => {
	const n = ff._n * fa._n;
	const f = i => {
		const ai = i        % fa._n;
		const fi = (i - ai) / fa._n;

		const vf = ff.at(fi), tvf = typeof vf;
		if (tvf === "function") {
			return vf(fa.at(ai));
		} else if (tvf === "number") {
			return fa._f(Math.trunc(vf) + ai);
		} else {
			return [vf, fa];
		}
	};
	return frange(n)(f);
};

const cmp = f1 => f2 => f1._n == f2._n && ((a1, a2) => { for(let i = 0; i < f1._n; i++) { if (a1[i] != a2[i]) return false; }; return true; })(f1.toArray(), f2.toArray());

const pure = FRangeT.pure;
const fapply = FRangeT.fapply;

const t1 = v => cmp(fapply(pure($I))(v))(v);
const t2 = u => v => w => cmp(fapply(fapply(u)(v))(w))(fapply(u)(fapply(v)(w)));
const t2c = u => v => w => cmp(fapply(fapply(fapply($compose)(u))(v))(w))(fapply(u)(fapply(v)(w)));
const t3 = f => x => cmp(fapply(pure(f))(pure(x)))(pure(f(x)));
const t4 = u => y => cmp(fapply(u)(pure(y)))(fapply(f=>f(y))(u));

let f1 = frange(3)(3);
let f2 = frange(3)($I);
let f3 = frange(3)(n => x => n + x);
let f4 = frange(3)(n => x => [n, x]);

cmp(fapply(fapply(fapply(f1)(f2))(f3))(f1))(fapply(fapply(f1)(fapply(f2)(f3)))(f1));
