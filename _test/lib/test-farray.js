
"use strict"

const { FArrayT,
		farray,
		fstart,
		flength,
		freversed,
		fat,
		fmove,
		fslide,
		fstretch,
		fslice,
		freverse,
		ucmp		} = require("../../lib/farray");
const { $S,
		$K,
		$I 			} = require("../../ski");
const { $compose	} = require("../../compose");
const { $apply,
		$rapply		} = require("../../apply");

const pure            = FArrayT.pure;

const fIdentity       = v =>           ucmp( v.map($I)                                 )( $I(v)                                     );
const fAssociative    = f => g => v => ucmp( v.map($compose(f)(g))                     )( $compose(v => v.map(f))(v => v.map(g))(v) );

const fid             = fIdentity;
const fas             = fAssociative;

const aIdentity       = v =>           ucmp( pure($I).apply(v)                         )( v                                         );
const aComposition    = u => v => w => ucmp( pure($compose).apply(u).apply(v).apply(w) )( u.apply(v.apply(w))                       );
const aHomomorphism   = f => x =>      ucmp( pure(f).apply(pure(x))                    )( pure(f(x))                                );
const aInterchange    = u => y =>      ucmp( u.apply(pure(y))                          )( pure($rapply(y)).apply(u)                 );

const aid             = aIdentity;
const aco             = aComposition;
const aho             = aHomomorphism;
const ain             = aInterchange;

const mempty          = FArrayT.mempty;

const oLIdentity      = v =>           ucmp( mempty.concat(v)                          )( v                                         );
const oRIdentity      = v =>           ucmp( v.concat(mempty)                          )( v                                         );
const oCommutative    = u => v => w => ucmp( u.concat(v).concat(w)                     )( u.concat(v.concat(w))                     );

const oli             = oLIdentity;
const ori             = oRIdentity;
const oco             = oCommutative;

const mLIdentity      = v => f =>      ucmp( pure(v).mbind(f)                          )( f(v)                                      );
const mRIdentity      = v =>           ucmp( v.mbind(pure)                             )( v                                         );
const mCommutative    = u => v => w => ucmp( u.mbind(x => v(x).mbind(w))               )( u.mbind(v).mbind(w)                       );

const mli             = mLIdentity;
const mri             = mRIdentity;
const mco             = mCommutative;

const Test            = [
	[	"default constructor.",
		() => {
			const f = new FArrayT();
			return f instanceof FArrayT
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
			const f      = new FArrayT(at, start, len, rev);
			return f instanceof FArrayT
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
				const f = new FArrayT($I, 'a');
				return false;
			} catch (e) {
				if (e.message != "* FArrayT: start.need.number") throw e;
			}
			try {
				const f = new FArrayT($I, 1/0);
				return false;
			} catch (e) {
				if (e.message != "* FArrayT: start.need.finity.number") throw e;
			}
			try {
				const f = new FArrayT($I, -1/0);
				return false;
			} catch (e) {
				if (e.message != "* FArrayT: start.need.finity.number") throw e;
			}
			return true;
		}],
	[	"constructor with invalid `length`.",
		() => {
			try {
				const f = new FArrayT($I, 0, 'a');
				return false;
			} catch (e) {
				if (e.message != "* FArrayT: length.need.number") throw e;
			}
			try {
				const f = new FArrayT($I, 0, -1);
				return false;
			} catch (e) {
				if (e.message != "* FArrayT: length.need.positive.number") throw e;
			}
			return true;
		}],
	[	"getter of `start` and `length` and `isReversed`.",
		() => {
			const start = Math.trunc(Math.random() * 10000) * (Math.random() > 0.5 ? 1 : -1),
				  len   = Math.trunc(Math.random() * 10000),
				  rev   = Math.random() > 0.5,
				  f     = new FArrayT($I, start, len, rev);
			return f.start      === start
				&& f.length     === len
				&& f.isReversed === rev;
		}],
	[	"method `toArray()`.",
		() => {
			const f = new FArrayT($I, 10, 10, true),
				  a = f.toArray(),
				  v = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
			return ucmp(a)(v);
		}],
	[	"Law of Functor: Identity.",
		() => {
			const f1 = farray(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = farray(10)(n => farray(n)($I));
			return fid(f1)
				&& fid(f2);
		}],
	[	"Law of Functor: Associative.",
		() => {
			const f1 = farray(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = farray(10)(n => farray(n)($I)),
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
			const f1 = farray(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = farray(10)(n => farray(n)($I));
			return aid(f1)
				&& aid(f2);
		}],
	[	"Law of Applicative: Composition.",
		() => {
			const f1 = farray(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = farray(10)(n => farray(n)($I)),
				  g1 = farray(3)($K(a => a.map(x => x + 1))),
				  g2 = farray(3)($K(a => a.map(x => x * 2))),
				  g3 = farray(3)($K(a => a.map(x => [x + 1, x + 2])));
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
				  g1 = farray(3)($K(a => a.map(x => x + 1))),
				  g2 = farray(3)($K(a => a.map(x => x * 2))),
				  g3 = farray(3)($K(a => a.map(x => [x + 1, x + 2])));
			return ain(g1)(n)
				&& ain(g2)(n)
				&& ain(g3)(n);
		}],
	[	"Law of Monoid: Left Identity",
		() => {
			const f1 = farray(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = farray(10)(n => farray(n)($I));
			return oli(f1)
				&& oli(f2);
		}],
	[	"Law of Monoid: Right Identity",
		() => {
			const f1 = farray(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = farray(10)(n => farray(n)($I));
			return ori(f1)
				&& ori(f2);
		}],
	[	"Law of Monoid: Commutative",
		() => {
			const f1 = farray(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = farray(10)(n => farray(n)($I)),
				  f3 = farray(10)(n => n + 1);
			return oco(f1)(f1)(f1)
				&& oco(f1)(f1)(f2)
				&& oco(f1)(f1)(f3)
				&& oco(f1)(f2)(f1)
				&& oco(f1)(f2)(f2)
				&& oco(f1)(f2)(f3)
				&& oco(f1)(f3)(f1)
				&& oco(f1)(f3)(f2)
				&& oco(f1)(f3)(f3)
				&& oco(f2)(f1)(f1)
				&& oco(f2)(f1)(f2)
				&& oco(f2)(f1)(f3)
				&& oco(f2)(f2)(f1)
				&& oco(f2)(f2)(f2)
				&& oco(f2)(f2)(f3)
				&& oco(f2)(f3)(f1)
				&& oco(f2)(f3)(f2)
				&& oco(f2)(f3)(f3)
				&& oco(f3)(f1)(f1)
				&& oco(f3)(f1)(f2)
				&& oco(f3)(f1)(f3)
				&& oco(f3)(f2)(f1)
				&& oco(f3)(f2)(f2)
				&& oco(f3)(f2)(f3)
				&& oco(f3)(f3)(f1)
				&& oco(f3)(f3)(f2)
				&& oco(f3)(f3)(f3);
		}],
	[	"Law of Monad: Left Ideintity",
		() => {
			const n  = [ 1, -2, 3, Math.trunc(Math.random() * 10000) ],
				  g1 = a => a.map(x => farray(3)($K(x * 2))),
				  g2 = a => a.map(x => farray(3)($K([x + 1, x + 2])));
			return mli(n)(g1)
				&& mli(n)(g2);
		}],
	[	"Law of Monad: Right Identity",
		() => {
			const f1 = farray(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = farray(10)(n => farray(n)($I));
			return mri(f1)
				&& mri(f2);
		}],
	[	"Law of Monad: Commutative",
		() => {
			const f1 = farray(10)(n => [2 * n - 1, 2 * n, 2 * n + 1]),
				  f2 = farray(10)(n => farray(n)($I)),
				  g1 = a => farray(3)(a.map(x => x * 2)),
				  g2 = a => farray(3)(a.map(x => x + 2));
			return mco(f1)(g1)(g1)
				&& mco(f1)(g2)(g2)
				&& mco(f2)(g1)(g1)
				&& mco(f2)(g2)(g2)
				&& mco(f1)(g1)(g2)
				&& mco(f1)(g2)(g1)
				&& mco(f2)(g1)(g2)
				&& mco(f2)(g2)(g1);
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

const runTest         = (T) => {
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
const printResult     = (desc, result, e) => {
	const s = result ? "  Ok" : "Fail";
	console.log(`${s} : ${desc}`);
	if (e) {
		const s = e.stack.split(/\n/).slice(0, 4).map(s => "       " + s).join("\n");
		console.log(s);
	}
};

runTest(Test);
