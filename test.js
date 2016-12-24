
"use strict"

                                                                require("./js/array");
let { $I, $K, $S                                            } = require("./ski");
let { $apply                                                } = require("./apply");
let { $compose                                              } = require("./compose");
let { mbind$, mret$, mbindN$, liftMN$                       } = require("./monad");
let { FrangeT, frange, fcmp                                 } = require("./lib/frange");

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

const tIdentity     = v => fcmp(pure($I).apply(v))(v);
const tComposition = u => v => w => fcmp(pure($compose).apply(u).apply(v).apply(w))(u.apply(v.apply(w)));
const tHomomorphism = f => x => fcmp(pure(f).apply(pure(x)))(pure(f(x)));
const tInterchange  = u => y => fcmp(u.apply(pure(y)))(pure(f => f(y)).apply(u));

const tid = tIdentity;
const tco = tComposition;
const tho = tHomomorphism;
const tin = tInterchange;

let f1 = frange(3)(3);
let f2 = frange(3)($I);
let f3 = frange(1)(n => x => n + x);
let f4 = frange(1)(n => x => [n, x]);
let f5 = frange(1)(n => x => y => [n + x + y, n * x * y]);

console.log(`                    tid(f1): ${tid(f1)}`);
console.log(`                    tid(f2): ${tid(f2)}`);
console.log(`            tco(f3)(f3)(f1): ${tco(f3)(f3)(f1)}`);
console.log(`            tco(f3)(f3)(f2): ${tco(f3)(f3)(f2)}`);
console.log(`            tco(f4)(f3)(f1): ${tco(f4)(f3)(f1)}`);
console.log(`            tco(f4)(f3)(f2): ${tco(f4)(f3)(f2)}`);
console.log(`            tco(f4)(f4)(f1): ${tco(f4)(f4)(f1)}`);
console.log(`            tco(f4)(f4)(f2): ${tco(f4)(f4)(f2)}`);
console.log(`tho(x => [x + 1, x * 2])(5): ${tho(x => [x + 1, x * 2])(5)}`);
console.log(`                 tin(f3)(5): ${tin(f3)(5)}`);
console.log(`                 tin(f4)(5): ${tin(f4)(5)}`);

console.log(f1.toArray());
console.log(f2.toArray());
console.dir(Array.from(f5.apply(pure(2)).apply(pure(3)).stretch(9)));
console.dir(Array.from(f4.apply(frange(0)($I)).stretch(3)));
