
"use strict"

// $flip :: (a -> b -> t) -> b -> a -> t
const $flip = f => a => b => f(b)(a);
// $flip3 :: (a -> b -> c -> t) -> a -> c -> b -> t
const $flip3 = f => a => b => c => f(a)(c)(b);
// $flip4 :: (a -> b -> c -> d -> t) -> a -> b -> d -> c -> t
const $flip4 = f => a => b => c => d => f(a)(b)(d)(c);
// $flip5 :: (a -> b -> c -> d -> e -> t) -> a -> b -> c -> e -> d -> t
const $flip5 = f => a => b => c => d => e => f(a)(b)(c)(e)(d);
// $flip6 :: (a -> b -> c -> d -> e -> x -> t) -> a -> b -> c -> d -> x -> e -> t
const $flip6 = f => a => b => c => d => e => x => f(a)(b)(c)(d)(x)(e);
// $flip7 :: (a -> b -> c -> d -> e -> x -> y -> t) -> a -> b -> c -> d -> e -> y -> x -> t
const $flip7 = f => a => b => c => d => e => x => y => f(a)(b)(c)(d)(e)(y)(x);
// $flip8 :: (a -> b -> c -> d -> e -> x -> y -> z -> t) -> a -> b -> c -> d -> e -> x -> z -> y -> t
const $flip8 = f => a => b => c => d => e => x => y => z => f(a)(b)(c)(d)(e)(x)(z)(y);
// $flipN :: n -> (xn -> ... -> x2 -> x1 -> t) -> xn -> ... -> x1 -> x2 -> t
const $flipN = n => {
	const m = Math.trunc(n);
	if (isNaN(m) || m < 2) throw new Error("illegal.args.on.$flipN");
	const flipRec = i => f => x => i < m - 2 ? flipRec(i + 1)(f(x)) : $flip(f)(x);
	return flipRec(0);
};

module.exports = { $flip, $flip3, $flip4, $flip5, $flip6, $flip7, $flip8, $flipN };