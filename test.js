
"use strict"

                        require("./js/array");
const { $I,
	 	$K,
		$S			} = require("./ski");
const { $apply,
		$rapply		} = require("./apply");
const { $compose	} = require("./compose");
const { mbind$,
		mret$,
		mbindN$,
		liftMN$		} = require("./monad");
const { FArrayT,
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
		ucmp		} = require("./lib/farray");

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

let f1 = farray(3)(3);
let f2 = farray(3)($I);
let f3 = farray(3)(n => x => n + x);
let f4 = farray(3)(n => x => [n, x]);
let f5 = farray(3)(n => x => y => [n + x + y, n * x * y]);

let g1 = x => x + 1;
let g2 = x => x * 8;
let g3 = x => [x + 1, x + 2];

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
