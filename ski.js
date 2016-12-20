
"use strict"

// $I :: x -> x
const $I = x => x;
// $K :: x -> y -> x
const $K = x => y => x;
// $S :: (z -> a -> t) -> (z -> a) -> z -> t
const $S = x => y => z => x(z)(y(z));

module.exports = { $I, $K, $S };
