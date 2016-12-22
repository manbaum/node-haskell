
"use strict"

                                                                require("./js/array");
let { $I, $K, $S                                            } = require("./ski");
let { $apply                                                } = require("./apply");
let { $compose                                              } = require("./compose");
let { mbind$, mret$, mbindN$, liftMN$                       } = require("./monad");
let { FrangeT, frange, flength, fat, fslice, fstretch, fcmp } = require("./lib/frange");

let f    = x => y => z => w => [x(y), x(z), x(w)];
let y1 = mbindN$(Array)(4)(f)([x => 2 * x])([11,12])([21,22])([31,32,33]);
let y2 = liftMN$(Array)(4)(f)([x => 2 * x])([11,12])([21,22])([31,32,33]);
console.log(JSON.stringify(y1));
console.log(JSON.stringify(y2));

const T = class {
	* g() {
		while(true) yield 1;
	}
	get array() {
		return Array.from(this.g());
	}
};

const take = n => g => function*() {
	for (let i = 0; i < n; i++) {
		const v = g.next();
		if (v.done) break; else yield v.value;
	}
};

let t = new T;
let t5 = Array.from(take(5)(t.g())());
console.log(JSON.stringify(t5));

const pure   = FrangeT.pure;
const fapply = FrangeT.fapply;
const ftake  = FrangeT.ftake;

const tIdentity     = v => fcmp(fapply(pure($I))(v))(v);
const tComposition = u => v => w => fcmp(fapply(fapply(fapply(pure($compose))(u))(v))(w))(fapply(u)(fapply(v)(w)));
const tHomomorphism = f => x => fcmp(fapply(pure(f))(pure(x)))(pure(f(x)));
const tInterchange  = u => y => fcmp(fapply(u)(pure(y)))(fapply(pure(f=>f(y)))(u));

const tid = tIdentity;
const tco = tComposition;
const tho = tHomomorphism;
const tin = tInterchange;

let f1 = frange(3)(3);
let f2 = frange(3)($I);
let f3 = frange(1)(n => x => n + x);
let f4 = frange(1)(n => x => [n, x]);
let f5 = frange(1)(n => x => y => [n + x + y, n * x * y]);
