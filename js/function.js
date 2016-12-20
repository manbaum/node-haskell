
"use strict"

const { makeGet, makeValue, defineProps } = require("../langutil");
const { $compose } = require("../compose");
const { $K, $S } = require("../ski");
const { mempty$, mappend$ } = require("../monoid");

// instance Functor (r -> a) where
// fmap :: (a -> b) -> (r -> a) -> (r -> b)
const fmap = $compose;

// instance Applicative (r -> a) where
// pure   :: a -> (r -> a)
const pure   = $K;
// fapply :: (r -> (a -> b)) -> (r -> a) -> (r -> b)
const fapply = $S;

// instance Monoid m => Monoid (a -> m) where
// $mempty  :: M -> a -> m
const fmempty  = M => a => mempty$(M);
// $mappend :: M -> (a -> m) -> (a -> m) -> (a -> m)
const fmappend = M => f => g => a => mappend$(M)(f(a))(g(a));

let props = {};
defineValue(Function)("fmap")(fmap);
makeValue(props)("pure")(pure);
makeValue(props)("fapply")(fapply);
makeValue(props)("fmempty")(fmempty);
makeValue(props)("fmappend")(fmappend);
defineProps(Function)(props);
