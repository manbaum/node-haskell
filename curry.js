
"use strict"

// $curry :: ((a, b) -> t) -> a -> b -> t
const $curry  = f => a => b => f(a, b);
// $curry3 :: ((a, b, c) -> t) -> a -> b -> c -> t
const $curry3 = f => a => b => c => f(a, b, c);
// $curry4 :: ((a, b, c, d) -> t) -> a -> b -> c -> d -> t
const $curry4 = f => a => b => c => d => f(a, b, c, d);
// $curry5 :: ((a, b, c, d, e) -> t) -> a -> b -> c -> d -> e -> t
const $curry5 = f => a => b => c => d => e => f(a, b, c, d, e);
// $curry6 :: ((a, b, c, d, e, x) -> t) -> a -> b -> c -> d -> e -> x -> t
const $curry6 = f => a => b => c => d => e => x => f(a, b, c, d, e, x);
// $curry7 :: ((a, b, c, d, e, x, y) -> t) -> a -> b -> c -> d -> e -> x -> y -> t
const $curry7 = f => a => b => c => d => e => x => y => f(a, b, c, d, e, x, y);
// $curry8 :: ((a, b, c, d, e, x, y, z) -> t) -> a -> b -> c -> d -> e -> x -> y -> z -> t
const $curry8 = f => a => b => c => d => e => x => y => z => f(a, b, c, d, e, x, y, z);
// $curryN :: n -> ((x1, x2, ..., xn) -> t) -> x1 -> x2 -> ... -> xn -> t
const $curryN = n => {
	const m = Math.trunc(n);
	if (isNaN(m) || m < 0) throw new Error("illegal.args.on.$curryN");
	return f => {
		const curryRec = args => x => {
			const nargs = args.concat([x]);
			return nargs.length >= m ? f.apply(null, nargs) : curryRec(nargs);
		};
		return m > 0 ? curryRec([]) : f;
	};
};

const $rcurryN = n => {
	const m = Math.trunc(n);
	if (isNaN(m) || m < 0) throw new Error("illegal.args.on.$curryN");
	return f => {
		const curryRec = args => x => {
			const nargs = [x].concat(args);
			return nargs.length >= m ? f.apply(null, nargs) : curryRec(nargs);
		};
		return m > 0 ? curryRec([]) : f;
	};
};


// $uncurry :: (a -> b -> t) -> (a, b) -> t
const $uncurry  = f => (a, b) => f(a)(b);
// $uncurry3 :: (a -> b -> c -> t) -> (a, b, c) -> t
const $uncurry3 = f => (a, b, c) => f(a)(b)(c);
// $uncurry4 :: (a -> b -> c -> d -> t) -> (a, b, c, d) -> t
const $uncurry4 = f => (a, b, c, d) => f(a)(b)(c)(d);
// $uncurry5 :: (a -> b -> c -> d -> e -> t) -> (a, b, c, d, e) -> t
const $uncurry5 = f => (a, b, c, d, e) => f(a)(b)(c)(d)(e);
// $uncurry6 :: (a -> b -> c -> d -> e -> x -> t) -> (a, b, c, d, e, x) -> t
const $uncurry6 = f => (a, b, c, d, e, x) => f(a)(b)(c)(d)(e)(x);
// $uncurry7 :: (a -> b -> c -> d -> e -> x -> y -> t) -> (a, b, c, d, e, x, y) -> t
const $uncurry7 = f => (a, b, c, d, e, x, y) => f(a)(b)(c)(d)(e)(x)(y);
// $uncurry8 :: (a -> b -> c -> d -> e -> x -> y -> z -> t) -> (a, b, c, d, e, x, y, z) -> t
const $uncurry8 = f => (a, b, c, d, e, x, y, z) => f(a)(b)(c)(d)(e)(x)(y)(z);
// $uncurryN :: n -> (x1 -> x2 -> ... -> xn -> t) -> (x1, x2, ..., xn) -> t
const $uncurryN = n => {
	const m = Math.trunc(n);
	if (isNaN(m) || m < 0) throw new Error("illegal.args.on.$uncurryN");
	return f => {
		const uncurry = (...args) => {
			const l = args.length;
			let i = 0;
			if (l > 0) {
				while (i < l) {
					f = f(args[i++]);
				}
			}
			while (i < m) {
				i++;
				f = f();
			}
			return f;
		};
		return m > 0 ? uncurry : f;
	};
};
// $uncurry_ :: (x1 -> x2 -> ... -> xn -> t) -> (x1, x2, ..., xn) -> t
const $uncurry_ = f => (...args) => {
	const l = args.length;
	let i = 0;
	while (i < l) {
		f = f(args[i++]);
	}
	return f;
};

module.exports = {
	  $curry,   $curry3,   $curry4,   $curry5,   $curry6,   $curry7,   $curry8,   $curryN,
	  $rcurryN,
	$uncurry, $uncurry3, $uncurry4, $uncurry5, $uncurry6, $uncurry7, $uncurry8, $uncurryN, $uncurry_
};
