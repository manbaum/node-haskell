
"use strict"

const { makeGet, makeValue, defineProps } = require("../langutil");

// instance Functor [a] where
//       fmap :: (a -> b) -> [a] -> [b]
const    fmap =  f => fa => fa.map(f);

// instance Applicative [a] where
//       pure :: a -> [a]
const    pure =  a => [a];
//     fapply :: [a -> b] -> [a] -> [b]
const  fapply =  ff => fa => mconcat(ff.map(f => fa.map(f)));

// instance Monoid [a] where
//     mempty :: [a]
const  mempty =  _ => [];
//    mappend :: [a] -> [a] -> [a]
const mappend =  x => y => Array.from(x).concat(Array.from(y));
//    mconcat :: [[a]] -> [a]
const mconcat =  xs => Array.prototype.concat.apply([], xs);

// instance Monad [a] where
//      mbind :: [a] -> (a -> [b]) -> [b]
const   mbind =  as => f => mconcat(as.map(f));

let props = {};
makeValue(props)("fmap"   )(fmap);
makeValue(props)("pure"   )(pure);
makeValue(props)("fapply" )(fapply);
makeGet  (props)("mempty" )(mempty);
makeValue(props)("mappend")(mappend);
makeValue(props)("mconcat")(mconcat);
makeValue(props)("mbind"  )(mbind);
defineProps(Array)(props);
