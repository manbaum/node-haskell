
"use strict"

const { makeGet, makeValue, defineProps } = require("../langutil");

// instance Functor Buffer where
// $fmap :: (Byte -> a) -> Buffer -> Buffer
const fmap = f => fa => fa.map(f);

defineValue(Buffer)("fmap")(fmap);

// instance Applicative Buffer where
// pure   :: a -> Buffer
const pure   = a => Buffer.from(a);
// fapply :: [Byte -> a] -> Buffer -> Buffer
const fapply = ff => fa => Buffer.concat(ff.map(f => Buffer.$fmap(f)(fa)));


let props = {};
makeValue(props)("pure")(pure);
makeValue(props)("fapply")(fapply);
defineProps(Buffer);

// instance Monoid Buffer where
// mempty  :: Buffer a
const mempty  = () => Buffer.of();
// mappend :: Buffer a -> Buffer a -> Buffer a
const mappend = x => y => Buffer.concat([Buffer.from(x), Buffer.from(y)]);

let props = {};
makeGet(props)("mempty")(mempty);
makeValue(props)("mappend")(mappend);
defineProps(Buffer)(props);
