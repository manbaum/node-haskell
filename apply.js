
"use strict"

// $apply  :: (x -> t) -> x -> t
const $apply  = (f) => x => f(x);
// $apply2 :: (a -> t, x -> a) -> x -> t
const $apply2 = (f, g) => x => f(g(x));
// $apply3 :: (a -> t, b -> a, x -> b) -> x -> t
const $apply3 = (f, g, h) => x => f(g(h(x)));
// $apply4 :: (a -> t, b -> a, c -> b, x -> c) -> x -> t
const $apply4 = (f, g, h, s) => x => f(g(h(s(x))));
// $apply5 :: (a -> t, b -> a, c -> b, d -> c, x -> d) -> x -> t
const $apply5 = (f, g, h, s, t) => x => f(g(h(s(t(x)))));
// $apply6 :: (a -> t, b -> a, c -> b, d -> c, e -> d, x -> e) -> x -> t
const $apply6 = (f, g, h, s, t, u) => x => f(g(h(s(t(u(x))))));
// $apply7 :: (a -> t, b -> a, c -> b, d -> c, e -> d, r -> e, x -> r) -> x -> t
const $apply7 = (f, g, h, s, t, u, v) => x => f(g(h(s(t(u(v(x)))))));
// $apply8 :: (a -> t, b -> a, c -> b, d -> c, e -> d, r -> e, s -> r, x -> s) -> x -> t
const $apply8 = (f, g, h, s, t, u, v, w) => x => f(g(h(s(t(u(v(w(x))))))));
// $applyN :: (xn -> t, ..., x2 -> x3, x1 -> x2) -> x1 -> t
const $apply_ = (...args) => x => {
	let m = args.length;
	while (m-- > 0) {
		x = args[m](x);
	}
	return x;
};

// $rapply  :: x -> (x -> t) -> t
const $rapply  = x => (f) => f(x);
// $rapply2 :: x -> (x -> a, a -> t) -> t
const $rapply2 = x => (g, f) => f(g(x));
// $rapply3 :: x -> (x -> b, b -> a, a -> t) -> t
const $rapply3 = x => (h, g, f) => f(g(h(x)));
// $rapply4 :: x -> (x -> c, c -> b, b -> a, a -> t) -> t
const $rapply4 = x => (s, h, g, f) => f(g(h(s(x))));
// $rapply5 :: x -> (x -> d, d -> c, c -> b, b -> a, a -> t) -> t
const $rapply5 = x => (t, s, h, g, f) => f(g(h(s(t(x)))));
// $rapply6 :: x -> (x -> e, e -> d, d -> c, c -> b, b -> a, a -> t) -> t
const $rapply6 = x => (u, t, s, h, g, f) => f(g(h(s(t(u(x))))));
// $rapply7 :: x -> (x -> r, r -> e, e -> d, d -> c, c -> b, b -> a, a -> t) -> t
const $rapply7 = x => (v, u, t, s, h, g, f) => f(g(h(s(t(u(v(x)))))));
// $rapply8 :: x -> (x -> s, s -> r, r -> e, e -> d, d -> c, c -> b, b -> a, a -> t) -> t
const $rapply8 = x => (w, v, u, t, s, h, g, f) => f(g(h(s(t(u(v(w(x))))))));
// $rapplyN :: x1 -> (x1 -> x2, x2 -> x3, ..., xn -> t) = t
const $rapply_ = x => (...args) => {
	const m = args.length;
	let i = 0;
	while (i < m) {
		x = args[i++](x);
	}
	return x;
};

module.exports = {
	$apply,  $apply2,  $apply3,  $apply4,  $apply5,  $apply6,  $apply7,  $apply8,  $apply_,
	$rapply, $rapply2, $rapply3, $rapply4, $rapply5, $rapply6, $rapply7, $rapply8, $rapply_
};
