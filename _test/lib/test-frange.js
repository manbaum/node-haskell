
"use strict"

const { FrangeT,
		frange,
		fstart,
		flength,
		freversed,
		fat,
		fmove,
		fslide,
		fstretch,
		fslice,
		freverse,
		ucmp		} = require("../../lib/frange");
const { $S,
		$K,
		$I 			} = require("../../ski");
const { $compose	} = require("../../compose");
const { $apply,
		$rapply		} = require("../../apply");

const pure = FrangeT.pure;

const fIdentity     = v =>           ucmp( v.map($I)                                 )( $I(v)                                     );
const fAssociative  = f => g => v => ucmp( v.map($compose(f)(g))                     )( $compose(v => v.map(f))(v => v.map(g))(v) );

const fid = fIdentity;
const fas = fAssociative;

const aIdentity     = v =>           ucmp( pure($I).apply(v)                         )( v                                         );
const aComposition  = u => v => w => ucmp( pure($compose).apply(u).apply(v).apply(w) )( u.apply(v.apply(w))                       );
const aHomomorphism = f => x =>      ucmp( pure(f).apply(pure(x))                    )( pure(f(x))                                );
const aInterchange  = u => y =>      ucmp( u.apply(pure(y))                          )( pure($rapply(y)).apply(u)                 );

const aid = aIdentity;
const aco = aComposition;
const aho = aHomomorphism;
const ain = aInterchange;

const Test = [
	[	"default constructor.",
		() => {
			const f = new FrangeT();
			return f instanceof FrangeT
				&& f._at       === $I
				&& f._start    === 0
				&& f._length   === Infinity
				&& f._reversed === false;
		}],
	[	"constructor with customized initial values.",
		() => {
			const at     = x => 2 * x + 1,
			      start  = 10,
			      len    = 10,
			      rev    = true,
			      i1	 = 0,
			      i2	 = 2,
			      i3	 = len - 1;
			const f      = new FrangeT(at, start, len, rev);
			return f instanceof FrangeT
				&& f._at       		=== at
				&& f._start    		=== start
				&& f._length   		=== len
				&& f._reversed 		=== rev
				&& f.at(i1)     	=== at(start - i1 - 1)
				&& f.at(i2)     	=== at(start - i2 - 1)
				&& f.at(i3)     	=== at(start - i3 - 1)
				&& f.at(-1)			=== undefined
				&& f.at(len)   		=== undefined;
		}],
	[	"constructor with invalid `start`.",
		() => {
			try {
				const f = new FrangeT($I, 'a');
				return false;
			} catch (e) {
				if (e.message != "* FrangeT: start.need.number") throw e;
			}
			try {
				const f = new FrangeT($I, 1/0);
				return false;
			} catch (e) {
				if (e.message != "* FrangeT: start.need.finity.number") throw e;
			}
			try {
				const f = new FrangeT($I, -1/0);
				return false;
			} catch (e) {
				if (e.message != "* FrangeT: start.need.finity.number") throw e;
			}
			return true;
		}],
	[	"constructor with invalid `length`.",
		() => {
			try {
				const f = new FrangeT($I, 0, 'a');
				return false;
			} catch (e) {
				if (e.message != "* FrangeT: length.need.number") throw e;
			}
			try {
				const f = new FrangeT($I, 0, -1);
				return false;
			} catch (e) {
				if (e.message != "* FrangeT: length.need.positive.number") throw e;
			}
			return true;
		}],
	[	"getter of `start` and `length` and `isReversed`.",
		() => {
			const start = Math.trunc(Math.random() * 10000) * (Math.random() > 0.5 ? 1 : -1),
				  len   = Math.trunc(Math.random() * 10000),
				  rev   = Math.random() > 0.5,
				  f     = new FrangeT($I, start, len, rev);
			return f.start      === start
				&& f.length     === len
				&& f.isReversed === rev;
		}],
	[	"method `toArray()`.",
		() => {
			const f = new FrangeT($I, 10, 10, true),
				  a = f.toArray(),
				  v = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
			return ucmp(a)(v);
		}],
	[	"Law of Functor: Identity.",
		() => {
			const f1 = frange(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = frange(10)(n => frange(n)($I));
			return fid(f1)
				&& fid(f2);
		}],
	[	"Law of Functor: Associative.",
		() => {
			const f1 = frange(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = frange(10)(n => frange(n)($I)),
				  g1 = a => a.map(x => x + 1),
				  g2 = a => a.map(x => x * 2),
				  g3 = a => a.map(x => [x + 1, x + 2]);
			return fas(g1)(g1)(f1)
				&& fas(g1)(g2)(f1)
				&& fas(g2)(g1)(f1)
				&& fas(g2)(g2)(f1)
				&& fas(g3)(g1)(f1)
				&& fas(g3)(g2)(f1)
				&& fas(g1)(g1)(f2)
				&& fas(g1)(g2)(f2)
				&& fas(g2)(g1)(f2)
				&& fas(g2)(g2)(f2)
				&& fas(g3)(g1)(f2)
				&& fas(g3)(g2)(f2);
		}],
	[	"Law of Applicative: Identity.",
		() => {
			const f1 = frange(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = frange(10)(n => frange(n)($I));
			return aid(f1)
				&& aid(f2);
		}],
	[	"Law of Applicative: Composition.",
		() => {
			const f1 = frange(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = frange(10)(n => frange(n)($I)),
				  g1 = frange(3)($K(a => a.map(x => x + 1))),
				  g2 = frange(3)($K(a => a.map(x => x * 2))),
				  g3 = frange(3)($K(a => a.map(x => [x + 1, x + 2])));
			return aco(g1)(g1)(f1)
				&& aco(g1)(g2)(f1)
				&& aco(g2)(g1)(f1)
				&& aco(g2)(g2)(f1)
				&& aco(g3)(g1)(f1)
				&& aco(g3)(g2)(f1)
				&& aco(g1)(g1)(f2)
				&& aco(g1)(g2)(f2)
				&& aco(g2)(g1)(f2)
				&& aco(g2)(g2)(f2)
				&& aco(g3)(g1)(f2)
				&& aco(g3)(g2)(f2);
		}],
	[	"Law of Applicative: Homomorphism.",
		() => {
			const n  = [ 1, -2, 3, Math.trunc(Math.random() * 10000) ],
				  g1 = a => a.map(x => x + 1),
				  g2 = a => a.map(x => x * 2),
				  g3 = a => a.map(x => [x + 1, x + 2]);
			return aho(g1)(n)
				&& aho(g2)(n)
				&& aho(g3)(n);
		}],
	[	"Law of Applicative: Interchange.",
		() => {
			const n  = [ 1, -2, 3, Math.trunc(Math.random() * 10000) ],
				  g1 = frange(3)($K(a => a.map(x => x + 1))),
				  g2 = frange(3)($K(a => a.map(x => x * 2))),
				  g3 = frange(3)($K(a => a.map(x => [x + 1, x + 2])));
			return ain(g1)(n)
				&& ain(g2)(n)
				&& ain(g3)(n);
		}],
	[	"",
		() => {

		}],
	[	"",
		() => {

		}],
	[	"",
		() => {

		}],
	[	"",
		() => {

		}],
	[	"",
		() => {

		}],
	[	"",
		() => {

		}],
];

const runTest = (T) => {
	T.forEach(([description, test]) => {
		if (description) {
			let result, ex;
			try {
				result = test();
			} catch (e) {
				result = false;
				ex     = e;
			}
			printResult(description, result, ex);
		}
	});
};
const printResult = (desc, result, e) => {
	const s = result ? "  Ok" : "Fail";
	console.log(`${s} : ${desc}`);
	if (e) {
		const s = e.stack.split(/\n/).slice(0, 4).map(s => "       " + s).join("\n");
		console.log(s);
	}
};

runTest(Test);
