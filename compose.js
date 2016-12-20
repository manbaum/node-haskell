
"use strict"

const { $curryN } = require("./curry");
const { $apply_ } = require("./apply");

// $compose :: (a -> t) -> (x -> a) -> x -> t
const $compose  = f => g => x => f(g(x));
// $compose3 :: (a -> t) -> (b -> a) -> (x -> b) -> x -> t
const $compose3 = f => g => h => x => f(g(h(x)));
// $compose4 :: (a -> t) -> (b -> a) -> (c -> b) -> (x -> c) -> x -> t
const $compose4 = f => g => h => s => x => f(g(h(s(x))));
// $compose5 :: (a -> t) -> (b -> a) -> (c -> b) -> (d -> c) -> (x -> d) -> x -> t
const $compose5 = f => g => h => s => t => x => f(g(h(s(t(x)))));
// $compose6 :: (a -> t) -> (b -> a) -> (c -> b) -> (d -> c) -> (e -> d) -> (x -> e) -> x -> t
const $compose6 = f => g => h => s => t => u => x => f(g(h(s(t(u(x))))));
// $compose7 :: (a -> t) -> (b -> a) -> (c -> b) -> (d -> c) -> (e -> d) -> (r -> e) -> (x -> r) -> x -> t
const $compose7 = f => g => h => s => t => u => v => x => f(g(h(s(t(u(v(x)))))));
// $compose8 :: (a -> t) -> (b -> a) -> (c -> b) -> (d -> c) -> (e -> d) -> (r -> e) -> (s -> r) -> (x -> s) -> x -> t
const $compose8 = f => g => h => s => t => u => v => w => x => f(g(h(s(t(u(v(w(x))))))));
// $composeN :: n -> (xn -> t) -> ... -> (x2 -> x3) -> (x1 -> x2) -> x1 -> t
const $composeN = n => $curryN(m)($apply_);

module.exports = { $compose, $compose3, $compose4, $compose5, $compose6, $compose7, $compose8, $composeN };
