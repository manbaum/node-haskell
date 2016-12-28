
"use strict"

                                                                require("./js/array");
let { $I, $K, $S                                            } = require("./ski");
let { $apply                                                } = require("./apply");
let { $compose                                              } = require("./compose");
let { mbind$, mret$, mbindN$, liftMN$                       } = require("./monad");
let { FArrayT, farray, fcmp                                 } = require("./lib/farray");

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

const pure   = FArrayT.pure;

const fIdentity     = v => fcmp(v.map($I))($I(v));
const fAssociative  = f => g => v => fcmp(v.map($compose(f)(g)))($compose(v => v.map(f))(v => v.map(g))(v));

const fid = fIdentity;
const fas = fAssociative;

const aIdentity     = v => fcmp(pure($I).apply(v))(v);
const aComposition  = u => v => w => fcmp(pure($compose).apply(u).apply(v).apply(w))(u.apply(v.apply(w)));
const aHomomorphism = f => x => fcmp(pure(f).apply(pure(x)))(pure(f(x)));
const aInterchange  = u => y => fcmp(u.apply(pure(y)))(pure(f => f(y)).apply(u));

const aid = aIdentity;
const aco = aComposition;
const aho = aHomomorphism;
const ain = aInterchange;

const mPure        = v => fcmp(v.mappend())() && fcmp()()
const mAssociative = v => fcmp()()

let f1 = farray(3)(3);
let f2 = farray(3)($I);
let f3 = farray(3)(n => x => n + x);
let f4 = farray(3)(n => x => [n, x]);
let f5 = farray(3)(n => x => y => [n + x + y, n * x * y]);

let g1 = x => x + 1;
let g2 = x => x * 8;
let g3 = x => [x + 1, x + 2];

console.log(`        fid(f1): ${fid(f1)}`);
console.log(`        fid(f2): ${fid(f2)}`);
console.log(`fas(g1)(g1)(f1): ${fas(g1)(g1)(f1)}`);
console.log(`fas(g1)(g2)(f1): ${fas(g1)(g2)(f1)}`);
console.log(`fas(g2)(g1)(f1): ${fas(g2)(g1)(f1)}`);
console.log(`fas(g2)(g2)(f1): ${fas(g2)(g2)(f1)}`);
console.log(`fas(g3)(g1)(f1): ${fas(g3)(g1)(f1)}`);
console.log(`fas(g3)(g2)(f1): ${fas(g3)(g2)(f1)}`);
console.log(`fas(g1)(g1)(f2): ${fas(g1)(g1)(f2)}`);
console.log(`fas(g1)(g2)(f2): ${fas(g1)(g2)(f2)}`);
console.log(`fas(g2)(g1)(f2): ${fas(g2)(g1)(f2)}`);
console.log(`fas(g2)(g2)(f2): ${fas(g2)(g2)(f2)}`);
console.log(`fas(g3)(g1)(f2): ${fas(g3)(g1)(f2)}`);
console.log(`fas(g3)(g2)(f2): ${fas(g3)(g2)(f2)}`);

console.log(`        aid(f1): ${aid(f1)}`);
console.log(`        aid(f2): ${aid(f2)}`);
console.log(`aco(f3)(f3)(f1): ${aco(f3)(f3)(f1)}`);
console.log(`aco(f3)(f3)(f2): ${aco(f3)(f3)(f2)}`);
console.log(`aco(f4)(f3)(f1): ${aco(f4)(f3)(f1)}`);
console.log(`aco(f4)(f3)(f2): ${aco(f4)(f3)(f2)}`);
console.log(`aco(f4)(f4)(f1): ${aco(f4)(f4)(f1)}`);
console.log(`aco(f4)(f4)(f2): ${aco(f4)(f4)(f2)}`);
console.log(`     aho(g1)(5): ${aho(g1)(5)}`);
console.log(`     aho(g2)(5): ${aho(g2)(5)}`);
console.log(`     aho(g3)(5): ${aho(g3)(5)}`);
console.log(`     ain(f3)(5): ${ain(f3)(5)}`);
console.log(`     ain(f4)(5): ${ain(f4)(5)}`);

console.log(f1.toArray());
console.log(f2.toArray());
console.dir(Array.from(f5.apply(pure(2)).apply(pure(3)).stretch(9)));
console.dir(Array.from(f4.apply(farray(0)($I)).stretch(3)));


const testFoldr = _ => {
	const foldr = f => m => fa => {
		const rec = i => m => i < fa.length ? rec(i + 1)(f(fa.at(i))(m)) : m;
		return rec(0)(m);
	};
	const $E = m  => x => _ => { throw new Error(m + ": " + String(x)); };
	const at = fr => i => foldr(x => r => k => k == 0 ? x : r(k - 1))($E(`index.out.of.range`)(i))(fr)(i);

	let fr = farray(10)($I).map(x => farray(10)(n => n * x));
	let r4 = at(fr)(4).toArray();
	console.log(r4);
	try {
		let r14 = at(fr)(14);
		console.log(r14);
	} catch (e) {
		console.log(e.message);
	}
}
testFoldr();

const checkTCO = _ => {
	const f = i => { if (i > 5) throw new Error(); else return f(i + 1); };
	try {
		f(0);
	} catch (e) {
		let a = e.stack.split(/\n/);
		return a[2] != a[3];
	}
};
console.log(`TCO is ${checkTCO()}`);

let f6 = f2.slide(3).stretch(15).reverse();
let f7 = f6.changeLength();
f6.show();
f7.show();
